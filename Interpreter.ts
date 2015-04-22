///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            console.log("\nInput is :"+parseresult.input);
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
        //console.log(cmd);

        if(cmd.ent != null){
            interpretEntity(cmd.ent, state);
        }
        if(cmd.loc != null){
            interpretLocation(cmd.loc, state);
        }
        // This returns a dummy interpretation involving two random objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: false, rel: "ontop", args: [a, "floor"]},
            {pol: false, rel: "holding", args: [b]}
        ]];
        return intprt;
    }

    function interpretEntity(ent : Parser.Entity, state : WorldState) : Literal[][] {
        //console.log(ent);
        if(ent.obj != null){
            interpretObject(ent.obj, state);
        }

        return null;
    }

    function interpretObject(obj : Parser.Object, state : WorldState) : Literal[][] {
        //console.log(obj);
        if(obj.loc != null){
            interpretLocation(obj.loc, state);
        }
        if(obj.obj != null){
            interpretObject(obj.obj, state);
        }

        return null;
    }
    function interpretLocation(loc : Parser.Location, state : WorldState) : Literal[][] {
        //console.log(loc);
        if(loc.ent != null){
            interpretEntity(loc.ent, state);
        }
        return null;
    }



    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

