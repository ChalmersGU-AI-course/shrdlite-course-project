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

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    //////////////////////////////////////////////////////////////////////
    // Private Interpret class that derives PDDL from command

    export class Interpret {

      state: WorldState;
      constructor(state: WorldState) {
        this.state = state;
      }

      //////////////////////////////////////////////////////////////////////
      // Entry Point

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
          case "put":
            return this.put(cmd.loc);
          case "move":
            return this.move(cmd.ent, cmd.loc);
          default:
            throw new Interpreter.Error("derive: unrecognized verb");
        }
      }

      //////////////////////////////////////////////////////////////////////
      // Verbs

      /*
       * preconditions:
       *    1. Spec object(the) / objects(any) exist among the state objects
       * effects:
       *    1. Arm should hold spec object
       */
      take(ent : Parser.Entity): Literal[][] {
        var objQuant = ent.quant;
        var objs = this.references(ent.obj);
        if(objs && objs.length > 0) {
          switch(objQuant) {
            case "the":
              if(objs.length > 1) // TODO: ask "do you mean the large red pyramid or the small green?"
                throw new Interpreter.Error("take: semantic ambiguity (too many options to take)");
              return [[ {pol: true, rel: "holding", args: [objs.pop()]} ]]; // [[lit]]
            case "any":
              return objs.map((ref: string) => {
                return [ {pol: true, rel: "holding", args: [ref]} ]; // [[lit] or [lit] or [lit]]
              });
            case "all":
              throw new Interpreter.Error("take: logic error (the robot has only one arm)");
          }
        }
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
        var obj = this.state["holding"];           // object
        var refs = this.references(loc.ent.obj);   // references
        var refQuant = loc.ent.quant;              // reference quantity
        // If the command reference the floor make lit immediately
        if(this.isFloor(loc.ent.obj)) {
          return this.floorLiteral([obj]);
        }
        // error handler callback
        function specialHandler(objs: string[], refs: string[]): string {
          if(objs.length > 1)
            return "put: too many objects are found";
          return null;
        }
        return this.singular(specialHandler, [obj], loc.rel, refQuant, refs);
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
        var objs = this.references(ent.obj);       // objects
        var refs = this.references(loc.ent.obj);   // references
        var objQuant = ent.quant;                  // object quantity
        var refQuant = loc.ent.quant;              // reference quantity
        // If the command reference the floor make lit immediately
        if(this.isFloor(loc.ent.obj)) {
          return this.floorLiteral(objs);
        }
        switch(objQuant) {
          case "the":
            // special error handler
            function specialHandler(objs: string[], refs: string[]): string {
              if(objs.length > 1)
                return "move: too many objects are found";
              return null;
            }
            return this.singular(specialHandler, objs, loc.rel, refQuant, refs);
          case "any":
            return this.singular(null, objs, loc.rel, refQuant, refs);
          case "all":
            return this.plural(objs, loc.rel, refQuant, refs); // (ball, ontop, any, [y1, y2])
        }
      }


      //////////////////////////////////////////////////////////////////////
      // Singular or Plural object

      /*
       * Handles singular case when object is quantified by "the" or "any"
       */
      singular(specialHandler: (objs: string[], refs: string[]) => string,
               objs: string[],
               rel: string,
               refQuant: string,
               refs: string[]): Literal[][] {
        var lits: Literal[][];

        // Check if error occured with objects
        var error = this.notEmptyHandler(objs, refs);
        if(!error && specialHandler)
          error = specialHandler(objs, refs);
        if(error)
          throw new Interpreter.Error(error);

        switch(refQuant) {
          case "all":   // "all" and "the" are handled the same way
            if(rel === "ontop" || rel === "inside") {
              error = "A single object cannot be " + rel + " many objects";
              throw new Interpreter.Error(error);
            }
          case "the":
            lits = this.literals(objs, refs, rel, false);
            break;
          case "any":
            lits = this.literals(objs, refs, rel, false);
            var flattened = this.flatten(lits)
            lits = flattened.map((lit: Literal) => {
              return [lit];
            });
            break;
        }
        return lits;
      }

      /*
       * Handles plural case when object is quantified by "all"
       */
      plural(objs: string[],
             rel: string,
             refQuant: string,
             refs: string[]): Literal[][] {
        var lits: Literal[][];

        // Check if error occured with objects
        var error = this.notEmptyHandler(objs, refs);
        if(error)
          throw new Interpreter.Error(error);
        var ontopOrInside = rel === "ontop" || rel === "inside"

        switch(refQuant) {
          case "the":
            if(ontopOrInside) {
              error = "Multiple objects cannot be " + rel + " a single object";
              throw new Interpreter.Error(error);
            }
            lits = this.literals(objs, refs, rel, false);
            var flattened = this.flatten(lits)
            lits = [flattened];
            break;
          case "all":
            lits = this.literals(objs, refs, rel, false);
            var flattened = this.flatten(lits)
            lits = [flattened];
            break;
          case "any":
            var swappedArgs = true;
            lits = this.literals(refs, objs, rel, swappedArgs);
            if(ontopOrInside) {
              if(refs.length < objs.length) {
                error = "There are not enough references for the objects to be " + rel;
                throw new Interpreter.Error(error);
              }
              // all objects get to be in relation "rel" to unique object
              lits = permutations(lits, objs)
            }
            break;
        }
        return lits;
      }

      //////////////////////////////////////////////////////////////////////
      // Find refered objects or references in sentence

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
          var onFloor: boolean = false;      // flag to tell findTarget how to interpret refs
          if(loc.ent.obj) {
            if(this.isFloor(loc.ent.obj)) {
              refs = this.floorObjects();
              onFloor = true;
            } else {
              refs = this.references(loc.ent.obj);
            }
            var target: string;
            if(refs && refs.length > 0) {
              refs.forEach((ref: string) => {
                target = this.findTarget(obj, loc.rel, ref, onFloor); // findTarget(obj, "leftof", "a")
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
      findTarget(obj: Parser.Object, rel: string, ref: string, onFloor: boolean): string {
        var stacks = this.state["stacks"];
        var target: string;
        var found = false;
        for(var col=0; col<stacks.length && !found; col++) {
          for(var row=0; row<stacks[col].length && !found; row++) {
            if(ref === stacks[col][row]) {
              found = true;                       // found: stop searching...
              switch(rel) {
                case "leftof":
                  target = stacks[col-1][row];    // TODO: anywhere left of
                  break;
                case "rightof":
                  target = stacks[col+1][row];    // TODO: anywhere right of
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
                  if(onFloor) {
                    if(this.match(obj, ref))
                      target = ref
                  } else {
                    var r = this.findObject(ref);
                    if(r.form === "box")          // objects cannot be "ontop" of boxes (Physical law)
                      throw new Interpreter.Error("findTarget: logic error (something ontop of a box)");
                    target = stacks[col][row+1];
                  }
                  break;
                case "inside":
                  var r = this.findObject(ref);
                  if(r.form !== "box")          // objects cannot be "ontop" of boxes (Physical law)
                    throw new Interpreter.Error("findTarget: logic error (something inside of non-box)");
                  target = stacks[col][row+1];
                  break;
                case "under":
                  target = stacks[col][row-1];     // TODO: could be anywhere under
                  break;
              }
            }
          }
        }
        return (this.match(obj, target) ? target : null);
      }

      //////////////////////////////////////////////////////////////////////
      // Make literals of given objects, references and relation

      /*
       * Makes literals of objects and references, specified by pol and relation
       */
      literals(objs: string[], refs: string[], rel: string, swapped: boolean): Literal[][] {
        var lits: Literal[][];
        var combs = this.combinations(objs, refs);
        lits = this.transform(combs, rel, swapped);
        function swapArgs(lit: Literal) {
          var newArgs = [];
          newArgs[0] = lit.args[1];
          newArgs[1] = lit.args[0];
          return {pol: lit.pol, rel: lit.rel, args: newArgs};
        };
        if(swapped)
          lits = this.modify(lits, swapArgs);
        return lits;
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
      transform(matrix: Pair[][], rel: string, swapped: boolean): Literal[][] {
        return matrix.map((arr: Pair[]) => {
          return arr.map((pair: Pair) => {
            var obj = this.state["objects"][pair.obj];
            var locErr = this.locationError(obj, rel, pair.ref, swapped);
            if(!locErr) {
              return {pol: true, rel: rel, args: [pair.obj, pair.ref]};
            } else {
              throw new Interpreter.Error(locErr);
            }
          });
        });
      }

      //////////////////////////////////////////////////////////////////////
      // Helper methods

      /*
       * Check if object is allowed at location according to physical laws.
       */
      locationError(obj: Parser.Object, rel: string, ref: string, swapped: boolean): string {
        // 0. Elementary assumptions
        var refObj = this.findObject(ref);
        if(swapped) { // refs are objects and objects refs
          var temp = refObj;
          var refObj = toObjectDef(obj);
          obj = temp;
        }
        var objstr = toString(obj);
        var refstr = toString(refObj)
        if(!obj || !refObj)
          return "no object or reference found";
        if(rel === "ontop" || rel === "inside") {
          // 1. Balls must be in boxes or on the floor, otherwise they roll away.
          if(obj.form === "ball" && (refObj.form !== "floor" && refObj.form !== "box")) {
            var preposition = (refObj.form === "floor") ? " on the" : " in a";
            return "The" + objstr + "cannot be put" + preposition + refstr;
          }
          // 2. Balls cannot support anything.
          if(refObj.form === "ball") {
            return "A" + refstr + "cannot support anything";
          }
          // 3. Small objects cannot support large objects.
          if(this.size(obj.size) > this.size(refObj.size)) {
            return "The" + objstr + "is to large for the" + refstr;
          }
          // 4. Boxes cannot contain pyramids, planks or boxes of the same size.
          var plank = obj.form === "plank";
          var pyramid = obj.form === "pyramid";
          var box = obj.form === "box";
          var possibleConflict = plank || pyramid || box;
          var equalSize = this.size(refObj.size) === this.size(obj.size);
          if((refObj.form === "box") && possibleConflict && equalSize) {
            return "A" + refstr + "cannot contain a" + objstr;
          }
          // 5. Small boxes cannot be supported by small bricks or pyramids.
          var smallBox = (obj.form === "box") && (obj.size === "small");
          var smallBrick = (refObj.form === "brick") && (refObj.size === "small");
          if(smallBox && (smallBrick || (refObj.form === "pyramid"))) {
            return "A" + objstr + "cannot be supported by a" + refstr;
          }
          // 6. Large boxes cannot be supported by large pyramids.
          var largeBox = (obj.form === "box") && (obj.size === "large");
          var largePyramid = (refObj.form === "pyramid") && (refObj.size === "large");
          if(largeBox && largePyramid) {
            return "A" + objstr + "cannot be supported by a" + refstr;
          }
        }
      }

      /*
       * Error handler used in singular and plural to see if objs and refs are
       * not empty
       */
      notEmptyHandler(objs: string[], refs: string[]): string {
        if(!objs || objs.length === 0)
          return "move: no objects found";
        if(!refs || refs.length === 0)
          return "move: no references found";
        return null;
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
        var isAnything = rootObj.form === "anyform";
        if(!isAnything && rootObj.form !== def.form)
          return false;
        if(rootObj.size && rootObj.size !== def.size)
          return false;
        if(rootObj.color && rootObj.color !== def.color)
          return false;
        return true;
      }

      /*
       * Finds all objects on floor
       */
      floorObjects(): string[] {
        var stacks = this.state["stacks"];
        var floorObjs = stacks.map((arr: string[]) => {
          if(arr.length > 0)
            return arr[0];
        });
        return floorObjs.filter(Boolean);
      }

      /*
       * Tells if an object id is on the bottom of any of the stacks
       */
      isOnFloor(id: string): boolean {
        var floorObjs = this.floorObjects();
        return (floorObjs.indexOf(id) > -1);
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
      floorLiteral(ids: string[]): Literal[][] {
        var refs = this.worldObjects();
        var lits = ids.map((id: string) => {
          var litArr = refs.map((ref: string) => {
            return {pol: false, rel: "ontop", args: [id, ref]};
          });
          litArr.push({pol: false, rel: "holding", args: [id]});
          return litArr;
        });
        return lits;
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
          return 2;
        else if(s === "small")
          return 0;
        return 1; // no size specified in object, apply rule of least intervention
      }

    } // class Interpret

    /*
     * Interface used to pair up object ids to use in Literal (literals
     * function)
     */
    interface Pair {
      obj: string;
      ref: string;
    }

    function permutations(lits: Literal[][], objs: string[]): Literal[][] {
      return uniqueCombinations(lits, 0, objs, 0);
    }

    function uniqueCombinations(lits: Literal[][],
                               lind: number,
                               objs: string[],
                               oind: number): Literal[][] {
      var obj = objs[oind];
      if(obj) {
        var literals: Literal[][] = [];
        // find what literals in the current literal array contains the object in args
        var candidates: Literal[] = lits[lind].filter((lit: Literal) => {
          return (lit.args[0] === obj);
        });
        // array should only contain at least one element
        if(!candidates || candidates.length < 1)
          throw new Interpreter.Error("uniqueCombination: did not found elements");
        // recursive case: for all candidates get all possible combinations and
        // add them to lits.
        var temp: Literal[][] = uniqueCombinations(lits, lind+1, objs, oind+1);
        var newLits: Literal[][] = [];
        candidates.forEach((lit: Literal) => {
          if(temp && temp.length > 0) {
            newLits = temp.map((arr: Literal[]) => {
              arr.push(lit);
              return arr;
            });
          } else {
            newLits.push([lit]);
          }
          literals = literals.concat(newLits);
        });
        return literals;
      }
    }

    function toObjectDef(obj: Parser.Object): ObjectDefinition {
      return {form: obj.form, size: obj.size, color: obj.color};
    }

    function toString(obj: Parser.Object): string {
      var str: string = "";
      if(obj.size)
        str += " " + obj.size;
      if(obj.form)
        str += " " + obj.form;
      str += " ";
      return str;
    }

    function printObject(obj: Parser.Object) {
      for(var prop in obj) {
        var val: string = obj[prop];
        var str: string = "" + prop + ": ";
        console.log(str);
        console.log(val);
      }
    }

    function literalsToString(litss: Literal[][]): string {
      return litss.map((lits) => {
        return lits.map((lit) => literalToString(lit)).join(" & ");
      }).join(" | ");
    }

}

