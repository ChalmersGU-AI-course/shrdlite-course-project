///<reference path="World.ts"/>


module Validate {


	export interface stackPosition {x:number; y:number;};

    // Function for finding the x and y position of an object in the stacks (x = column, y = row)
    export function getStackLocation(object : string , state : WorldState) : stackPosition {
        for(var x = 0; x < state.stacks.length ; x++){
            for(var y = 0 ; y < state.stacks[x].length ; y++){
                if(state.stacks[x][y] == object){
                    return {x:x, y:y};
                }
            }
        }
    }

    //search object representation from size, color, form
    //return an object representation in current world e.g. "a", "b", "c"
    //return emptylist if there is no object found in current world so it means that impossible to be solved
    export function searchObject(size : string, color : string, form : string, state : WorldState) : string[] {

        var results : string[] = [];

        if(form == "floor")
            return ["z"];

        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var matchCount = 0;
        var maxMatchCount = 0;

        if(size != "")
            maxMatchCount++;

        if(color != "")
            maxMatchCount++;

        if(form != "")
            maxMatchCount++;

        for(var i = 0;i < objs.length ; i++){

            var details = state.objects[objs[i]];
            matchCount = 0;

            if(size == details.size){
                matchCount++;
            }
            if(color == details.color){
                matchCount++;
            }
            if(form == "anyform" || form == details.form){
                matchCount++;
            }

            if(matchCount == maxMatchCount){
                results.push(objs[i]);
            }
        }

       return results; 

    }

    //check physical laws
    export function checkLaws(obj1 : string, obj2 : string, rel : string, state : WorldState) : boolean {

        var detail1 = state.objects[obj1];
        var detail2 = state.objects[obj2];
        var result = true;

        if(obj2 == "z"){
            detail2 = {form:"floor", size:"", color:""};
        }

        if(obj1 == obj2){
            return false;
        }

        switch(rel){
            case "inside":
                if(detail2.form == "box"){
                    if(detail2.size == "small"){
                        result = (detail1.size == "small") && (detail1.form == "brick" || detail1.form == "ball" || detail1.form == "table");
                    }
                    if(detail2.size == "large"){
                        result = detail1.size == "small" || detail1.form == "brick" || detail1.form == "ball" || detail1.form == "table";
                    }
                }
                else{
                    result = false;
                }

                break;
            case "ontop":
                if(detail1.form == "ball"){
                    result = (detail2.form == "floor");
                }
                else if(detail2.form == "box"){
                    result = false;
                }
                else if(detail2.form == "ball"){
                    result = false;
                }
                else{
                    if(detail1.size == "large" && detail2.size == "small"){
                        result = false;
                    }
                    if(detail1.size == "small" && detail1.form == "box"){
                        if(detail2.size == "small" && (detail2.form == "brick" || detail2.form == "pyramid")){
                            result = false;
                        }
                    }
                    if(detail1.size == "large" && detail1.form == "box"){
                        if(detail2.size == "large" && detail2.form == "pyramid"){
                            result = false;
                        }
                    }
                }
                break;
            case "under":
                if(detail1.form == "ball"){
                    result = false;
                }     
                break;        
            case "above":
                if(detail2.form == "ball"){
                    result = false;
                }
                if(detail1.form == "ball" && detail1.size == "large"){
                    if(detail2.size == "small"){
                        result = false;
                    }
                }
                break; 

        }
        return result;
    }

    //check spatial relation according to the current world.
    export function checkPredicate(obj1 : string, obj2 : string, rel : string, state : WorldState) : boolean {
        var a_loc = getStackLocation(obj1,state);
        var b_loc = getStackLocation(obj2,state);

        //special case for "floor"
        if(obj2 == "z"){
            if(a_loc.y == 0)
                return true;
            else
                return false;
        }
        if(obj1 == "z")
            return null;

        var result = false;

        switch(rel){
            case "inside":
                //consider it as ontop case but it will be checked about laws later
                result = (a_loc.x == b_loc.x) && (a_loc.y == (b_loc.y + 1));
                break;
            case "ontop":
                result = (a_loc.x == b_loc.x) && (a_loc.y == (b_loc.y + 1));
                break;
            case "above":
                result = (a_loc.x == b_loc.x) && (a_loc.y > b_loc.y);
                break;
            case "under":
                result = (a_loc.x == b_loc.x) && (a_loc.y < b_loc.y);
                break;
            case "beside":
                result = ((a_loc.x == (b_loc.x +1)) || (a_loc.x == (b_loc.x -1)));
                break;
            case "leftof":
                result = (a_loc.x < b_loc.x);
                break;
            case "rightof":
                result = (a_loc.x > b_loc.x);
                break;
        }

        return result;
    }

    //check that the given objects are satisfy all spatial relation or not.
    export function checkValidObject(objs : string[], rels : string[], state : WorldState) : boolean {
        var numberOfLoop = rels.length;
        for(var i = 0;i< numberOfLoop; i++){
            if(!checkPredicate(objs[0],objs[i+1],rels[i],state)){
                return false;
            }
        }
        return true;
    }

    //generate all possible combinations
    export function allCombinations(arr) {
        if (arr.length == 1) {
            return arr[0];
        } else {
            var result = [];
            var allCasesOfRest = allCombinations(arr.slice(1));  // recur with the rest of array
            for (var i = 0; i < allCasesOfRest.length; i++) {
              for (var j = 0; j < arr[0].length; j++) {
                result.push(arr[0][j] + allCasesOfRest[i]);
              }
            }
            return result;
        }
    }

    export function findObject(objs : string[][], rels : string[], state : WorldState) : string[] {
        var result : string[] = [];

        //case simple object, no relation
        if(rels.length == 0){
            //no object found
            if(objs.length == 0){
                return [];
            }
            else{
                return objs[0];
            }
        }
        else{
            var combinations = allCombinations(objs);

            for(var i = 0 ;i < combinations.length; i++){

                var combArray = combinations[i].split("");

                if(checkValidObject(combArray,rels,state)){
                    result.push(combArray[0]);
                }
            }

        }

        return result;

    }

}