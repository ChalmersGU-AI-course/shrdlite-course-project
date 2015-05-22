///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        var interpretError : string;
        parses.forEach((parseresult) => {
          try {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            interpretations.push(intprt);
          } catch(err) {
            interpretError = interpretError || err.message;
          }
        });
        // weed out empty interpretations
        var nonEmpty = interpretations.filter((res: Result) => {
          return res.intp && res.intp.length > 0 && res.intp[0].length > 0;
        });
        // error checking
        var err: string;
        if(nonEmpty.length > 1) {
          var enumeration = nonEmpty.map((res: Result) => {
            return locationToString(res.prs.loc);
          });
          err = "Do you mean " + enumeration.join(", or ") + "?";
        }
        if(nonEmpty.length == 0)
          err = interpretError || "Found no interpretations, please check your sentence";
        if(err)
          throw new Interpreter.Error(err);
        return nonEmpty;
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
      // Entry Point (only public function)

      /*
       * Top-level interpreter method:
       * Defines the following interpretation depending on the verb action.
       * The verb actions: "take", "put" and "move" only check preconditions, the real
       * work is done by "the/any/all" and "literals" that these functions call
       */
      public derive(cmd: Parser.Command): Literal[][] {
        switch(cmd.cmd) {
          case "take":
            return this.take(cmd.ent);
          case "put":
            return this.put(cmd.loc);
          case "move":
            return this.move(cmd.ent, cmd.loc);
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
      private take(ent : Parser.Entity): Literal[][] {
        var objs = this.references(ent.obj);
        var objQuant = ent.quant;
        if(objs && objs.length > 0) {
          switch(objQuant) {
            case "the":
              if(objs.length > 1) {
                var err = this.tooManyObjectsError(objs);
                throw new Interpreter.Error(err);
              }
              return [[ {pol: true, rel: "holding", args: [objs.pop()]} ]]; // [[lit]]
            case "any":
              return objs.map((obj: string) => {
                return [ {pol: true, rel: "holding", args: [obj]} ]; // [[lit] or [lit] or [lit]]
              });
            case "all":
              throw new Interpreter.Error("The robot has unfortunately only one arm");
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
      private put(loc : Parser.Location): Literal[][] {
        var obj = this.state["holding"];           // object
        var refs = this.references(loc.ent.obj);   // references
        var refQuant = loc.ent.quant;              // reference quantity
        if(!obj)
          throw new Interpreter.Error("The arm is unfortunately not holding any object");

        // If the command reference the floor make lit immediately
        if(this.isFloor(loc.ent.obj))
          return this.floorLiteral([obj]);

        // specification of object for throwing undestandable errors
        var refspec = rootObject(loc.ent.obj);
        return this.the([obj], loc.rel, refQuant, refs, refspec);
      }

      /*
       * preconditions:
       *    1. Spec object/objects exist among the state objects
       *    2. Spec object/s can be located at spec location/s
       * effects:
       *    1. Arm should not hold a object
       *    2. Spec object/s should be located at spec location/s
       */
      private move(ent : Parser.Entity, loc : Parser.Location): Literal[][] {
        var objs = this.references(ent.obj);       // objects
        var refs = this.references(loc.ent.obj);   // references
        var objQuant = ent.quant;                  // object quantity
        var refQuant = loc.ent.quant;              // reference quantity

        // If the command reference the floor make lit immediately
        if(this.isFloor(loc.ent.obj))
          return this.floorLiteral(objs);

        // specification of object for throwing undestandable errors
        var objspec = rootObject(ent.obj);
        var refspec = rootObject(loc.ent.obj);

        switch(objQuant) {
          case "the":
            return this.the(objs, loc.rel, refQuant, refs, refspec);
          case "any":
            return this.any(objs, loc.rel, refQuant, refs, objspec, refspec);
          case "all":
            return this.all(objs, loc.rel, refQuant, refs, objspec, refspec);
        }
      }


      //////////////////////////////////////////////////////////////////////
      // Quantifiers

      /*
       * Handles singular case when object is quantified by "the"
       */
      private the(objs: string[],
                  rel: string,
                  refQuant: string,
                  refs: string[],
                  refspec: Parser.Object): Literal[][] {
        var lits: Literal[][];

        // Check that not there exist at least one object and one reference
        var error = this.emptyError(objs, refs);
        if(!error && objs.length > 1)
          error = this.tooManyObjectsError(objs);
        if(error)
          throw new Interpreter.Error(error);

        switch(refQuant) {
          case "the":
            lits = this.literals(objs, refs, rel);
            break;
          case "any":
            var swappedArgs = true;
            lits = this.literals(refs, objs, rel, swappedArgs);
            var flattened = flatten(lits);
            lits = flattened.map((lit: Literal) => {
              return [lit];
            });
            break;
          case "all":
            if(rel === "ontop" || rel === "inside") {
              var objStr = objectToString(this.findObject(objs[0]));
              var refStr = objectToString(refspec);
              error = "A " + objStr + " cannot be " + rel + " of many " + refStr + "s";
              throw new Interpreter.Error(error);
            }
            lits = this.literals(objs, refs, rel);
            break;
        }
        return lits;
      }

      /*
       * Handles alternative case when object is quantified by "any"
       * (The specObj is only used for throwing a correctly understood error)
       */
      private any(objs: string[],
                  rel: string,
                  refQuant: string,
                  refs: string[],
                  objspec: Parser.Object,
                  refspec: Parser.Object): Literal[][] {
        var lits: Literal[][];

        // Check that there exist at least one object and one reference
        var error = this.emptyError(objs, refs);
        if(error)
          throw new Interpreter.Error(error);

        switch(refQuant) {
          case "the":
            var swappedArgs = true;
            var tolerant = true;
            lits = this.literals(refs, objs, rel, swappedArgs, tolerant);
            var flattened = flatten(lits);
            lits = flattened.map((lit: Literal) => {
              return [lit];
            });
            break;
          case "any":
            var swappedArgs = true;
            var tolerant = true;
            lits = this.literals(refs, objs, rel, swappedArgs, tolerant);
            break;
          case "all":
            if(rel === "ontop" || rel === "inside") {
              var objStr = objectToString(objspec);
              var refStr = objectToString(refspec);
              error = "A " + objStr + " cannot be " + rel + " of many " + refStr + "s";
              throw new Interpreter.Error(error);
            }
            lits = this.literals(objs, refs, rel);
            break;
        }
        return lits;
      }

      /*
       * Handles plural case when object is quantified by "all"
       * (The specObj is only used for throwing a correctly understood error)
       */
      private all(objs: string[],
                  rel: string,
                  refQuant: string,
                  refs: string[],
                  objspec: Parser.Object,
                  refspec: Parser.Object): Literal[][] {
        var lits: Literal[][];

        // Check that there exist at least one object and one reference
        var error = this.emptyError(objs, refs);
        if(error)
          throw new Interpreter.Error(error);

        var ontopOrInside = rel === "ontop" || rel === "inside"
        var objStr = objectToString(objspec);
        var refStr = objectToString(refspec);
        switch(refQuant) {
          case "the":
            if(ontopOrInside) {
              error = "Multiple " + objStr + " cannot be " + rel + " a single " + refStr;
              throw new Interpreter.Error(error);
            }
            lits = this.literals(objs, refs, rel);
            lits = [flatten(lits)]
            break;
          case "any":
            var swappedArgs = true;
            if(ontopOrInside) {
              if(refs.length < objs.length) {
                error = "There are not enough " + refStr + "s for the " + objStr + "s to be " + rel + " of";
                throw new Interpreter.Error(error);
              }
              var tolerant = true;
              lits = this.literals(refs, objs, rel, swappedArgs, tolerant);
              lits = uniqueCombinations(lits, objs, refs);
            } else {
              lits = this.literals(refs, objs, rel, swappedArgs);
            }
            break;
          case "all":
            lits = this.literals(objs, refs, rel);
            lits = [flatten(lits)]
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
      private references(obj: Parser.Object): string[] {
        var matches: string[] = [];
        if(!obj.loc) {                       // base case: find all objects in spec
          var ids = this.worldObjects();
          for(var i = 0; i < ids.length; i++) {
            if(this.match(obj, ids[i]))
              matches.push(ids[i]);
          }
        } else {                             // recursive case: filter out by location as well
          var loc = obj.loc;
          var refs: string[];
          var onFloor: boolean = false;      // flag to tell findTarget how to interpret refs
          if(loc.ent.obj) {
            if(this.isFloor(loc.ent.obj)) {
              refs = this.floorObjects();
              onFloor = true;                // tell findTarget that references are on floor
            } else {
              refs = this.references(loc.ent.obj);
            }
            var target: string;
            if(refs && refs.length > 0) {
              refs.forEach((ref: string) => {
                target = this.findTarget(obj, loc.rel, ref, onFloor); // findTarget(obj, "leftof", "a")
                if(target)
                  matches.push(target);
              });
            }
          }
        }
        return unique(matches);   // disregard duplicates if same reference is found in relation to many objects
      }

      /*
       * Finds target object in relation (leftof, rightof, under, etc..) to
       * another object.
       *
       * Logic error if index out of bounds or if no object exist in that place.
       */
      private findTarget(obj: Parser.Object, rel: string, ref: string, onFloor: boolean): string {
        var stacks = this.state["stacks"];
        var target: string;
        var found = false;
        for(var col = 0; col < stacks.length && !found; col++) {
          for(var row = 0; row < stacks[col].length && !found; row++) {
            if(ref === stacks[col][row]) {
              found = true;                       // found: stop searching...
              switch(rel) {
                case "leftof":
                  var pos = this.findToLeftPosition(stacks, obj, col, row);
                  if(pos.id)
                    target = pos.id
                  break;
                case "rightof":
                  var pos = this.findToRightPosition(stacks, obj, col, row);
                  if(pos.id)
                    target = pos.id
                  break;
                case "beside":
                  var leftPos = this.findToLeftPosition(stacks, obj, col, row)
                  var rightPos = this.findToRightPosition(stacks, obj, col, row)
                  if(leftPos && !rightPos)
                    target = leftPos.id;
                  if(rightPos && !leftPos)
                    target = rightPos.id;
                  if(leftPos && rightPos) {       // if both are alternatives pick the closest
                    var ldist = distance(col, row, leftPos.col, leftPos.row);
                    var rdist = distance(col, row, rightPos.col, rightPos.row);
                    target = ldist > rdist ? rightPos.id : leftPos.id;
                  }
                  break;
                case "above":
                  var pos = this.findAbove(stacks, obj, col, row)
                  if(pos.id)
                    target = pos.id
                  break;
                case "ontop":
                  if(onFloor) {                    // special: take the x ontop of the floor (refers to it self)
                    target = ref
                  } else {
                    var r = this.findObject(ref);
                    if(r.form !== "box")           // objects cannot be "ontop" of boxes (Physical law)
                      target = stacks[col][row+1]; // look directly above
                  }
                  break;
                case "inside":
                  var r = this.findObject(ref);
                  if(r.form === "box")             // objects cannot be "ontop" of boxes (Physical law)
                    target = stacks[col][row+1];   // look directly above
                  break;
                case "under":
                  var pos = this.findUnder(stacks, obj, col, row)
                  if(pos.id)
                    target = pos.id
                  break;
              }
            }
          }
        }
        return (this.match(obj, target) ? target : null);
      }

      private findToLeftPosition(stacks: string[][], obj: Parser.Object, col: number, row: number): Position {
        return this.find(stacks, obj, col-1, -1, 0, 1);
      }

      private findToRightPosition(stacks: string[][], obj: Parser.Object, col: number, row: number): Position {
        return this.find(stacks, obj, col+1, 1, 0, 1);
      }

      private findAbove(stacks: string[][], obj: Parser.Object, col: number, row: number): Position {
        return this.find(stacks, obj, col, 0, row+1, 1);
      }

      private findUnder(stacks: string[][], obj: Parser.Object, col: number, row: number): Position {
        return this.find(stacks, obj, col, 0, row-1, -1);
      }

      /*
       * Move through stacks from col and row position in col direction and row
       * direction, and look for object
       */
      private find(stacks: string[][], obj: Parser.Object, col: number, cdir: number, row: number, rdir: number): Position {
        var refPos: Position = {col: null, row: null, id: null};
        var found = false;
        var c = col;
        while((c < stacks.length && c >= 0) && !found) { // columns
          for(var r = row; (r < stacks[c].length && r >= 0) && !found; r += rdir) { // rows
            if(this.match(obj, stacks[c][r])) {
              found = true;
              refPos.id = stacks[c][r];
              refPos.row = r;
              refPos.col = c;
            }
          }
          if(cdir === 0) // only look up or down (no other column)
            break;
          c += cdir;
        }
        return refPos;
      }

      //////////////////////////////////////////////////////////////////////
      // Make literals of given objects, references and relation

      /*
       * Makes literals of objects and references, specified by pol and relation
       */
      private literals(objs: string[],
                       refs: string[],
                       rel: string,
                       swapped?: boolean,
                       tolerant?: boolean): Literal[][] {
        var combs = this.combinations(objs, refs);
        var lits = this.transform(combs, rel, swapped, tolerant);
        function swapArgs(lit: Literal) {
          var newArgs = [];
          newArgs[0] = lit.args[1];
          newArgs[1] = lit.args[0];
          return {pol: lit.pol, rel: lit.rel, args: newArgs};
        };
        if(swapped) { // swap the arguments
          lits = lits.map((arr: Literal[]) => {
            return arr.map(swapArgs);
          });
        }
        return lits;
      }

      /*
       * Gives the combinations of two lists of strings in form of Pair[][]
       */
      private combinations(objs: string[], refs: string[]): Pair[][] {
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
       * tranform Pair[][] to Literal[][].
       * If strict returns only those arrays that does not have error in any of
       * its positions.
       * If tolerant return all arrays except when there is no possible lit in
       * array.
       */
      private transform(matrix: Pair[][], rel: string, swapped: boolean, tolerant: boolean): Literal[][] {
        var error: string; // used for storing error that occured in an array of literals
        var lits = matrix.map((arr: Pair[]) => {
          var litArr = arr.map((pair: Pair) => {
            var obj = this.state["objects"][pair.obj];
            var ref = this.state["objects"][pair.ref];
            // keep track of error for each array
            if(obj !== ref) {
              var locErr = this.locationError(obj, rel, ref, swapped);
              if(locErr) { // set error only if not already set
                error = error || locErr;
              } else {
                return {pol: true, rel: rel, args: [pair.obj, pair.ref]};
              }
            }
          });
          return litArr;
        });
        if(tolerant) {
          return this.weedOutBadLits(lits, error);   // weed out only null(disallowed) literals from arrays
        } else {
          return this.weedOutBadArrays(lits, error); // weed out any array with null(disallowed) literal
        }
      }

      /*
       * Weeds out all bad arrays with any literal errors (strict)
       */
      private weedOutBadArrays(lits: Literal[][], error: string): Literal[][] {
        var weeded: Literal[][] = [];
        // If an error occured any way in the array dont add array to weeded
        for(var i = 0; i < lits.length; i++) {
          if(lits[i].every(Boolean)) // no literal is null in array => ok
            weeded.push(lits[i]);
        }
        if(weeded.length > 0)
          return weeded;
        // else get the first error
        throw new Interpreter.Error(error);
      }

      /*
       * Weeds out all bad literals with errors (tolerant)
       */
      private weedOutBadLits(lits: Literal[][], error: string): Literal[][] {
        var weeded: Literal[][] = [];
        // add all nonempty literals to weeded
        for(var i = 0; i < lits.length; i++) {
          weeded[i] = [];
          for(var j = 0; j < lits[i].length; j++) {
            if(lits[i][j]) // no error in array of literals => ok
              weeded[i].push(lits[i][j]);
          }
        }
        // if there are some non empty clauses return them else throw error
        var nonEmpty = weeded.filter((arr: Literal[]) => {
          return arr.length > 0;
        });
        if(nonEmpty.length > 0)
          return nonEmpty;
        throw new Interpreter.Error(error);
      }

      //////////////////////////////////////////////////////////////////////
      // Error checkers

      /*
       * Make error of type:
       * "Do you mean the large blue pyramid, the small yellow pyramid or the small red pyramid?"
       * relation is provided if objects are actually rederences and we want to
       * say that there are too many references with that relation
       */
      private tooManyObjectsError(objs: string[], rel?: string): string {
        var strobjs = objs.map((obj: string) => {
          var o = toObjectDef(this.findObject(obj));
          return " the" + objectToString(o);
        });
        strobjs.splice(-1, 0, "or");            // insert "or" before the last object
        var enumeration = strobjs.slice(0, -2); // commaseparated part of sentence
        var last = strobjs.slice(-2);           // last part of sentence
        return "Did you mean" + (rel ? (" " + rel) : "") + enumeration.join(",") + last.join("") + "?";
      }

      /*
       * Check if object is allowed at location according to physical laws.
       */
      private locationError(obj: Parser.Object, rel: string, ref: Parser.Object, swapped: boolean): string {
        // 0. Elementary assumptions
        var refObj = ref;
        if(swapped) { // refs are objects and objects refs
          var temp = refObj;
          refObj = toObjectDef(obj);
          obj = temp;
        }
        var objstr = objectToString(obj);
        var refstr = objectToString(refObj);
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
          if(size(obj.size) > size(refObj.size)) {
            return "The" + objstr + "is to large for the" + refstr;
          }
          // 4. Boxes cannot contain pyramids, planks or boxes of the same size.
          var plank = obj.form === "plank";
          var pyramid = obj.form === "pyramid";
          var box = obj.form === "box";
          var possibleConflict = plank || pyramid || box;
          var equalSize = size(refObj.size) === size(obj.size);
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
      private emptyError(objs: string[], refs: string[]): string {
        if(!objs || objs.length === 0)
          return "No objects found";
        if(!refs || refs.length === 0)
          return "No references found";
        return null;
      }

      //////////////////////////////////////////////////////////////////////
      // Helper methods

      /*
       * Checks if a given object matches the ObjectDefinition of an id in the
       * current world state.
       */
      private match(obj: Parser.Object, id: string): boolean {
        var rootObj = rootObject(obj);
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
       * Lookups ObjectDefinition in state
       */
      private findObject(id: string): ObjectDefinition {
        return this.state["objects"][id];
      }

      /*
       * Returns all ids in the world
       */
      private worldObjects(): string[] {
        var stacks = this.state["stacks"];
        var worldObjs = [].concat.apply([], stacks);
        var obj = this.state["holding"];
        if(obj)
          worldObjs.push(obj);
        return worldObjs;
      }

      /*
       * Finds all objects on floor
       */
      private floorObjects(): string[] {
        var stacks = this.state["stacks"];
        var floorObjs = stacks.map((arr: string[]) => {
          if(arr.length > 0)
            return arr[0];
        });
        return floorObjs.filter(Boolean); // return only nonempty
      }

      /*
       * Tells if an object id is on the bottom of any of the stacks
       */
      private isOnFloor(id: string): boolean {
        var floorObjs = this.floorObjects();
        return floorObjs.indexOf(id) > -1;
      }

      /*
       * Determines whether an object refers to the floor or not
       */
      private isFloor(obj: Parser.Object): boolean {
        var rootObj = rootObject(obj);
        if(rootObj.form === "floor")
          return true;
        return false;
      }

      /*
       * Literal that says object (id) is not ontop of any othe object in world
       * or held by arm.
       */
      private floorLiteral(ids: string[]): Literal[][] {
        var refs = this.worldObjects();
        var lits = ids.map((id: string) => {
          var litArr = refs.map((ref: string) => {
            return {pol: false, rel: "ontop", args: [id, ref]};
          });
          litArr = litArr.filter((lit: Literal) => { // filter out where obj and ref are not same
            return lit.args[0] !== lit.args[1];
          });
          litArr.push({pol: false, rel: "holding", args: [id]}); // add not holding lit aswell
          return litArr;
        });
        return [flatten(lits)];
      }


    } // class Interpret

    /*
     * Interface used to pair up obj and ref ids to use in Literal ("literals"
     * function)
     */
    interface Pair {
      obj: string;
      ref: string;
    }

    /*
     * Interface used to keep record of id of object and its position in the
     * state ("findtarget" function)
     */
    interface Position {
      col: number;
      row: number;
      id: string;
    }

    //////////////////////////////////////////////////////////////////////
    // Helper functions

    /*
     * Gets the root object of an object, i.e the top level object that it
     * object describes
     */
    function rootObject(obj: Parser.Object): Parser.Object {
      if(obj) {
        if(obj.size || obj.color || obj.form)
          return obj;
        return rootObject(obj.obj);
      }
    }

    /*
     * Lets us compare Object size numerically
     */
    function size(s: string): number {
      if(s === "large")
        return 2;
      else if(s === "small")
        return 0;
      return 1; // no size specified in object, apply rule of least intervention
    }

    /*
     * Flatten matrix to an array
     */
    function flatten(lits: Literal[][]): Literal[] {
      return [].concat.apply([], lits);
    }

    /*
     * Finds all unique combinations with objects and references not repeated in
     * a single literal array
     */
    function uniqueCombinations(lits: Literal[][],
                                objs: string[],
                                refs: string[]): Literal[][] {
      // sort literals according to ascending length
      var sortedLits = lits.sort((a: Literal[], b: Literal[]) => {
        return a.length - b.length;
      });
      return uniqueCombHelper(sortedLits, 0, objs, refs);
    }

    /*
     * Helper for uniqueCombinations (Recursive)
     */
    function uniqueCombHelper(lits: Literal[][],       // literals
                              lind: number,            // current literal index
                              objs: string[],
                              refs: string[]): Literal[][] {
      var literals: Literal[][] = [];
      // conditions for recursive step: there still are unused lits, objs, refs
      var enoughLits = lits && lind < lits.length;
      var someObjs = objs && objs.some(Boolean);
      var someRefs = refs && refs.some(Boolean);
      if(enoughLits && someObjs && someRefs) {
        // keep track of which objects and refs are used
        var unusedObjs = [];
        var unusedRefs = [];
        for(var i = 0; i < objs.length; i++) {
          var obj = objs[i];
          if(obj) {
            // clone objs and refs to enable mutation in this recursive level
            unusedRefs[i] = refs.slice();
            unusedObjs[i] = objs.slice();
            // filter out literal candidates that contains obj and unused ref
            var candidates = lits[lind].filter((lit: Literal) => {
              var hasObject = lit.args[0] === obj;
              var objIndex = unusedObjs[i].indexOf(lit.args[0]);
              var refIndex = unusedRefs[i].indexOf(lit.args[1]);
              // lit has object and unused reference mark them as used
              if(hasObject && refIndex > -1) {
                unusedObjs[i][objIndex] = null;
                unusedRefs[i][refIndex] = null;
                return true;
              } else {
                return false;
              }
            });
            if(candidates && candidates.length > 0) {
              // recursive case: get the rest of the unique combinations
              var temp: Literal[][] = uniqueCombHelper(lits, lind+1, unusedObjs[i], unusedRefs[i]);
              var newLits: Literal[][] = [];
              // for each candidate copy lits from recursive case and add cand
              candidates.forEach((lit: Literal) => {
                if(temp && temp.length > 0) {
                  newLits = temp.map((arr: Literal[]) => {
                    arr.push(lit);
                    return arr;
                  });
                } else {
                  newLits.push([lit]);
                }
                literals = literals.concat(newLits); // extend the current lits with new
              });
            }
          }
        }
      }
      // base case: the literal is empty
      return literals;
    }

    /*
     * removes duplicates from array
     */
    function unique(arr: any[]): any[] {
      var seen = {};
      return arr.filter((item: any) => {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
      });
    }

    /*
     * calculates the distance between 2 points
     */
    function distance(c1: number, r1: number, c2: number, r2: number): number {
      return Math.sqrt(Math.pow(c1 - c2, 2) + Math.pow(r1 - r2, 2));
    }

    function toObjectDef(obj: Parser.Object): ObjectDefinition {
      return {form: obj.form, size: obj.size, color: obj.color};
    }

    function objectToString(obj: Parser.Object): string {
      var str: string = "";
      if(obj.size)
        str += " " + obj.size;
      if(obj.color)
        str += " " + obj.color;
      if(obj.form)
        str += " " + (obj.form !== "anyform" ? obj.form : "object");
      if(obj.loc) // this only occurs when entityToString calls the function
        str += " " + locationToString(obj.loc);
      return str;
    }

    function locationToString(loc: Parser.Location): string {
      if(loc) {
        var isAboveOrUnder = loc.rel === "above" || loc.rel === "under";
        return loc.rel + (isAboveOrUnder ? " " : " of ") + entityToString(loc.ent);
      } else {
        return "";
      }
    }

    function entityToString(ent: Parser.Entity): string {
      if(ent.obj.obj)
        var objstr = objectToString(ent.obj.obj) + " " + locationToString(ent.obj.loc);
      else
        var objstr = objectToString(ent.obj);
      return ent.quant + objstr;
    }

    function literalsToString(litss: Literal[][]): string {
      return litss.map((lits) => {
        return lits.map((lit) => literalToString(lit)).join(" & ");
      }).join(" | ");
    }

}

