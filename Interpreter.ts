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
                console.log("Got move! which is not implemented yet...");
                break;
            default:
                console.log("Interpreter: UNKNOWN cmd: " + cmd.cmd);
                break;
        }
        return intprt;
    }


    /**
    * @return list of targets in the world that complies with the specified entity.
    */
    function findTargetEntities(en : Parser.Entity, state : WorldState) : string[] {
        var goalObj = en.obj;
        var result : string[] = [];
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
