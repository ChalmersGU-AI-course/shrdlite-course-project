///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="lib/collections"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses: Parser.Result[], currentState: WorldState): Result[] {
        var interpretations: Result[] = [];
        parses.forEach((parseresult) => {
            var intprt: Result = <Result>parseresult;
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


    export interface Result extends Parser.Result { intp: Literal[][]; }
    export interface Literal { pol: boolean; rel: string; args: string[]; }


    export function interpretationToString(res: Result): string {
        return res.intp.map((lits) => {
            return lits.map((lit) => literalToString(lit)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit: Literal): string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }


    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message?: string) { }
        public toString() {return this.name + ": " + this.message }
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd: Parser.Command, state: WorldState): Literal[][] {

        // This function is called once for each parse found.
        // cmd is the command found for this particular parse
        // state should be the current WorldState

        var intprt: Literal[][] = [];

        /*
            TODO: Structure for "put"
                -See if we hold an object o
                -Identify the target objects t[] (i.e. "floor")
                -See if such an object exists in the world
                -If ambiguity and the quantifier is 'the', ask for clarification
                -Check if the positioning is valid, (i.e. under(o, t))
                -Convert possible objects to interpretations in PDDL //Possibly more here?
                -Return interpretations
        */
        if (cmd.cmd === "put") {
            if (state.holding === null) {
                //No knowledge of "it"
                console.log("No knowledge of 'it'");
                return null;
            }
            var possibleTargets = getTargetObjects(cmd, state);
            if (possibleTargets.length < 1) {
                console.log("No target found");
                return null;
            } else if (possibleTargets.length > 1 && cmd.loc.ent.quant === "the") {
                console.log("Please be more specific with the target location");
                return null;
            }
            intprt = convertToPDDL(cmd, pobjs, possibleTargets, state);
            return intprt;
        }

        // Get possible objects the parse is referring to
        //  -Identify what objects we want
        //  -See if such an object exists in the world
        var pobjs = getPrimaryObjects(cmd, state);

        //  -If no object found, abort
        //  -If ambiguity and the quantifier is 'the', ask for clarification
        if (pobjs.length === 0) {
            console.log("Can't pickup something that is not real");
            return null;
        } else if (cmd.ent.quant === "the" && pobjs.length > 1) {
            console.log("Please be more specific");
            //Possible extension to save the current data and ask a clarification question      <---TODO?
            return null;
        }

        /*
            TODO: Structure for "take"
                -Identify what objects we want
                -See if such an object exists in the world
                -If no object found, abort
                -If ambiguity and the quantifier is 'the', ask for clarification
                -If quantifier is 'all', abort
                -Convert possible objects to interpretations in PDDL 
                -Return possible interpretations
        */
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

        /*
            TODO: Do correct stuff with "move"
                -Identify the primary objects o[]
                -See if such an object exists in the world
                -Identify the target objects t[] (i.e. "floor")
                -See if such an object exists in the world
                
                -Handle quantifications:
                    -   any -> the
                            -If ambiguity for target, ask for clarification
                    -   any -> any
                    -   any -> all

                    -   the -> the
                            -If ambiguity for primary OR target, ask for clarification
                    -   the -> any
                            -If ambiguity for primary, ask for clarification
                    -   the -> all
                            -If ambiguity for primary, ask for clarification

                    -   all -> the
                            -If ambiguity for target, ask for clarification
                    -   all -> any
                    -   all -> all
                -Handle relations:
                    - //NEEDED?
        
                -If ambiguity and the quantifier is 'the', ask for clarification
                -Check if the positioning is valid, ontop(o, t) 
        */
        else if (cmd.cmd === "move") {
            //TODO
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

    function getPrimaryObjects(cmd: Parser.Command, state: WorldState):string[] {
        var visuallyPossibleObjs:string[] = getPossibleObjects(cmd.ent.obj, state);
        //TODO: Filter out based on location

        return visuallyPossibleObjs;
    }

    function getTargetObjects(cmd: Parser.Command, state: WorldState):string[] {
        var visuallyPossibleObjs:string[] = getPossibleObjects(cmd.loc.ent.obj, state);
        //TODO: Filter out based on location

        return visuallyPossibleObjs;
    }

    function getPossibleObjects(obj: Parser.Object, state: WorldState):string[] {
        // Extract the descriptive parts of the object
        // By using a set we do not have to handle the null parts.
        // We could just check that the parsed object's set is a subset of 
        // the object from the stack

        var objSet:collections.Set<string> = new collections.Set<string>(); // Store the values of the object
        objSet.add(obj.size);
        objSet.add(obj.color);
        objSet.add(obj.form);
        objSet.remove("anyform");
        objSet.remove(null);

        var possibleObjects:string[] = [];
        // Loop through the world and look for possible items
        var objs: string[] = Array.prototype.concat.apply([], state.stacks);
        for (var s:number = 0; s < objs.length; s++) {
            var otemp:ObjectDefinition = state.objects[objs[s]];
            var stemp:collections.Set<string> = new collections.Set<string>();

            // Extract the parts of o into s and check if objSet is subset of s.
            stemp.add(otemp.form);
            stemp.add(otemp.size);
            stemp.add(otemp.color);

            // If the parse object is subset of the current temp object add to "possible objects"-array
            if (objSet.isSubsetOf(stemp))
                possibleObjects.push(objs[s]);
        }
        return possibleObjects;
    }

    //This method will take primary and target objects and check the command to see which relations is wanted and use the world state
    //to see existing sizes and relations
    function convertToPDDL(cmd: Parser.Command, primobj: string[], targets : string[], state : WorldState) : Literal[][] {
        var interpretations: Literal[][] = [];
        //TODO
        return interpretations;
    }

    function getRandomInt(max):number {
        return Math.floor(Math.random() * max);
    }

}
