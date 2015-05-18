///<reference path="Interpreter.ts"/>

/** Generate new ID given a state */
function generateID(state: string[][]):string{
    return prettyMat(state);
}

function prettyMat(mat: string[][]){
    var prettyString = "[";
    for(var i=0; i<mat.length; i++){
        prettyString+="[";
        for(var j=0; j<mat[i].length; j++){
            prettyString+= mat[i][j] + "";
            if(j!=mat[i].length-1){
                prettyString+=",";
            }
        }
        prettyString+="]";
        if(i!=mat.length-1){
            prettyString+=",";
        }
    }
    prettyString+="]";
    return prettyString;
}

/** Checks if the world (worldstate) is valid, given the top object, bottom object and the list of different objects */
function validPlacement(topObject: string, bottomObject: string, objects: {[s:string]: ObjectDefinition}) : boolean {
    
    //Everything can be placed on the floor
    if(bottomObject == undefined){
        return true;
    }
    
	
	//balls should be in boxes or on the floor
	if(objects[topObject].form == "ball" && objects[bottomObject].form != "box") {
		return false;
	}
    
	
	//Balls can't support anything
	if (objects[bottomObject].form == "ball") {
		return false
	}
    
	
	//Small objects can't support large objects
	if(objects[bottomObject].size == "small" && objects[topObject].size == "large") {
		return false;
	}
    
	
	// Boxes cannot contain pyramids, planks or boxes of the same size.
	if(objects[bottomObject].form == "box" && (objects[topObject].form == "pyramid" || objects[topObject].form == "plank" || objects[topObject].form == "box") && objects[bottomObject].size == objects[topObject].size) {
		return false;
	}
    
	
	//Small boxes cannot be supported by small bricks or pyramids.
	if(objects[bottomObject].form == "brick" || objects[bottomObject].form == "pyramid" && objects[topObject].form == "box" && objects[topObject].size == "small"){
		return false;
	}
    
	
	//Large boxes cannot be supported by large pyramids.
	if(objects[bottomObject].form == "pyramid" && objects[bottomObject].size == "large" && objects[topObject].form == "box" && objects[topObject].size == "large") {
		return false
	}
    
	return true;
	
}

/** Checks if first is allowed to be placed on top of second */
function validPlacementAbove(first: string, second: string, objects: {[s:string]: ObjectDefinition}) : boolean {
    //If second is a ball, then no
    if(objects[second].form == "ball"){
        return false;
    }
    
    //second är small, så måste first vara small
    if(objects[second].size == "small" && objects[first].size != "small"){
        return false;
    }
    
    
    //om first är en ball, så måste det finnas en motsvarande box i rätt storlek
    if(objects[first].form == "ball"){
        if(objects[first].size == "large"){
            //Nånstans i världen måste finnas en stor box
        } else {
            //Nånstans i världen måste det finnas en box (valfri storlek)
            //boxElement
            var foundElement = null;
            for(var element in objects){
                if(objects[element].form == "box"){
                    foundElement = element;
                    break;
                }
            }
            if(foundElement == null){
                return false;
            }
            
            if(objects[second].size == "small"){
                //boxElement måste vara litet
                if(objects[foundElement].size != "small"){
                    return false;
                }
                    
            } else {
                //Boxelement kan vara valfri storlek
            }
        }
    }
    
    //Om stor boll, så stor boxes
    //Om liten boll så måste det finnas en box. NEJ, är det undre elementet nått litet, så måste det vara en liten box
    
    
    return true;
}

function copyStack(original: string[][]):string[][]{

    var newStack: string[][] = [];

    for(var i = 0; i < original.length; i++){
    
        newStack.push([]);
        for(var j = 0; j < original[i].length; j++){
            var elementIJ = original[i][j];
            newStack[i].push(elementIJ);
        }
    }
    
    return newStack;
}

function ontop(first: string, second: string, stacks: string[][]){
    for(var i=0; i<stacks.length; i++){
        if(second == "floor"){
            if (stacks[i][0] == first){
                return true;
            }
        }else{
            for(var j=0; j<stacks[i].length; j++){
                if(j<stacks[i].length-1 &&
                   stacks[i][j+1] == first &&
                   stacks[i][j] == second){
                    return true;
                }
            }
        }
    }
    return false;
}
function above(first: string, second: string, stacks: string[][]){
    var bool = false;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(bool && stacks[i][j] == second){
                return true;
            }
            if(j<stacks.length-1 &&
               stacks[i][j] == first){
                bool = true;
            }
        }
        if(bool){
            return false;
        }
    }
    return false;
}
function under(first: string, second: string, stacks: string[][]){
    return above(second, first, stacks);
}
function beside(first: string, second: string, stacks: string[][]){
    var bool = false;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(bool){
                if (stacks[i][j] == first || stacks[i][j] == second){
                    return true;
                }else if(j==stacks[i].length){
                    return false;
                }
            }
            if(stacks[i][j] == first || stacks[i][j] == second){
                bool = true;
                break;
            }
        }
    }
    return false;
}
function left(first: string, second: string, stacks: string[][]){
    var bool = false;
    for(var i=0; i<stacks.length; i++){
        for(var j=0; j<stacks[i].length; j++){
            if(bool){
                if (stacks[i][j] == second){
                    return true;
                }else if(j==stacks[i].length){
                    return false;
                }
            }
            if(stacks[i][j] == first){
                bool = true;
                break;
            }
        }
    }
    return false;
}
function right(first: string, second: string, stacks: string[][]){
    return left(second, first, stacks);
}

function check(first: string, rel: string, second: string, stacks: string[][]){
    switch(rel){
        case "ontop": 
            return ontop(first, second, stacks);
        case "inside": 
            return ontop(first, second, stacks);
        case "above":
            return above(first, second, stacks);
        case "under":
            return under(first, second, stacks);
        case "beside":
            return beside(first, second, stacks);
        case "left":
            return left(first, second, stacks);
        case "right":
            return right(first, second, stacks);
        default:
            return false;
    }
}

function validInterpretation(int: Interpreter.Literal, objectDef: {[s:string]: ObjectDefinition}){
    switch(int.rel){
        case "ontop":
        case "inside":
            return validPlacement(int.args[0], int.args[1], objectDef);
        case "above":
            return validPlacementAbove(int.args[0], int.args[1], objectDef);
        case "under":
            //Same as above, just flipped order on the arguments
            return validPlacementAbove(int.args[1], int.args[0], objectDef);
        default:
            return true;
    }
}
