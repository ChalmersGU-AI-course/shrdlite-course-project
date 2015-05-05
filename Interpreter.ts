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

    // TODO: Make more error classes to use in catch to tell user whats wrong

    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    // TODO: delete this function
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
        // var i = new Interpret(state);
        // return i.derive(cmd);
    }

    export class Interpret {
      state: WorldState;
      constructor(state: WorldState) {
        this.state = state;
      }

      /*
       * Top-level interpreter method:
       * Defines the following interpretation depending on the verb action.
       * The verb actions: take, put and move only check preconditions, the real
       * work is done by entities and locations
       */
      derive(cmd: Parser.Command): Literal[][] {
        switch(cmd.cmd) {
          case "take":
            return this.take(cmd.ent);
            break;
          case "put":
            return this.put(cmd.loc);
            break;
          case "move":
            return this.move(cmd.ent, cmd.loc);
            break;
          default:
            throw new Interpreter.Error("derive: unrecognized verb");
        }
      }

      /*
       * preconditions:
       *    - Arm should not hold a object
       *    - Spec object/s exist among objects (s: "a", "an", "any")
       * effects:
       *    - Arm should hold spec object
       */
      take(ent : Parser.Entity): Literal[][] {
        // 1. Check precondition (1)
        if(this.state.holding)
          throw new Interpreter.Error("take: logic error (the robot is already holding an object)");
        // 2. Check logic errors in grammar
        if(ent.quant === "all")
          throw new Interpreter.Error("take: logic error (the robot has only one arm)");
        // TODO: 3. Check precondition (2)
        var literalfunc = this.entityFunc(ent);
        return literalfunc(true, "holding", null);
      }

      /*
       * preconditions:
       *    - Arm should hold a object
       *    - Held object can be located at spec location/s
       * effects:
       *    - Arm should not hold a object
       *    - Held object should be located at spec location/s (s: "a", "an", "any")
       */
      put(loc : Parser.Location): Literal[][] {
        // 1. Check precondition (1)
        if(!this.state.holding)
          throw new Interpreter.Error("put: logic error (the robot is not holding an object)");
        // 2. Check precondition (2)
        // 3. Make Literal
        var literalfunc = this.moveFunc(loc);
        literalfunc(true, [this.state["holding"]]);

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

      moveFunc(loc : Parser.Location): (pol: boolean, objs: Parser.Object[]) => Literal[][] {
        switch(loc.rel) {
          case "leftof":
            // return function that takes
            //    polarity
            //    other object ontop of these objects in arguments
            //    call entities withobject after relation
            //    and give the arguments in the new callstack to returned func +
            //       other object from previous callstack
            //       "leftof"
            break;
          case "rightof":
            break;
          case "inside":
            break;
          case "ontop":
            break;
          case "under":
            break;
          case "beside":
            break;
          default:
            throw new Interpreter.Error("locations: unrecognized relation");
        }
        return null;
      }

      entityFunc(ent: Parser.Entity): (pol: boolean, rel: string, objs: Parser.Object[]) => Literal[][] {
        switch(ent.quant) {
          case "all":
            // find all object ids matching description
            var secondaryIds = this.references(ent.obj);
            // return function to caller who specifies pol, rel, and object
            return function(pol: boolean, rel: string, primaryIds: string[]): Literal[][] {
              function toLiteral(id: string) {
                return {pol: pol, rel: rel, args: [id]};
              }
              var literals = secondaryIds.map(toLiteral);
              return [literals];                   // lit && lit && lit ....
            };
            break;
          case "any":
            // find all objects
            // return function that takes
            //    polarity
            //    relation
            //    other objects ontop of these objects in arguments
            //    lit || lit || lit
            break;
          case "the":
            // find the object
            // if many throw ambiguity
            // return function that takes
            //    polarity
            //    relation
            //    other objects ontop of this object in arguments
            //    lit
            break;
          default:
            throw new Interpreter.Error("entities: unrecognized quantifier");
        }
      }

      /*
       * Searches world state to find matching object and return all their ids
       */
      references(obj: Parser.Object): string[] {
        var matches: string[] = [];
        if(!obj.loc) {                       // base case: find all objects in spec
          for(var id in this.state["objects"]) {
            if(match(obj, this.state["objects"][id])) {
              matches.push(id);
            }
          }
        } else {                             // recursive case: filter out by location as well
          var loc = obj.loc;
          var refs: string[];
          if(loc.ent.obj)
            refs = this.references(loc.ent.obj);
          else
            console.log("\n entity object error");
          var target: string;
          if(refs && refs.length > 0) {
            refs.forEach((ref: string) => {
              target = this.findTarget(loc.rel, ref); // findTarget("leftof", "a")
              if(target) // found target TODO: throw error if no target is found
                matches.push(target);
            });
          } else {
            console.log("\n refs error");
          }
        }
        return matches;
      }

      /*
       * Finds target object in relation (leftof, rightof, under, ontop) to
       * another object.
       * Logic error if index out of bounds or if no object exist in that place.
       */
      findTarget(rel: string, ref: string): string {
        var stacks = this.state["stacks"];
        var target: string;
        var found = false;
        for(var col=0; col<stacks.length && !found; col++) {
          for(var row=0; row<stacks[col].length && !found; row++) {
            if(ref === stacks[col][row]) {
              found = true;                       // found: stop searching...
              switch(rel) {
                case "leftof":
                  target = stacks[col-1][row];
                  break;
                case "rightof":
                  target = stacks[col+1][row];
                  break;
                case "beside":                    // check if only one case is possible
                  var left = stacks[col-1][row];
                  var right = stacks[col+1][row];
                  if(left && right)
                    throw new Interpreter.Error("findTarget: semantic error (There are many targets)");
                  if(left)
                    target = left;
                  if(right)
                    target = right;
                  break;
                case "ontop":
                  target = stacks[col][row+1];
                  break;
                case "inside":
                  target = stacks[col][row+1];
                  break;
                case "under":
                  target = stacks[col][row-1];
                  break;
              }
            }
          }
        }
        return target;
      }

    }

    // Helper functions
    function match(obj: Parser.Object, def: ObjectDefinition): boolean {
      if(obj.size && obj.size !== def.size)
        return false;
      if(obj.color && obj.color !== def.color)
        return false;
      if(obj.form && obj.form !== def.form)
        return false;
      // console.log("\nmatch obj: {" + obj.form + ", " + obj.size + ", " + obj.color + "}");
      // console.log("\nmatch def: {" + def.form + ", " + def.size + ", " + def.color + "}");
      // console.log("\nmatching: " + matching);
      return true;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

