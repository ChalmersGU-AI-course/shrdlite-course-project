///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Astar/collections.ts"/>


module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types


    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            interpretations.push(intprt);
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

        console.log(cmd);
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
        if(cmd.cmd == "move"){
            var currentEnt = cmd.ent;
            var currentLoc = cmd.loc;

            tokens.push(currentEnt.quant);
            globalDic.setValue(currentEnt.quant,"quant");

            if(currentEnt.obj != null){
                var objArrays = recursiveObject(currentEnt.obj);
                tokens = tokens.concat(objArrays);
            }

            if(currentLoc != null){
                var objArrays = recursiveLocation(currentLoc);
                tokens = tokens.concat(objArrays);
            }
        }

        console.log(tokens);

        //add new rule according to parsed array
        var newRules = genRule(tokens,state);
        if(newRules != null){
            intprt.push(newRules);
        }
        else return [];


        return intprt;
    }

    //generate rule from prepared array
    //for example , 
    // query : put the black ball in a box on the floor
    // tokens = ["move","the","black","ball","inside","any","box","ontop","the","floor"]
    //modify some algorithm here to properly generate new rule. e.g. inside(a,b), ontop(a,b)
    function genRule(tokens : string[], state : WorldState) : Literal[] {
       
        var rules : Literal[] = [];

        var selPol = true;
        var selRel = "";
        var foundRel = false;
        var foundForm = false;
        var maxArg = 0;
        var currentArg = 0;
        var selSize = "";
        var selColor = "";
        var selForm = "";
        var prevObj = "";

        //case take cmd
        if(tokens[0] == "take"){
            selPol = true;
            selRel = "holding";
            foundRel = true;
            maxArg = 1;
            currentArg = 0;
        }
        //case put cmd
        if(tokens[0] == "put"){
            selPol = false;
            selRel = "holding";
            foundRel = true;
            foundForm = true;
            maxArg = 2;
            currentArg = 1;

            //hard code for testing
            //the object "e" should be the value from state.holding
            var newRule : Literal = {pol: selPol, rel: selRel, args: ["e"]};
            rules.push(newRule);
            prevObj = "e";

        }
        //case move cmd
        if(tokens[0] == "move"){
            selPol = true;
            selRel = "";
            foundRel = false;
            maxArg = 2;
            currentArg = 0;
        }

        for(var i = 1;i < tokens.length; i++){

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
                    currentArg++;
                    break;
                case "rel":
                    selRel = token;
                    foundRel = true;
                    maxArg = 2;
                    break;
                case "quant": 
                    //... to do
                    break;

                default:
                    console.log("token error...");

            }
            if(currentArg != maxArg && !foundRel && foundForm){
                var currentObj = searchObject(selSize,selColor,selForm,state);
                if(currentObj == ""){
                    return null;
                }

                foundForm = false;
                selSize = "";
                selColor = "";
                selForm = "";
                prevObj = currentObj;

            }

            if(currentArg == maxArg && foundRel && foundForm){
                var currentObj = searchObject(selSize,selColor,selForm,state);

                if(currentObj == ""){
                    return null;
                }

                if(maxArg == 1){
                    var newRule : Literal = {pol: selPol, rel: selRel, args: [currentObj]};
                    rules.push(newRule);

                    selPol = true;
                    selRel = "";
                    foundRel = false;
                    foundForm = false;
                    maxArg = 2;
                    currentArg = 1;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                    prevObj = currentObj;

                }else if(maxArg == 2){
                    var newRule : Literal = {pol: true, rel: selRel, args: [prevObj,currentObj]};
                    rules.push(newRule);

                    selPol = true;
                    selRel = "";
                    foundRel = false;
                    foundForm = false;
                    maxArg = 2;
                    currentArg = 1;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                    prevObj = currentObj;

                }
            }
        }


        return rules;
    }

    //search object representation from size, color, form
    //return an object representation in current world e.g. "a", "b", "c"
    //return emptystring if there is no object found in current world so it means that impossible to be solved
    function searchObject(size : string, color : string, form : string, state : WorldState) : string {

        //it can match more than 1 object that can cause ambiguous
        //but skipped ambiguous by now so it always match the first item in current world
        
        if(form == "floor")
            return "floor";

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
                return objs[i];
            }
        }
       return ""; 

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

