///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

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
        if (interpretations.length > 0 && interpretations[0].intp.length > 0) {
            return interpretations;
        } else {
            throw new Interpreter.Error("Found no legal interpretation");
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
            throw new Interpreter.Error("Interpreter.canSupport(): below was NULL");
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

        switch(cmd.cmd){
            case "take":
                var targets = findTargetEntities(cmd.ent, state);
                if(targets.length == 0){
                    throw new Interpreter.Error("Can't find such an object to grasp.");
                }
                for (var ix in targets){
                    intprt.push( [
                        {pol: true, rel: "holding", args: [targets[ix]] }
                    ] );
                }
                break;
            case "move":
                var targets = findTargetEntities(cmd.ent, state);
                findMoveInterpretations(cmd, state, intprt, targets);
                break;
            case "put":
                if (state.holding === null) {
                    throw new Interpreter.Error("I don't understand what you mean with 'it'")
                }
                var targets = new Array<string>();
                targets[0] = state.holding;
                findMoveInterpretations(cmd, state, intprt, targets);
                break;
            default:
                throw new Interpreter.Error("Interpreter: UNKNOWN cmd: " + cmd.cmd);
        }
        return intprt;
    }

    function findMoveInterpretations(cmd : Parser.Command, state : WorldState, intprt : Literal[][], targets) {
        if(targets.length == 0){
            throw new Interpreter.Error("Can't find such an object to move.");
        }

        var location = cmd.loc;
        var locationTargets = findTargetEntities(location.ent, state);
        if(locationTargets.length == 0){
            throw new Interpreter.Error("Can't find such a place to move it to.");
        }

        switch(location.rel){
            case "beside":
            case "rightof":
            case "leftof":
                moveObjBeside(state, intprt, location.rel, targets, locationTargets);
                break;
            case "ontop":
            case "inside":
                moveObjAbove(state, intprt, location.rel, targets, locationTargets, true);
                break;
            case "above":
                moveObjAbove(state, intprt, location.rel, targets, locationTargets, false);
                break;
            case "under":
                moveObjAbove(state, intprt, "above", locationTargets, targets, false);
                break;
            default:
                throw new Interpreter.Error("Unknown Relation in move: " + location.rel);
        }
    }

    function moveObjBeside(state : WorldState, intprt : Literal[][], locationRel : string, fromList : string[], toList : string[]){
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

    function moveObjAbove(state : WorldState, intprt : Literal[][], locationRel : string, fromList : string[], toList : string[], exactlyAbove : boolean){
        for (var ix in fromList){
            for(var jx in toList){
                var above = fromList[ix];
                var below = toList[jx];

                if( above == below){
                    continue;
                }

                var objA = findObjDef(state, above);
                var objB = findObjDef(state, below);
                if(exactlyAbove){
                    if(!canSupport(objA, objB)){
                        continue;
                    }
                } else { // somewhere above.
                    if(objB.form == "ball"){
                        continue;
                    }
                    if(compareSize(objA.size, objB.size) > 0){
                        // A > B
                        continue;
                    }
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

        var possibleObjects : string[] = findTargetObjects(state, goalObj);
        var possibleLocations : string[] = findTargetEntities(loc.ent, state);

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
    function findTargetObjects(state : WorldState, goalObj : Parser.Object) : string[]{
        var result : string[] = [];

        if(goalObj.obj != null){
            // Ie form, size etc are null.
            // Filter on location instead...
            return resolveObject(state, goalObj.obj, goalObj.loc);
        }

        if(goalObj.form === "floor"){
            result.push("floor");
        }

        if(state.holding != null){
            var objName = state.holding;
            if(testObject(state, state.holding, goalObj)){
                result.push(state.holding);
            }
        }

        for(var stackNo in state.stacks){
            var currentStack = state.stacks[stackNo];
            for(var heightNo in currentStack){
                var objName = currentStack[heightNo];
                if(testObject(state, objName, goalObj)){
                    result.push(objName);
                }
            }
        }

        return result;
    }

    function testObject(state : WorldState, objName : string, goalObj : Parser.Object) : boolean {
        var obj : ObjectDefinition = state.objects[objName];
        if(goalObj.size != null){
            if(goalObj.size != obj.size){
                return false;
            }
        }
        if(goalObj.color != null){
            if(goalObj.color != obj.color){
                return false;
            }
        }
        if(goalObj.form != null){
            if(goalObj.form != obj.form){
                return false;
            }
        }
        return true;
    }

    /**
    * @return list of targets in the world that complies with the specified entity.
    */
    function findTargetEntities(en : Parser.Entity, state : WorldState) : string[] {
        var result : string[] = findTargetObjects(state, en.obj);

        switch(en.quant){
            case "any":
                break;
            case "the":
                if(result.length > 1){
                    throw new Interpreter.Error("There are several objects that fit the description");
                }
                break;
        }

        return result;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
