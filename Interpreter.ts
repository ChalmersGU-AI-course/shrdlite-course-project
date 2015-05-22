///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
          var intprt : Result = <Result>parseresult;
          try {
            intprt.intp = interpretCommand(intprt.prs, currentState);
            interpretations.push(intprt);
          } catch (err) {
            if (err instanceof Ambiguity) {
              var msg : string = "Ambiguous command. Please try again, while being more specific about the ";
              msg = msg + err.message + ".";
              throw new Interpreter.Error(msg);
            }
          }
        });
        if (interpretations.length == 0) {
          throw new Interpreter.Error("No valid interpretation found.");
        } else if (interpretations.length > 1) {
          // Scenario: the user used too many relative descriptors. We can't say
          // what they were ambiguous about
          var msg : string = "Ambiguous command. Please use fewer relative descriptions.";
          throw new Interpreter.Error(msg);
        } else {
          return interpretations;
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
    
    export class Ambiguity implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }

    

    //////////////////////////////////////////////////////////////////////
    // private functions
    

    function interpretCommand(cmd : Parser.Command, state : WorldState) : Literal[][] {
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);

        var verb : string = cmd.cmd;
        var loc : Parser.Location;
        var ent : Parser.Entity;
        
        var relation : string;
        var object1 : string;
        var object2 : string;
        var objects : string[];
        
        if (verb == "take") {
        // we shall pick up something and hold it;
            ent = cmd.ent;
            object1 = findObjectFromEnt(state, ent);
            relation = "holding";
            objects = [object1];
       } else if (verb == "put") {
       // we are holding something, and shall place it somewhere
            object1 = whatAreWeHolding(state);
            if (object1 == null) {
              throw new Error("The arm is not holding anything.");
            }
            loc = cmd.loc;
            relation = loc.rel;
            object2 = findObjectFromLoc(state, loc);
            objects = [object1, object2]
       } else if (verb == "move") { 
       // we shall move something
            ent = cmd.ent;
            object1 = findObjectFromEnt(state, ent);
            loc = cmd.loc;
            relation = loc.rel;
            object2 = findObjectFromLoc(state, loc);
            objects = [object1, object2]
        }
           
        var intprt : Literal[][];
        intprt = [[
          {pol: true, rel: relation, args: objects}
        ]];
        return intprt;
    }
    
    
    
    function findObjectFromEnt(state : WorldState, ent : Parser.Entity) : string {
      var obj : Parser.Object = ent.obj;
      var quant : string = ent.quant;
      
      if ((quant != "any") && (quant != "the")) {
        throw new Error("Quantifier not implemented yet; use \"the\" or \"any\"");
        //TODO: handle "any" differently from "the"
      }
      
      var candidates : string[];
      
      candidates = findObjectsFromObject(state, obj);
      
      if (candidates.length == 0) {
        throw new Interpreter.Error("Object cannot be found");
      } else if (candidates.length > 1) {
        var form : string = state.objects[candidates[0]].form;
        throw new Ambiguity(form);
      } else {
        return candidates[0];
      }
      
    }
   
      // Takes a Parser.Object, return a list of all objects it could refer to
      function findObjectsFromObject(state : WorldState, obj : Parser.Object) : string[] {
      
      var form : string = obj.form;
      var color : string = obj.color;
      var size : string = obj.size;
      
      var candidates : string[];
      
      if (form != null) {
        // Simple case: size and colour are optional
        if (form == "floor") {
          return [form];
        } else {
          candidates = getAllObjectsOfDesc(state, form, color, size);
          return candidates;
        }
        
      } else {
        // Complex case: no size, colour or form;
        // Only another object and location:
        // e.g. [blue ball] [[left of] [any red box]]
        // i.e. [obj2] [location: [rel] [ent]]
        var obj2 = obj.obj;
        var loc = obj.loc;
        var candidatesForObject = findObjectsFromObject(state, obj2);
        candidates =
          candidatesWhichSatisfyRelation(state, candidatesForObject, loc);
        return candidates;
      }
    }
    
    function candidatesWhichSatisfyRelation(state : WorldState, cands : string[], loc : Parser.Location) : string[] {
        var rel : string = loc.rel;
        var ent : Parser.Entity = loc.ent;
        // Then find the entity it's defined in relation to:
        var otherObject : string = findObjectFromEnt(state, ent);
        
        var results : string[] = [];
        cands.forEach((candidate) => {
          if (fulfilsCondition(state, rel, candidate, otherObject)) {
              results.push(candidate);
            }
        });
        return results;
    }
    
    function fulfilsCondition(state : WorldState, rel : string, a : string, b : string) : boolean {
        var aPos : number[] = find_obj(state.stacks, a);
        var bPos : number[];
        
        if (b == "floor") {
          if (rel == "above") {
            return true;
          } else if (rel == "ontop") {
            return (aPos[1] == 0);
          } else {
            //Can't be under, beside, leftof, rightof, or inside the floor
            return false;
          }
          
        } else {
        
          bPos = find_obj(state.stacks, b);
          if (rel == "leftof") {
            return (aPos[0] < bPos[0]);
          } else if (rel == "rightof") {
            return (aPos[0] > bPos[0]);          
          } else if (rel == "beside") {
            return (Math.abs(aPos[0] - bPos[0]) == 1);
          } else if (rel == "under") {
            return ((aPos[0] == bPos[0]) &&
                    ((aPos[1] - bPos[1]) < 0));   
          } else if (rel == "above") {
            return ((aPos[0] == bPos[0]) &&
                    ((aPos[1] - bPos[1]) > 0));                      
          } else if (rel == "ontop") {
            return ((aPos[0] == bPos[0]) &&
                    ((aPos[1] - bPos[1]) == 1));          
          } else if (rel == "inside") {
            return ((aPos[0] == bPos[0]) &&
                    ((aPos[1] - bPos[1]) == 1) &&
                    state.objects[b].form == "box");
          } else {
          //something is wrong; every relation should be one of the above
            throw new Error("Unsupported relation");
          }
        }
    }
    
    function find_obj(stacks : string[][], obj : string) {
      for (var i = 0 ; i < stacks.length; i++){
        for (var ii = 0 ; ii < stacks[i].length ; ii++){
          if (obj == stacks[i][ii]){
            return [i,ii]  
          }
        } 
      }
      throw new Error("No such object");
    }
        
    
    // Returns all objects in the world which fit a given (form, ?color, ?size) description
    function getAllObjectsOfDesc(state : WorldState, form : string, color : string, size : string) : string[] {
      var candidates : string[] = [];
      function isCandidate(objDef) : boolean {
        return ((objDef.form == form) && 
              (color == null || objDef.color == color) &&
              (size == null || objDef.size == size));
      }
      if (state.holding != null){
        var objDef : ObjectDefinition = state.objects[state.holding];
        isCandidate(objDef) ? candidates.push(state.holding) : 0 ;
      }
      state.stacks.forEach((stack) => {
        stack.forEach((objectInStack) => {
          var objDef : ObjectDefinition = state.objects[objectInStack];
                isCandidate(objDef) ? candidates.push(objectInStack) : 0 ; 
        });
      });
      return candidates;
    }

    function findRelFromLoc(state : WorldState, loc : Parser.Location) : string {
      return loc.rel;
      // Possible results: leftof, rightof, ontop, under, above, beside, inside
    }
    
    function findObjectFromLoc(state : WorldState, loc : Parser.Location) : string {
      var ent : Parser.Entity = loc.ent;
      return findObjectFromEnt(state, ent);
    }
    
    function whatAreWeHolding(state : WorldState) : string {
      return state.holding;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

