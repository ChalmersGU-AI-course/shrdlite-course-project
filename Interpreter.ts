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

        var verb : string = cmd.cmd;
        var loc : Parser.Location;
        var ent : Parser.Entity;
        
        var relation;
        var object1;
        var object2;
        var objects;
        
        if (verb == "take") {
        // we shall pick up something and hold it;
            ent = cmd.ent;
            object1 = findObjectFromEnt(ent);
            relation = "holding";
            objects = [object1];
       } else if (verb == "put") {
       // we are holding something, and shall place it somewhere
            object1 = whatAreWeHolding(state);
            // TODO: error handling if we are not actually holding anything
            loc = cmd.loc;
            relation = findRelFromLoc(loc);
            object2 = findObjFromLoc(loc);
            objects = [object1, object2]
       } else if (verb == "move") { 
       // we shall move something
            ent = cmd.ent;
            object1 = findObjectFromEnt(ent);
            loc = cmd.loc;
            relation = findRelFromLoc(loc);
            object2 = findObjectFromLoc(loc);
            objects = [object1, object2]
        }
           
        var intprt : Literal[][];
        intprt = [[
          {pol: true, rel: relation, args: args}
        ]];
        return intprt;
    }
    
    function findObjectFromEnt(state : WorldState, ent : Parser.Entity) : string {
      var form = ent.form;
      if (form == "floor") {
        return form;
      }
      //TODO: quantifiers
      
      //TODO: simple case: object has colour and form
      
      //TODO: complex case: object is described in relation to another object
      
      //TODO: error handling if object can't be found
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

