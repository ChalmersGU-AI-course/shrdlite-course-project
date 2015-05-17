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
        var pobjs = [];

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
            pobjs.push(state.holding);
            intprt = convertToPDDL(cmd, pobjs, possibleTargets);
            return intprt;
        }

        // Get possible objects the parse is referring to
        //  -Identify what objects we want
        //  -See if such an object exists in the world
        pobjs = getPrimaryObjects(cmd, state);

        //  -If no object found, abort
        //  -If ambiguity and the quantifier is 'the', ask for clarification
        if (pobjs.length === 0) {
            console.log("Can't pickup something does not exist in the world");
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
            //Can't hold more than one object
            if (cmd.ent.quant === "all") {
                //CHANGE IF ADDING ANOTHER ARM
                console.log("Can't hold more than one object");
                return null;
            }
            intprt = convertToPDDL(cmd, pobjs, null);
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
            //----------------------------SAME AS "PUT"
            var possibleTargets = getTargetObjects(cmd, state);
            if (possibleTargets.length < 1) {
                console.log("No target found");
                return null;
            } else if (possibleTargets.length > 1 && cmd.loc.ent.quant === "the") {
                console.log("Please be more specific with the target location");
                return null;
            }
            intprt = convertToPDDL(cmd, pobjs, possibleTargets);
            //----------------------------SAME AS "PUT"
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
    function convertToPDDL(cmd: Parser.Command, primobj: string[], targets : string[]) : Literal[][] {
        var interpretations: Literal[][] = [];

        //cmd is "take"
        if (cmd.cmd === "take") {
            for (var i = 0; i < primobj.length; i++) {
                interpretations.push([{ pol: true, rel: "holding", args: [primobj[i]] }]);
            }
        }
        //cmd is "put"
        else if (cmd.cmd === "put") {
            //TODO: make sure only valid moves are possible at this stage i.e  where the object held by the arm has valid relations to all targets
            for (var i = 0; i < targets.length; i++) {
                interpretations.push([{ pol: true, rel: cmd.loc.rel, args: [primobj[0], targets[i]] }]);
            }
        }
        //cmd is "move"
        else {
            var relation: string = cmd.loc.rel;

            if (cmd.ent.quant === "all" && cmd.loc.ent.quant === "all") { //When all primary objects are related to all target objects
                var conjunction: Literal[] = [];
                for (var i = 0; i < primobj.length; i++) {
                    for (var j = 0; j < primobj.length; j++) {
                        conjunction.push({ pol: true, rel: relation, args: [primobj[i], targets[j]] });
                    }
                }
                interpretations.push(conjunction);
            } else if (cmd.ent.quant === "all") {       //When all primary objects are related to a single target object
                for (var j = 0; j < targets.length; j++) {
                    var conjunction: Literal[] = [];
                    for (var i = 0; i < primobj.length; i++) {
                        conjunction.push({ pol: true, rel: relation, args: [primobj[i], targets[j]] });
                    }
                    interpretations.push(conjunction);
                }
            } else if (cmd.loc.ent.quant === "all") { //When a single primary object is related to all target objects
                for (var i = 0; i < primobj.length; i++) {
                    var conjunction: Literal[] = [];
                    for (var j = 0; j < targets.length; j++) {
                        conjunction.push({ pol: true, rel: relation, args: [primobj[i], targets[j]] });
                    }
                    interpretations.push(conjunction);
                }
            } else { //When a single primary object is related to a single target object
                for (var i = 0; i < primobj.length; i++) {
                    for (var j = 0; j < targets.length; j++) {
                        interpretations.push([{ pol: true, rel: relation, args: [primobj[i], targets[j]] }]);
                    }
                }
            }
        }

        return interpretations;
    }

    // This function returns how o2 relates to o1. e.g o2 is left of o1; 
    // returns 'none' if there is no relation
    // possible relations: left, right, inside, under, above (beside = left or right)
    function getRelation(o1 : string, o2 : string, stacks : string[][]) : string{
        var coo1 = getStackIndex(o1,stacks);
        var coo2 = getStackIndex(o2,stacks);
        // Check so both elements exist
        if(coo1[0] === -1 || coo1[1] === -1 || coo2[0] === -1 || coo2[1] === -1)
          return 'nonexistent';

        // O1 left of O2
        if(coo1[0] < coo2[0])
          return "left";
        // O1 right of O2
        if(coo1[0] > coo2[0])
          return "right";
        // O1 inside (or on top of) O2
        if(coo1[1] === (coo2[1]+1))
          return "inside";
        // O1 above O2
        if(coo1[1] > coo2[1])
          return "above";
        // O1 directly under O2
        if(coo1[1] === (coo2[1]-1))
          return "under";
        // O1 below O2
        if(coo1[1] < coo2[1])
          return "below";
        
        return 'none';
    }

    // Returns coordinates in the stack for a given object ; returns -1, -1 if element does not exist.
    function getStackIndex(o1 : string, stacks : string[][]) : number[]{
        var cords = [-1, -1];
        for(var i = 0; i < stacks.length; i++){
            for(var j = 0; j < stacks[i].length; j++){
                if(stacks[i][j] === o1){
                    cords[0] = i;
                    cords[1] = j;
                }
            }
        }
        return cords;
    }

    function getRandomInt(max):number {
        return Math.floor(Math.random() * max);
    }

}
