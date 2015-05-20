///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="lib/collections.ts"/>

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
        if (interpretations.length > 0) { //&& interpretations[0].intp.length > 0
            //return interpretations; //Aha found the place for disolving HARD ambiguity!
	    var validInterprets : Result [] = [];
	    interpretations.forEach((inter) => {
		if (inter.intp.length > 0)
		    validInterprets.push(inter);
	    });
	    return validInterprets;
        } else {
	    console.log(interpretations);
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

    export function canSupport(above: ObjectDefinition, below: ObjectDefinition) : boolean{
        if(below == null){
            console.log("Interpreter.canSupport(): below was NULL");
            return false; // might not be a good idea to return true, only a hotfix!
        }

        if(below.form == "floor"){
            // The floor can support any object
            return true;
        }

        var cs = compareSize(below.size, above.size);
        if(cs < 0){
            // No small object can support a large(r) one.
            return false;
        }

        if(above.form == "ball"){
            // A ball can only be supported by the floor or a box.
            return below.form == "box";
        }

        if(below.form == "ball"){
            // A ball cannot support anything
            return false;
        }

        if(below.form == "box"){
            if(cs > 0){
                return true;
            }
            // Same size, so cannot support box, pyramid or plank.
            switch(above.form){
                case "box":
                case "pyramid":
                case "plank":
                    return false;
                default:
                    return true;
            }
        }

        if(above.form == "box"){
            if(above.form == "large"){
                // Large boxes cannot be supported by (large) pyramids
                return below.form != "pyramid";
            } else {
                // Small boxes cannot be supported by small bricks or pyramids
                if(below.form == "brick" || below.form == "pyramid"){
                    return below.size != "small";
                }
            }
        }

        // Otherwise, can support
        return true;
    }

    export function isUndefined(a){
        return typeof a === 'undefined' ;
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    /**
    * Compares two sizes.
    * returns positive if a > b, 0 if a == b and negative otherwise.
    */
    function compareSize(a : string, b : string) : number{
        if (a == b){
            return 0;
        }
        if( a == "large"){
            return 1;
        }
        return -1;
    }


    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {

        var intprt : Literal[][] = [];
	var targets = findTargetEntities(cmd.ent, state).targets;
        switch(cmd.cmd){
            case "take":
                for (var ix in targets){
                    intprt.push( [
                        {pol: true, rel: "holding", args: [targets[ix]] }
                    ] );
                }
                break;
            case "move":
                var location = cmd.loc;
                var locationTargets = findTargetEntities(location.ent, state).targets;

                console.log("Target: "+locationTargets[0]);

                if(location.rel === "beside" || location.rel === "rightof" || location.rel === "leftof"){
                    moveObjBeside(state, intprt, location.rel, targets, locationTargets);
                } else if(location.rel === "under"){
                    moveObjAbove(state, intprt, "above", locationTargets, targets);
                } else {
                    moveObjAbove(state, intprt, location.rel, targets, locationTargets);
                }
                break;
	    // Still no put yet
            default:
                throw new Interpreter.Error("Interpreter: UNKNOWN cmd: " + cmd.cmd);
        }

        return intprt;
    }

    function moveObjBeside(state : WorldState, intprt, locationRel, fromList, toList){
        for (var ix in fromList){
            for(var jx in toList){
                var object1 = fromList[ix];
                var object2 = toList[jx];

                if( object1 == object2){
                    // make sure not itself
                    continue;
                }

                intprt.push( [
                    {pol: true, rel: locationRel, args: [object1, object2] }
                ] );
            }
        }
    }

    function moveObjAbove(state : WorldState, intprt, locationRel, fromList, toList){
        for (var ix in fromList){
            for(var jx in toList){
                var above = fromList[ix];
                var below = toList[jx];

                if( above == below){
                    continue;
                }

                if(! canSupport( findObjDef(state, above), findObjDef(state, below))){
                    // state.objects[above], state.objects[below])){
                    continue;
                }

                intprt.push( [
                    {pol: true, rel: locationRel, args: [above, below] }
                ] );
            }
        }
    }

    function findObjDef(state : WorldState, name : string) : ObjectDefinition{
        if(name === "floor"){
            return {form: "floor", size: null, color: null};
        } else {
            return state.objects[name];
        }
    }

    function resolveObject(state : WorldState, goalObj : Parser.Object, loc : Parser.Location) : string[]{
        var result : string[] = [];

        var possibleObjects : string[] = findTargetObjects(state, goalObj).targets;
        var possibleLocations : string[] = findTargetEntities(loc.ent, state).targets;

        for(var ox in possibleObjects){
            var obj = possibleObjects[ox];
            for(var lx in possibleLocations){
                if(isObjectInLocation(state, obj, possibleLocations[lx], loc.rel)){
                    result.push(obj);
                    break;
                }
            }
        }

        return result;
    }

    // Returns a list of Object names that fits the goal Object.
    function findTargetObjects(state : WorldState, goalObj : Parser.Object) : SearchingResult{
        var result : string[] = [];
	var com = new collections.Set<string>();
	var searchResult : SearchingResult = {status : "", targets : result, common : com};
        if(goalObj.obj != null){
            // Ie form, size etc are null.
            // Filter on location instead...
            //return resolveObject(state, goalObj.obj, goalObj.loc);
	    searchResult.targets = resolveObject(state, goalObj.obj, goalObj.loc);
	    return searchResult;
        }

        if(goalObj.form === "floor"){
            result.push("floor");
        }

        // for(var objName in state.objects){
        for(var stackNo in state.stacks){
            var currentStack = state.stacks[stackNo];
            for(var heightNo in currentStack){
                var objName = currentStack[heightNo];
                var obj : ObjectDefinition = state.objects[objName];

                if(goalObj.size != null){
                    if(goalObj.size != obj.size){
                        continue;
                    }
		    else {com.add("Size");}
                }
                if(goalObj.color != null){
                    if(goalObj.color != obj.color){
                        continue;
                    }
    		    else {com.add("Color");}
                }
                if(goalObj.form != null){
                    if(goalObj.form != obj.form){
                        continue;
                    }
		    else {com.add("Form");}
                }
                result.push(objName);
            }
        }
        return searchResult;
    }

    /**
    * @return list of targets in the world that complies with the specified entity.
    */
    function findTargetEntities(en : Parser.Entity, state : WorldState) : SearchingResult {
        //var result : string[] = findTargetObjects(state, en.obj);
	var searchResult = findTargetObjects(state, en.obj);
        switch(en.quant){
            case "any":
                break;
            case "the":
                if(searchResult.targets.length > 1){
		    searchResult.status = "SoftAmbiguity";
		    console.log("found multiple objects fits description");
		    console.log(searchResult);
		    // not nessecary to stop whole program for this!
                    //throw new Interpreter.Error("There are several objects that fit the description");
                }
                break;
        }

        return searchResult;
    }
    
    // function checkLocation() : boolean {
    //     return true;
    // }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    ////////// disambiguity //////////
    /// Ambiguity thrown as Special Error (will be catched in Shrdlite)
    export class Ambiguity implements Error {
	public name = "Interpreter.Ambiguity";
	public cmd : Parser.Command;
	public searchingResult : SearchingResult;
	constructor(c: Parser.Command
		    , previousSearch : SearchingResult
		    , public message? : string) 
	{
	    this.cmd = c;
	    this.searchingResult = previousSearch; 
	}
	public toString() {return this.name + ": " + this.message +" -> "+ this.cmd}
    }
    /// SearchingResult holds possible extra information from findTargetObjects
    export interface SearchingResult {
	status: string; 
	targets: string[]; 
	common: collections.Set<string>;
    }
}
