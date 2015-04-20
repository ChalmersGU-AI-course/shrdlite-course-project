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
        // This returns a dummy interpretation involving two random objects in the world

        // TODO: we should implement this function
        // What should it return? The goal functions?
        // Whatever we return here is only for our own benefit, in the planner


        // We see here that an object simply has a one-letter identifier
        console.log('stacks:', state.stacks);

        console.log('cmd:',cmd);
        // cmd.cmd: what to do ("move")
        // cmd.ent: what object to do this with
        // cmd.loc: where to put it (may be undefined, if cmd is e.g. "take"

        // Map commands to functions
        var handlerFns = {
            "move": interpretMove,
            "take": interpretTake
            // TODO: add more
        };

        // Run associated function
        var fn = handlerFns[cmd.cmd];
        if (!fn) fn = interpretRandom;
        var intprt = fn(cmd);

        return intprt;
    }

    function interpretMove(cmd : Parser.Command, state : WorldState)  : Literal[][] {
        console.log("interpretMove()");
        // TODO
        return [[]];
    }

    function interpretTake(cmd : Parser.Command, state : WorldState)  : Literal[][] {
        // TODO
        return [[]];
    }

    function interpretRandom(cmd : Parser.Command, state : WorldState) : Literal[][] {
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];

        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }




    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

