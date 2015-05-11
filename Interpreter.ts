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
        // var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        // var a = objs[getRandomInt(objs.length)];
        // var b = objs[getRandomInt(objs.length)];
        // var intprt : Literal[][] = [[
        //     {pol: true, rel: "ontop", args: [a, "floor"]},
        //     {pol: true, rel: "holding", args: [b]}
        // ]];
        // return intprt;
        var interpreter = new Interpret(state);
        return interpreter.derive(cmd);
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
       *    1. Spec object(the) / objects(any) exist among the state objects
       * effects:
       *    1. Arm should hold spec object
       */
      take(ent : Parser.Entity): Literal[][] {
        var dropObject: Literal;
        var lits: Literal[][];
        // 1. Check logic errors in grammar
        if(ent.quant === "all")
          throw new Interpreter.Error("take: logic error (the robot has only one arm)");
        // 2. preconditions: (1)
        var objs = this.references(ent.obj);
        if(objs && objs.length > 0) {
        // 3. Create effects (1) (make literal)
          if(ent.quant === "any") {        // it is possible to have many references
            lits = objs.map((ref: string) => {
              return [ {pol: true, rel: "holding", args: [ref]} ]; // [[lit] or [lit] or [lit]]
            });
          } else if(ent.quant === "the") { // there should only be one reference
            if(objs.length > 1) // TODO: ask "do you mean the large red pyramid or the small green?"
              throw new Interpreter.Error("take: semantic ambiguity (too many options to take)");
            lits = [[ {pol: true, rel: "holding", args: [objs.pop()]} ]]; // [[lit]]
          }
        }
        return lits;
      }

      /*
       * preconditions:
       *    1. Arm should hold a object
       *    2. Held object can be located at spec location/s (see isAllowedPosition)
       * effects:
       *    1. Arm should not move the reference object (Cheating otherwise)
       *    2. Held object should be located at spec location/s (s: "a", "an", "any")
       */
      put(loc : Parser.Location): Literal[][] {
        var lits: Literal[][];
        var heldId = this.state["holding"];
        var heldObj = this.findObject(heldId);
        // 1. preconditions: (1)
        if(!heldObj)
          throw new Interpreter.Error("put: logic error (the robot is not holding an object)");
        // 2. Check logic errors in grammar
        if(loc.ent.quant === "all")
          throw new Interpreter.Error("put: logic error (the robot has only one arm)");
        // 3. if the command reference the floor make lit immediately
        if(this.isFloor(loc.ent.obj))
          return this.floorLiteral(heldId);
        // 4. preconditions: (2)
        var refs = this.references(loc.ent.obj);
        if(refs && refs.length > 0) {
          if(loc.ent.quant === "any") {        // filter out allowed positions
            var allowed = refs.filter((ref: string) => {
              return this.isAllowedPosition(heldObj, loc.rel, ref);
            });
            if(allowed.length > 0) {
              // 5. Create effects (1) (2) (make literal)
              lits = allowed.map((ref: string) => {
                // [[lit1, lit2] or [lit1, lit2] or [lit1, lit2]]
                return [ {pol: true, rel: loc.rel, args: [heldId, ref]} ];
              });
            }
          } else if(loc.ent.quant === "the") { // there should only be one reference
            if(refs.length > 1) // TODO: ask "do you mean the large red pyramid or the small green?"
              throw new Interpreter.Error("put: semantic ambiguity (too many options to take)");
            var ref = refs.pop();
            if(this.isAllowedPosition(heldObj, loc.rel, ref)) {
              // 5. Create effects (1) (2) (make literal)
              lits = [[ {pol: true, rel: loc.rel, args: [heldId, ref]} ]]; // [[lit]]
            } else {
              throw new Interpreter.Error("put: not allowed to put the object on the location");
            }
          }
        }
        return lits;
      }

      /*
       * preconditions:
       *    1. Spec object/objects exist among the state objects
       *    2. Spec object/s can be located at spec location/s
       * effects:
       *    1. Arm should not hold a object
       *    2. Spec object/s should be located at spec location/s
       */
      move(ent : Parser.Entity, loc : Parser.Location): Literal[][] {
        var lits: Literal[][];
        var objs = this.references(ent.obj);       // objects
        var refs = this.references(loc.ent.obj);   // references
        var objQuant = ent.quant;
        var refQuant = loc.ent.quant;
        switch(objQuant) {
          case "the":
            // 1. preconditions (1)
            function theHandler(objs: string[]): string {
              if(!objs || objs.length === 0)
                return "the: no objects are found";
              if(objs.length > 1)
                return "the: too many objects are found";
              return null;
            }
            // Example: (handler, [x], ontop, any, [y1, y2])
            lits = this.singular(theHandler, objs, loc.rel, refQuant, refs);
            break;
          case "any":
            function anyHandler(objs: string[]): string {
              if(!objs || objs.length === 0)
                return "any: no objects are found";
              return null;
            }
            lits = this.singular(anyHandler, objs, loc.rel, refQuant, refs);
            break;
          case "all":
            lits = this.plural(objs, loc.rel, refQuant, refs); // (ball, ontop, any, [y1, y2])
            break;
        }
        return lits;
      }

      // TODO: isAllowed needs to be inserted
      singular(handler: (obs: string[]) => string,
               objs: string[],
               rel: string,
               refQuant: string,
               refs: string[]): Literal[][] {
        var lits: Literal[][];
        var error = handler(objs);
        if(error)
          throw new Interpreter.Error(error);
        switch(refQuant) {
          case "all":           // "all" and "the" are handled the same way
          case "the":
            lits = this.literals(objs, refs, true, rel);
            break;
          case "any":
            lits = this.literals(objs, refs, true, rel);
            var flattened = this.flatten(lits)
            lits = flattened.map((lit: Literal) => {
              return [lit];
            });
            break;
        }
        return lits;
      }

      plural(objs: string[], rel: string, refQuant: string, refs: string[]): Literal[][] {
        var lits: Literal[][];
        switch(refQuant) {
          case "all":
          case "the":
            lits = this.literals(objs, refs, true, rel);
            var flattened = this.flatten(lits)
            lits = [flattened];
            break;
          case "any":
            lits = this.literals(refs, objs, true, rel);
            lits = this.modify(lits, (lit: Literal) => {
              var newArgs = [];
              newArgs[0] = lit.args[1];
              newArgs[1] = lit.args[0];
              return {pol: lit.pol, rel: lit.rel, args: newArgs};
            });
            break;
        }
        return lits;
      }


      //////////////////////////////////////////////////////////////////////
      // Helper methods

      /*
       * Searches world state to find target object/s refered in command.
       *
       * Example ref:
       *  "take the ball beside the table inside the box to the left of the brick"
       *
       * In this case the table is the reference, and we want to figure out what
       * table the sentence refers to, in order to know what ball to take.
       *
       */
      references(obj: Parser.Object): string[] {
        var matches: string[] = [];
        if(!obj.loc) {                       // base case: find all objects in spec
          var ids = this.worldObjects();
          for(var i=0; i<ids.length; i++) {
            if(this.match(obj, ids[i])) {
              matches.push(ids[i]);
            }
          }
        } else {                             // recursive case: filter out by location as well
          var loc = obj.loc;
          var refs: string[];
          if(loc.ent.obj) {
            refs = this.references(loc.ent.obj);
            var target: string;
            if(refs && refs.length > 0) {
              refs.forEach((ref: string) => {
                target = this.findTarget(obj, loc.rel, ref); // findTarget(obj, "leftof", "a")
                if(target) // found target TODO: throw error if no target is found
                  matches.push(target);
              });
            }
          }
        }
        return matches;
      }

      /*
       * Finds target object in relation (leftof, rightof, under, etc..) to
       * another object.
       *
       * Logic error if index out of bounds or if no object exist in that place.
       */
      findTarget(obj: Parser.Object, rel: string, ref: string): string {
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
                case "beside":                    // check that only one case is possible
                  var left = stacks[col-1][row];
                  var right = stacks[col+1][row];
                  if(left && right)
                    throw new Interpreter.Error("findTarget: semantic error (There are too many targets)");
                  if(left) target = left;
                  if(right) target = right;
                  break;
                case "above":                     // TODO: above and ontop not considered synonyms
                case "ontop":
                  var o = this.findObject(ref);   // objects cannot be "ontop" of boxes (Physical law)
                  if(o.form === "box")
                    throw new Interpreter.Error("findTarget: logic error (You cannot put something ontop of a box)");
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
        return (this.match(obj, target) ? target : null);
      }

      /*
       * Check if object is allowed at location according to physical laws.
       */
      isAllowedPosition(obj: Parser.Object, rel: string, ref: string): boolean {
        // 0. Elementary assumptions
        var refObj = this.findObject(ref);
        if(!obj || !refObj)
          return false;
        // 1. Balls must be in boxes or on the floor, otherwise they roll away.
        if(obj.form === "ball" && (refObj.form !== "floor" || refObj.form !== "box"))
          return false;
        // 2. Balls cannot support anything.
        if(refObj.form === "ball")
          return false;
        // 3. Small objects cannot support large objects.
        if(this.size(refObj.size) < this.size(obj.size))
          return false;
        // 4. Boxes cannot contain pyramids, planks or boxes of the same size.
        var possibleConflict = (obj.form === "plank")
                            || (obj.form === "pyramid")
                            || (obj.form === "box");
        var equalSize = this.size(refObj.size) === this.size(obj.size);
        if((refObj.form === "box") && possibleConflict && equalSize)
          return false;
        // 5. Small boxes cannot be supported by small bricks or pyramids.
        var smallBox = (obj.form === "box") && (obj.size === "small");
        var smallBrick = (refObj.form === "brick") && (refObj.size === "small");
        if(smallBox && (smallBrick || (refObj.form === "pyramid")))
          return false;
        // 6. Large boxes cannot be supported by large pyramids.
        var largeBox = (obj.form === "box") && (obj.size === "large");
        var largePyramid = (refObj.form === "pyramid") && (refObj.size === "large");
        if(largeBox && largePyramid)
          return false;

        // Otherwise
        return true;
      }

      /*
       * Flatten matrix to an array
       */
      flatten(lits: Literal[][]): Literal[] {
        return [].concat.apply([], lits);
      }

      /*
       * Checks if a given object matches the ObjectDefinition of an id in the
       * current world state.
       */
      match(obj: Parser.Object, id: string): boolean {
        var rootObj = this.rootObject(obj);
        var def = this.findObject(id);
        if(!rootObj || !rootObj.form || !def)
          return false;
        if(rootObj.form !== "anyform" && rootObj.form !== def.form)
          return false;
        if(rootObj.size && rootObj.size !== def.size)
          return false;
        if(rootObj.color && rootObj.color !== def.color)
          return false;
        return true;
      }

      /*
       * Makes literals of objects and references, specified by pol and relation
       */
      literals(objs: string[], refs: string[], pol: boolean, rel: string): Literal[][] {
        var combs = this.combinations(objs, refs);
        return this.transform(combs, pol, rel);
      }

      /*
       * Gives the combinations of two lists of strings in form of Pair[][]
       */
      combinations(objs: string[], refs: string[]): Pair[][] {
        var combs: Pair[][];
        if(objs.length > 0 && refs.length > 0) {
          combs = objs.map((o: string) => {
            return refs.map((r: string) => {
              return {obj: o, ref: r};
            });
          });
        }
        return combs;
      }

      /*
       * tranform Pair[][] to Literal[][]
       */
      transform(matrix: Pair[][], pol: boolean, rel: string): Literal[][] {
        return matrix.map((arr: Pair[]) => {
          return arr.map((pair: Pair) => {
            return {pol: pol, rel: rel, args: [pair.obj, pair.ref]};
          });
        });
      }

      /*
       * Lets us modify a Literal[][] with help of callback
       */
      modify(lits: Literal[][], callback: (lit: Literal) => Literal): Literal[][] {
        return lits.map((arr: Literal[]) => {
          return arr.map((lit: Literal) => {
            return callback(lit);
          });
        });
      }

      /*
       * Returns all ids in the stacks of the world
       */
      worldObjects(): string[] {
        var stacks = this.state["stacks"];
        return [].concat.apply([], stacks);
      }

      /*
       * Determines whether a object refers to the floor or not
       */
      isFloor(obj: Parser.Object): boolean {
        var rootObj = this.rootObject(obj);
        if(rootObj.form === "floor")
          return true;
        return false;
      }

      /*
       * Literal that says object (id) is not ontop of any othe object in world
       */
      floorLiteral(id: string): Literal[][] {
        var objs = this.worldObjects();
        return [objs.map((ref: string) => {
          return {pol: false, rel: "ontop", args: [id, ref]};
        })];
      }

      /*
       * Gets the root object of an object, i.e the top level object that it
       * object describes
       */
      rootObject(obj: Parser.Object): Parser.Object {
        if(obj) {
          if(obj.size || obj.color || obj.form)
            return obj;
          return this.rootObject(obj.obj);
        }
      }

      /*
       * Lookups ObjectDefinition in state
       */
      findObject(id: string): ObjectDefinition {
        return this.state["objects"][id];
      }

      /*
       * Lets us compare Object size numerically
       */
      size(s: string): number {
        if(s === "large")
          return 1;
        else if(s === "small")
          return 0;
        return 2; // no size specified in object, apply rule of least intervention
      }

    } // class Interpret

    interface Pair {
      obj: string;
      ref: string;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

