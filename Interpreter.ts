///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Astar/collections.ts"/>
///<reference path="Parsetoken.ts"/>
///<reference path="Validate.ts"/>


module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types


    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            var result = interpretCommand(intprt.prs, currentState);

            if(result !== null){
                intprt.intp = result.literals;
                intprt.speech = result.speech;
                interpretations.push(intprt);
            }

        });
        if (interpretations.length) {
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }

    export interface PairOfResult { literals : Literal[][]; speech : string[];}

    export interface Result extends Parser.Result {intp:Literal[][]; speech:string[];}

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

    //dictionary to store (token,type) of information.
    //e.g. (take,cmd)  (white,color)  (ball,form)
    var globalDic  = new collections.Dictionary<string,string>();

    function interpretCommand(cmd : Parser.Command, state : WorldState) : PairOfResult {

        //convert Parser.Command into (Tokens,Dic)
        var dicToken = Parsetoken.interpretToken(cmd);
        globalDic = dicToken.dic;

        //add new rule according to parsed array
        var newRules = genRule(dicToken.tokens,state);
        if(newRules !== null){
            return {literals:newRules, speech:dicToken.tokens};
        }
        else 
            return null;

    }

    //generate predicate rules from tokens
    function genRule(tokens : string[], state : WorldState) : Literal[][] {
       
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
                        if(token == "all")
                            throw new Interpreter.Error("The arm cannot take more than 1 object");
                        break;
                }

                if(foundForm){
                    var founds = Validate.searchObject(selSize,selColor,selForm,state);
                    objs.push(founds);
                    foundForm = false;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                }
            }

            var goalObj = Validate.findObject(objs,rels,state);
            var allGoals : Literal[][] = [];
            if(goalObj.length == 0)
                return null;
            else{
                for(var i = 0;i < goalObj.length;i++){
                    allGoals.push([{pol:true, rel:"holding", args:[goalObj[i]]}]);
                }
                return allGoals;
            }

        }
        //case put cmd
        if(tokens[0] == "put"){
            var rels : string[] = [];
            var objs : string[][] = [];
            var sRel = tokens[1];
            var splitIndex = 1;
            var foundX = false;
            var objA = state.holding;
            var objB : string[] = [];
            var pluralFound = false;

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
                        if(token == "all" || token == "every"){
                            pluralFound = true;
                        }
                        break;
                }

                if(foundForm){
                    var founds = Validate.searchObject(selSize,selColor,selForm,state);
                    objs.push(founds);
                    foundForm = false;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                }
            }

            objB = Validate.findObject(objs,rels,state);

            if(objA === null || objA == ""){
                throw new Interpreter.Error("There is no item to drop.");
            }

            if(objB.length == 0){
                return null;
            }

            //check physical laws
            var allGoals : Literal[][] = [];
            var allQuantGoals : Literal[] = [];

            for(var i = 0 ;i < objB.length; i++){

                if(Validate.checkLaws(objA,objB[i],sRel,state)){
                    if(pluralFound){
                        if(objB[i] == "z"){
                            allQuantGoals.push({pol:true, rel:sRel, args:[objA,"floor"]});
                        }
                        else {
                            allQuantGoals.push({pol:true, rel:sRel, args:[objA,objB[i]]});
                        }
                    }
                    else{
                        if(objB[i] == "z"){
                            allGoals.push([{pol:true, rel:sRel, args:[objA,"floor"]}]);
                        }
                        else {
                            allGoals.push([{pol:true, rel:sRel, args:[objA,objB[i]]}]);
                        }
                    }
                }
            }
            if(pluralFound){
                if(allQuantGoals.length > 0){
                    if(allQuantValidate(allQuantGoals)){
                        var grouped = groupRules(allQuantGoals,false,true);
                        return grouped;
                    }
                    else
                        throw new Interpreter.Error("Physical Laws error.");
                }
                else
                    throw new Interpreter.Error("Physical Laws error.");
            }

            if(allGoals.length > 0){
                return allGoals;
            }
            else
                throw new Interpreter.Error("Physical Laws error.");

        }

        //case move cmd
        if(tokens[0] == "move"){
            var rels : string[] = [];
            var objs : string[][] = [];
            var sRel = "";
            var splitIndex = 1;
            var foundX = false;
            var objA_move : string[] = [];
            var objB_move : string[] = [];
            var pluralFound = false;
            var allQuantLeft = false;
            var allQuantRight = false;
            var foundSplited = false;

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
                        }
                        else{
                            rels.push(token)
                        }
                        break;
                    case "quant": 
                        if(token == "all" || token == "every"){
                            pluralFound = true;
                            if(foundSplited){
                                allQuantRight = true;
                            }
                            else{
                                allQuantLeft = true;
                            }
                        }
                        break;

                    default:
                        //other case for ambiguity
                        splitIndex = i;
                        foundX = true;
                        foundSplited = true;
                }

                if(foundForm){
                    var founds = Validate.searchObject(selSize,selColor,selForm,state);
                    objs.push(founds);
                    foundForm = false;
                    selSize = "";
                    selColor = "";
                    selForm = "";
                }

                if(foundX){
                    objA_move = Validate.findObject(objs,rels,state);
                    rels = [];
                    objs = [];
                }
            }

            objB_move = Validate.findObject(objs,rels,state);

            if(objA_move.length == 0 || objB_move.length == 0){
                return null;
            }

            //check physical laws
            var objsLaw : string[][] = [];
            objsLaw.push(objA_move);
            objsLaw.push(objB_move);

            var combs = Validate.allCombinations(objsLaw);
            var allGoals : Literal[][] = [];
            var allQuantGoals : Literal[] = [];
            var isAllValid = false;

            combs = combs.filter(function(elem, pos) {
                return combs.indexOf(elem) == pos;
            }); 

            for(var i = 0 ;i < combs.length; i++){

                var combArray = combs[i].split("");
                if(Validate.checkLaws(combArray[0],combArray[1],sRel,state)){

                    if(pluralFound){
                        if(combArray[1] == "z"){
                            allQuantGoals.push({pol:true, rel:sRel, args:[combArray[0],"floor"]});
                        }
                        else {
                            allQuantGoals.push({pol:true, rel:sRel, args:[combArray[0],combArray[1]]});
                        }
                    }
                    else{
                        if(combArray[1] == "z"){
                            allGoals.push([{pol:true, rel:sRel, args:[combArray[0],"floor"]}]);
                        }
                        else {
                            allGoals.push([{pol:true, rel:sRel, args:[combArray[0],combArray[1]]}]);
                        }
                    }
                }
            }
            if(pluralFound){
                if(allQuantGoals.length > 0){
                    if(allQuantValidate(allQuantGoals)){
                        var grouped = groupRules(allQuantGoals,allQuantLeft,allQuantRight);
                        return grouped;
                    }
                    else
                        throw new Interpreter.Error("Physical Laws error.");
                }
                else
                    throw new Interpreter.Error("Physical Laws error.");
            }

            if(allGoals.length > 0){
                return allGoals;
            }
            else
                throw new Interpreter.Error("Physical Laws error.");
        }
    }

    //check that the Literal relation should not be ontop,inside
    //because there is no way to put all objects inside/ontop a single object 
    function allQuantValidate(literals : Literal[]) : boolean {

        var sRel = literals[0].rel;
        if(sRel == "ontop" || sRel == "inside"){
            if(literals[0].args[1] == "floor"){
                return true;
            }
            else 
                return false;
        }
        else 
            return true;

    }

    //group the Literals to achieve all quantifier
    function groupRules(literals : Literal[], left : boolean, right : boolean) : Literal[][] {

        var result : Literal[][] = [];
        var occurences = 1;

        //case all quantifier on left hand side
        if(left && !right){

            var sorted = literals.sort(sortHelperR);

            for(var i =0;i < sorted.length - 1;i++){
                if(sorted[i].args[1] != sorted[i+1].args[1]){
                    occurences++;
                }
            }
            var chunk = sorted.length / occurences;

            for (var i=0; i < sorted.length; i+=chunk) {
                var temp = sorted.slice(i,i+chunk);
                result.push(temp);
            }
        }

        //case all quantifier on right hand side
        if(!left && right){

            for(var i =0;i < literals.length - 1;i++){
                if(literals[i].args[1] != literals[i+1].args[1]){
                    occurences++;
                }
            }

            var sorted = literals.sort(sortHelperL);
            for (var i=0; i < sorted.length; i+=occurences) {
                var temp = sorted.slice(i,i+occurences);
                result.push(temp);
            }

        }

        //case all quantifier for both object
        if(left && right){
            result.push(literals);
        }

        return result;
    }

    //helper function to sort Literal based on left argument.
    //e.g. inside(a,x), inside(b,x), inside(c,x)
    function sortHelperL(a : Literal, b :Literal){

        if(a.args[0] < b.args[0]){
            return -1;
        }
        else if(a.args[0] > b.args[0]){
            return 1;
        }
        return 0;

    }

    //helper function to sort Literal based on right argument
    //e.g. inside(x,a), inside(x,b), inside(x,c)
    function sortHelperR(a : Literal, b :Literal){

        if(a.args[1] < b.args[1]){
            return -1;
        }
        else if(a.args[1] > b.args[1]){
            return 1;
        }
        return 0;

    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

