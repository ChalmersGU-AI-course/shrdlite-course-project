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
    //useful function from dictionary
    //getValue(key) : value
    //setValue(key,value)
    var globalDic  = new collections.Dictionary<string,string>();


    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        // This returns a dummy interpretation involving two random objects in the world
        // var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        // var a = objs[getRandomInt(objs.length)];
        // var b = objs[getRandomInt(objs.length)];
        // var intprt : Literal[][] = [[
        //     {pol: true, rel: "ontop", args: [a, "floor"]},
        //     {pol: true, rel: "holding", args: [b]}
        // ]];


        console.log(cmd);
        console.log(state);
        var intprt : Literal[][] = [];
        var temp : string[] = [];

        temp.push(cmd.cmd);
        globalDic.setValue(cmd.cmd,"cmd");


        //case take cmd (ent)
        //parse the result from cmd into new finite Array
        if(cmd.cmd == "take"){
            var currentEnt = cmd.ent;

            temp.push(currentEnt.quant);
            globalDic.setValue(currentEnt.quant,"quant");


            if(currentEnt.obj != null){
                var objArrays = recursiveObject(currentEnt.obj);
                temp = temp.concat(objArrays);
            }


        }

        //case move cmd (ent,loc)
        //parse the result from cmd into new finite Array
        if(cmd.cmd == "move"){
            var currentEnt = cmd.ent;
            var currentLoc = cmd.loc;

            temp.push(currentEnt.quant);
            globalDic.setValue(currentEnt.quant,"quant");

            if(currentEnt.obj != null){
                var objArrays = recursiveObject(currentEnt.obj);
                temp = temp.concat(objArrays);
            }

            if(currentLoc != null){
                var objArrays = recursiveLocation(currentLoc);
                temp = temp.concat(objArrays);
            }
        }

        console.log(temp);

        //add new rule according to parsed array
        var newRules = genRule(temp,state);
        intprt.push(newRules);



        return intprt;
    }

    //generate rule from prepared array
    //for example , 
    // query : put the black ball in a box on the floor
    // temp = ["move","the","black","ball","inside","any","box","ontop","the","floor"]
    //modify some algorithm here to properly generate new rule. e.g. inside(a,b), ontop(a,b)
    function genRule(temp : string[], state : WorldState) : Literal[] {
        var rules : Literal[] = [];
        var forms : Array<string> = [];

        var argMax = 0;
        var argFilled = 0;

        var relEmpty = false;
        var formEmpty = true;


        var sRel = "";
        var sSize = "";
        var sColor = "";
        var sForm = "";
        var objArg1 = "";
        var objArg2 = "";

        for(var i = 0;i < temp.length ; i++){
            var keyword = temp[i];
            var keytype = globalDic.getValue(keyword);

            //skipped quant
            if(keytype == "quant"){
                //...
            }
            if(keytype == "cmd" && keyword == "take"){
                relEmpty = false;
                sRel = "holding";
                argMax = 1;
            }
            
            if(keytype == "size"){
                sSize = keyword;
            }
            if(keytype == "color"){
                sColor = keyword;
            }
            if(keytype == "form"){
                formEmpty = false;
                sForm = keyword;
            }
            if(keytype == "rel"){
                relEmpty = false;
                sRel = keyword;
                argMax = 2;
            }

            if(!formEmpty){
                //get object representation in world
                var objRep = searchObject(sSize,sColor,sForm,state);
                forms.push(objRep);

                if(argFilled == 0){
                    argFilled++;
                    objArg1 = objRep;

                }else if(argFilled == 1){
                    argFilled++;
                    objArg2 = objRep;
                }

            }

            if(argFilled == argMax && !relEmpty){
                if(argMax == 1){
                    var newRule : Literal = {pol: true, rel: sRel, args: [objArg1]};
                    rules.push(newRule);
                }else if(argMax == 2){
                    var newRule : Literal = {pol: true, rel: sRel, args: [objArg1,objArg2]};
                    rules.push(newRule);
                }

                argMax = 0;
                argFilled = 0;

                sRel = "";
                sSize = "";
                sColor = "";
                sForm = "";
                objArg1 = "";
                objArg2 = "";

                formEmpty = true;
                relEmpty = true;
            }

        }
        // construct new rule after loop ended using previous form
        if(forms.length > 1){
            var n = forms.length;

                if(argMax == 1){
                    var newRule : Literal = {pol: true, rel: sRel, args: [forms[n - 1]]};
                    rules.push(newRule);
                }else if(argMax == 2){
                    var newRule : Literal = {pol: true, rel: sRel, args: [forms[n - 1],forms[n - 2]]};
                    rules.push(newRule);
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

