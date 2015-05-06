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
            if (intprt.intp) interpretations.push(intprt);
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

        // check if object exits
        if (!recusiveCheckExistance(cmd.ent.obj, state)) return null;


        // var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        // var a = objs[getRandomInt(objs.length)];
        // var b = objs[getRandomInt(objs.length)];

        var intprt : Literal[][] = [[
            // {pol: true, rel: "ontop", args: [a, "floor"]},
            // {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }

    function recusiveCheckExistance(obj : Parser.Object, state : WorldState) : Parser.Object[] {
      debugger
      if ("obj" in obj) {
        // TODO
        // rel: "inside",
        // var matches = objectExists(obj, state)
        return []; // recusiveCheckExistance(obj.loc.ent.obj, state);
      } else {
        return objectExists(obj, state);
      }
    }

    function objectExists(objA : Parser.Object, state : WorldState) : Parser.Object[] {
      var matches = [];
      for (var o in state.objects) {
        var objB = state.objects[o];
        if (
          (!objA.size  || objB.size  == objA.size) &&
          (!objA.color || objB.color == objA.color) &&
          (objA.form == "anyform"  || objB.form  == objA.form)
        ) matches.push(objB);
      }
      return matches;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
