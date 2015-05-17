///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="lib/collections"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp !== null) {
                interpretations.push(intprt);
            }
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
        
        // This function is called once for each parse found.
        // cmd is the command found for this particular parse
        // state should be the current WorldState

        var intprt: Literal[][] = [];

        // What quantity are we looking for? 0 = any, 1 = the, 2 = all
        var quant = -1
        if(cmd.ent.quant == "the")
          quant = 1;
        else if (cmd.ent.quant == "any")
          quant = 0;
        else if (cmd.ent.quant == "all")
          quant = 2;
        
        
        // Get possible objects the parse is referring to
        var pobjs = getPossibleObjects(cmd, state);
        var b = pobjs[0];
        if (cmd.cmd === "take") {
            /*
            TODO: Do correct stuff with "take"
                -Identify what obj we want
                -See if such an object exists in the world
                -If ambiguity and the quantifier is 'the', ask for clarification //Om samma size, �nd� fr�ga?
            */
            
            if (cmd.ent.quant === "all") {
                //Can't hold more than one object
                //CHANGE IF ADDING ANOTHER ARM
                console.log("Can't hold more than one object");
                return null;
            }
            
            if(pobjs.length===0){
                console.log("Can't pickup something that do not exists in the world");
                return null;
            }
            for (var i = 0; i < pobjs.length; i++) {
                intprt.push([{ pol: true, rel: "holding", args: [pobjs[i]] }]);
            }    
        }
        else if (cmd.cmd === "put") {
            if (state.holding === null) {
                //No knowledge of "it"
                console.log("No knowledge of 'it'");
                return null;
            }
            //TODO: Do correct stuff with "put"
        }
        else if (cmd.cmd === "move") {
            //TODO: Do correct stuff with "move"
        } else {
            console.log("Found no valid command");
            return null;
        }
        return intprt;

    /*
        WONT REACH FURTHER DOWN, JUST KEEPING AS EXAMPLE

        // Dummy stuff
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[2];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    */
    }

    function getPossibleObjects(cmd : Parser.Command, state : WorldState){
        // Extract the descriptive parts of the object
        // By using a set we do not have to handle the null parts.
        // We could just check that the parsed object's set is a subset of 
        // the object from the stack
     
        var objSet = new collections.Set<string>(); // Store the values of the object
        var o = cmd.ent.obj;
        objSet.add(o.size);
        objSet.add(o.color);
        objSet.add(o.form);
        objSet.remove("anyform");
        objSet.remove(null);

        var possibleObjects = [];
        // Loop through the world and look for possible items
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        for(var s = 0; s < objs.length; s++){
          var otemp = state.objects[objs[s]];
          var stemp = new collections.Set<string>();
        
          // Extract the parts of o into s and check if objSet is subset of s.
          stemp.add(otemp.form);
          stemp.add(otemp.size);
          stemp.add(otemp.color);
        
        // If the parse object is subset of the current temp object add to "possible objects"-array
          if(objSet.isSubsetOf(stemp))
            possibleObjects.push(objs[s]);   
        }
        return possibleObjects;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

