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
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }

    class Interpret {
      state: WorldState;
      constructor(state: WorldState) {
        this.state = state;
      }

      /*
       * Top-level interpreter method:
       * Defines the following interpretation depending on the verb action.
       */
      derive(cmd: Parser.Command): Literal[][] {
        switch(cmd.cmd) {
          case "take":
            return this.take(cmd.ent);
          case "put":
            return this.put(cmd.loc);
          case "move":
            return this.move(cmd.ent, cmd.loc);
          default:
            throw new Interpreter.Error("derive: unrecognized verb."); // TODO: make throw statement
        }
      }

      /*
       * preconditions:
       *    - Arm should not hold a object
       *    - Spec object/s exist among objects (s: any)
       * effects:
       *    - Arm should hold spec object
       */
      take(ent : Parser.Entity): Literal[][] {
        // 1. Find referred object in entity
        // 2. Check precondition (1)
        // 3. Check precondition (2)
        // 4. Make Literal
        var lit: Literal[][];
        return lit;
      }

      /*
       * preconditions:
       *    - Arm should hold a object
       *    - Held object can be located at spec location/s
       * effects:
       *    - Arm should not hold a object
       *    - Held object should be located at spec location/s (s: any)
       */
      put(loc : Parser.Location): Literal[][] {
        // 1. Check precondition (1)
        // 2. Find referred location
        // 3. Check precondition (2)
        // 4. Make Literal
        var lit: Literal[][];
        return lit;
      }

      /*
       * preconditions:
       *    - Arm should not hold a object
       *    - Spec object/s exist among objects
       *    - Spec object/s can be located at spec location/s
       * effects:
       *    - Arm should not hold a object
       *    - Spec object/s should be located at spec location/s
       */
      move(ent : Parser.Entity, loc : Parser.Location): Literal[][] {
        // 1. Check precondition (1)
        // 2. Find referred object in entity
        // 3. Check precondition (2)
        // 4. Find referred location
        // 5. Check precondition (3)
        // 6. Make Literal
        var lit: Literal[][];
        return lit;
      }

      // location(loc : Parser.Location)
      // entity(ent: Parser.Entity)
    }














    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

