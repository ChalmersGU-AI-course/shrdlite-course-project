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
                for (var ix in targets){
                    intprt.push( [
                        {pol: true, rel: "holding", args: [targets[ix]] }
                    ] );
                }
                break;
            case "move":
                var targets = findTargetEntities(cmd.ent, state);
                var location = cmd.loc;
                var locationTargets = findTargetEntities(location.ent, state);

                if(location.rel === "under"){
                    moveObj(state, intprt, "above", locationTargets, targets);
                } else {
                    moveObj(state, intprt, location.rel, targets, locationTargets);
                }
                break;
            default:
                throw new Interpreter.Error("Interpreter: UNKNOWN cmd: " + cmd.cmd);
        }

        return intprt;
    }

    function moveObj(state, intprt, locationRel, fromList, toList){
        for (var ix in fromList){
            for(var jx in toList){
                var above = fromList[ix];
                var below = toList[jx];

                if( above == below){
                    continue;
                }
                if(! canSupport(state.objects[above], state.objects[below])){
                    continue;
                }

                intprt.push( [
                    {pol: true, rel: locationRel, args: [above, below] }
                ] );
            }
        }
    }


    /**
    * @return list of targets in the world that complies with the specified entity.
    */
    function findTargetEntities(en : Parser.Entity, state : WorldState) : string[] {
        var goalObj = en.obj;
        var result : string[] = [];

        if(en.obj.form === "floor"){
            result.push("floor");
        }

        for(var objName in state.objects){
            var obj : ObjectDefinition = state.objects[objName];

            if(goalObj.size){
                if(goalObj.size != obj.size){
                    continue;
                }
            }
            if(goalObj.color){
                if(goalObj.color != obj.color){
                    continue;
                }
            }
            if(goalObj.form){
                if(goalObj.form != obj.form){
                    continue;
                }
            }
            // TODO consider location for filtering as well!
            result.push(objName);
        }
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
