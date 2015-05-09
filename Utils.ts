
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


