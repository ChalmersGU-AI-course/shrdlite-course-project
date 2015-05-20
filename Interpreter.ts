///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="AstarPlanner/collections.ts"/>


module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types


    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            var result = interpretCommand(intprt.prs, currentState);

            if(result !== null){
                intprt.intp = result;
                interpretations.push(intprt);
            }

        });
        if (interpretations.length) {
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


    export interface Result extends Parser.Result {intp:Literal[][];}
    export interface Literal {pol:boolean; rel:string; args:string[];}


    export function interpretationToString(res : Result) : string {
        return res.intp.map((lits) => {
            return lits.map((lit) => literalToString(lit)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit : Literal) : string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }


    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    //dictionary to store pair of information.
    //e.g. (take,cmd)  (white,color)  (ball,form)
    //useful functions from dictionary
    //getValue(key) : value
    //setValue(key,value)
    var globalDic  = new collections.Dictionary<string,string>();


    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {

        // console.log(cmd);
        console.log(state);
        var intprt : Literal[][] = [];
        var tokens : string[] = [];

        tokens.push(cmd.cmd);
        globalDic.setValue(cmd.cmd,"cmd");


        //case take||grasp||pickup entity === take ent
        //parse the result from cmd into new finite Array named tokens
        if(cmd.cmd == "take"){
            var currentEnt = cmd.ent;

            tokens.push(currentEnt.quant);
            globalDic.setValue(currentEnt.quant,"quant");


            if(currentEnt.obj != null){
                var objArrays = recursiveObject(currentEnt.obj);
                tokens = tokens.concat(objArrays);
            }


        }

        //case move||put||drop "it" loc === put loc
        //parse the result from cmd into new finite Array named tokens
        if(cmd.cmd == "put"){
            var currentLoc = cmd.loc;

            if(currentLoc != null){
                var objArrays = recursiveLocation(currentLoc);
                tokens = tokens.concat(objArrays);
            }

        }

        //case move||put||drop entity location === move ent loc
        //parse the result from cmd into new finite Array named tokens
        //separated by x to support ambiguous 
        if(cmd.cmd == "move"){
            var currentEnt = cmd.ent;
            var currentLoc = cmd.loc;

            tokens.push(currentEnt.quant);
            globalDic.setValue(currentEnt.quant,"quant");

            if(currentEnt.obj != null){
                var objArrays = recursiveObject(currentEnt.obj);
                tokens = tokens.concat(objArrays);
                tokens.push("x");
            }

            if(currentLoc != null){
                var objArrays = recursiveLocation(currentLoc);
                tokens = tokens.concat(objArrays);
            }
        }

        console.log(tokens);

        //add new rule according to parsed array
        var newRules = genRule(tokens,state);
        if(newRules !== null){
            intprt.push(newRules);
        }
        else return null;


        return intprt;
    }

    //generate rule from prepared array
    //for example , 
    // query : put the black ball in a box on the floor
    // tokens = ["move","the","black","ball","inside","any","box","ontop","the","floor"]
    //modify some algorithm here to properly generate new rule. e.g. inside(a,b), ontop(a,b)
    function genRule(tokens : string[], state : WorldState) : Literal[] {
       
        var rules : Literal[] = [];

        var foundForm = false;
        var selSize = "";
        var selColor = "";
        var selForm = "";

        //case take cmd
        if(tokens[0] == "take"){
            var rels : string[] = [];
            var objs : string[][] = [];

            for(var i =1;i< tokens.length ;i++){

                var token = tokens[i];
                var tokenType = globalDic.getValue(token);

                switch(tokenType) {

                    case "size":
                        selSize = token;
                        break;
                    case "color":
                        selColor = token;
                        break;
                    case "form":
                        selForm = token;
                        foundForm = true;
                        break;
                    case "rel":
                        rels.push(token)
                        break;
                    case "quant": 
                        //... to do
                        break;
                }

                if(foundForm){
                    var founds = searchObject(selSize,selColor,selForm,state);
                    objs.push(founds);
                    foundForm = false;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                }
            }

            var goalObj = findObject(objs,rels,state);
            if(goalObj == "")
                return null;
            else 
                return [{pol:true, rel:"holding", args:[goalObj]}];

        }
        //case put cmd
        if(tokens[0] == "put"){
            var rels : string[] = [];
            var objs : string[][] = [];
            var sRel = tokens[1];
            var splitIndex = 1;
            var foundX = false;
            var objA = state.holding;
            var objB = "";

            for(var i = 2;i< tokens.length ;i++){

                var token = tokens[i];
                var tokenType = globalDic.getValue(token);

                switch(tokenType) {

                    case "size":
                        selSize = token;
                        break;
                    case "color":
                        selColor = token;
                        break;
                    case "form":
                        selForm = token;
                        foundForm = true;
                        break;
                    case "rel":
                        rels.push(token)
                        break;
                    case "quant": 
                        //... to do
                        break;
                }

                if(foundForm){
                    var founds = searchObject(selSize,selColor,selForm,state);
                    objs.push(founds);
                    foundForm = false;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                }
            }

            objB = findObject(objs,rels,state);
            if(objB == "z")
                objB = "floor";

            if(objA == "" || objB == ""){
                return null;
            }
            else
                return [{pol:true, rel:sRel, args:[objA,objB]}];

        }

        //case move cmd
        if(tokens[0] == "move"){
            var rels : string[] = [];
            var objs : string[][] = [];
            var sRel = "";
            var splitIndex = 1;
            var foundX = false;
            var objA = "";
            var objB = "";

            for(var i =1;i< tokens.length ;i++){

                var token = tokens[i];
                var tokenType = globalDic.getValue(token);

                switch(tokenType) {

                    case "size":
                        selSize = token;
                        break;
                    case "color":
                        selColor = token;
                        break;
                    case "form":
                        selForm = token;
                        foundForm = true;
                        break;
                    case "rel":
                        if(foundX){
                            foundX = false;
                            sRel = token;
                        }else{
                            rels.push(token)
                        }
                        break;
                    case "quant": 
                        //... to do
                        break;

                    default:
                        //case "x" for ambiguous
                        splitIndex = i;
                        foundX = true;
                }

                if(foundForm){
                    var founds = searchObject(selSize,selColor,selForm,state);
                    objs.push(founds);
                    foundForm = false;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                }

                if(foundX){
                    objA = findObject(objs,rels,state);
                    rels = [];
                    objs = [];
                }
            }

            objB = findObject(objs,rels,state);
            if(objB == "z")
                objB = "floor";

            if(objA == "" || objB == ""){
                return null;
            }
            else
                return [{pol:true, rel:sRel, args:[objA,objB]}];


        }

    }

    function findObject(objs : string[][], rels : string[], state : WorldState) : string {
        console.log(objs);

        //case simple object, no relation
        if(rels.length == 0){
            //no object found
            if(objs.length == 0){
                return "";
            }
            else{
                return objs[0][0];
            }
        }
        else{
            var combinations = allCombinations(objs);
            console.log(combinations);

            for(var i = 0 ;i < combinations.length; i++){

                var combArray = combinations[i].split("");

                if(checkValidObject(combArray,rels,state)){
                    return combArray[0];
                }
            }

        }

        return "";

    }

    function checkValidObject(objs : string[], rels : string[], state : WorldState) : boolean {
        var numberOfLoop = rels.length;
        for(var i = 0;i< numberOfLoop; i++){
            if(!checkPredicate(objs[i],objs[i+1],rels[i],state)){
                return false;
            }
        }

        return true;
    }

    interface stackPosition {x:number; y:number;};

    // Function for finding the x and y position of an object in the stacks (x = column, y = row)
    function getStackLocation(object : string , state : WorldState) : stackPosition {
        for(var x = 0; x < state.stacks.length ; x++){
            for(var y = 0 ; y < state.stacks[x].length ; y++){
                if(state.stacks[x][y] == object){
                    return {x:x, y:y};
                }
            }
        }
    }

    function checkPredicate(obj1 : string, obj2 : string, rel : string, state : WorldState) : boolean {
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
                //it should somehow check that obj1 should be in form of Box otherwise return error
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
                result = ((a_loc.x == (b_loc.x +1)) || (a_loc.x == (b_loc.x -1)))  && (a_loc.y == b_loc.y);
                break;
            case "leftof":
                result = (a_loc.x == (b_loc.x -1)) && (a_loc.y == b_loc.y);
                break;
            case "rightof":
                result = (a_loc.x == (b_loc.x +1)) && (a_loc.y == b_loc.y);
                break;
        }

        console.log(result);
        return result;
    }


    function checkLaws(obj1 : string, obj2 : string, rel : string, state : WorldState) : boolean {

        var detail1 = state.objects[obj1];
        var detail2 = state.objects[obj2];

        var result = false;

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
                break;
            default:
            result = true;   

        }


        return result;
    }

    function allCombinations(arr) {
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


    //search object representation from size, color, form
    //return an object representation in current world e.g. "a", "b", "c"
    //return emptystring if there is no object found in current world so it means that impossible to be solved
    function searchObject(size : string, color : string, form : string, state : WorldState) : string[] {

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
       // console.log(results);
       return results; 

    }

    //traverse through object to get finite array
    function recursiveObject(currentObj : Parser.Object) : string[] {
        var temp : string[] = [];

        //case1 object
        if(currentObj.obj != null) {
            var objArrays = recursiveObject(currentObj.obj);
            temp = temp.concat(objArrays);
        }

        //case2 location
        if(currentObj.loc != null) {
            var objArrays = recursiveLocation(currentObj.loc);
            temp = temp.concat(objArrays);
        }

        //case3 size color form
        if(currentObj.size != null){
            temp.push(currentObj.size);
            globalDic.setValue(currentObj.size,"size");
        }
        
        if(currentObj.color != null){
            temp.push(currentObj.color);
            globalDic.setValue(currentObj.color,"color");

        }

        if(currentObj.form != null){
            temp.push(currentObj.form);
            globalDic.setValue(currentObj.form,"form");
        }

        return temp;

    }

    //traverse through object to get finite array
    function recursiveLocation(currentLoc : Parser.Location) : string[] {
        var temp : string[] = [];

        if(currentLoc.rel != null){
            temp.push(currentLoc.rel);
            globalDic.setValue(currentLoc.rel,"rel");

        }

        if(currentLoc.ent != null){
            var newEnt = currentLoc.ent;
            temp.push(newEnt.quant);
            globalDic.setValue(newEnt.quant,"quant");

         
          if(newEnt.obj != null) {
                var objArrays = recursiveObject(newEnt.obj);
                temp = temp.concat(objArrays);
            }

        }

        return temp;

    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

