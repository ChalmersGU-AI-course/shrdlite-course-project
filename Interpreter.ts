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
        var pobjs: string[] = [];

        /*
              Structure for "put"
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
        //  Abort if no object found, if ambiguity and the quantifier is 'the', ask for clarification
        if (pobjs.length === 0) {
            console.log("Can't pickup something does not exist in the world");
            return null;
        } else if (cmd.ent.quant === "the" && pobjs.length > 1) {
            console.log("Please be more specific");
            //Possible extension to save the current data and ask a clarification question      <---TODO?
            return null;
        } else if(pobjs[0] === "_"){
            console.log("the floor cannot be a primary object");
            return null;
        }

        /*
            Structure for "take"
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
            Do correct stuff with "move"
                -Identify the primary objects o[]
                -See if such an object exists in the world
                -Identify the target objects t[] (i.e. "floor")
                -See if such an object exists in the world
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
    }
    
    function getObjectHelper(priObj: Parser.Object, secObj: Parser.Object,rel:string, state: WorldState):string[]{
        var possibleObjs:string[] = getPossibleObjects(priObj, state);
        if(secObj !== null && rel != null){
            var secondaryObjs:string[] = getPossibleObjects(secObj, state);
            possibleObjs = getRelation(possibleObjs, secondaryObjs, rel, state.stacks);
        }
        //Anything more?
        
        return possibleObjs;
    }

    function getPrimaryObjects(cmd: Parser.Command, state: WorldState):string[] {
        var priObj = cmd.ent.obj;
        var secObj = null;
        var rel = null;
        if (priObj.loc != undefined) {
            secObj = priObj.loc.ent.obj;
            rel = priObj.loc.rel;
            priObj = priObj.obj;
        }
        var possibleObjs: string[] = getObjectHelper(priObj, secObj, rel, state);
        return possibleObjs;
    }

    function getTargetObjects(cmd: Parser.Command, state: WorldState):string[] {
        var priObj = cmd.loc.ent.obj;
        var secObj = null;
        var rel = null;
        if (priObj.loc != undefined) {
            secObj = priObj.loc.ent.obj;
            rel = priObj.loc.rel;
            if (priObj.loc !== undefined) {
                priObj = priObj.obj;
            }
        }
        var possibleObjs:string[] = getObjectHelper(priObj, secObj, rel, state);
        return possibleObjs;
    }

    function getPossibleObjects(obj: Parser.Object, state: WorldState):string[] {
        // Extract the descriptive parts of the object
        // By using a set we do not have to handle the null parts.
        // We could just check that the parsed object's set is a subset of 
        // the object from the stack
        
        // Edge case for floor object
        if(obj.form === "floor")
          return ["_"];
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
    /**
     *  This method will take primary and target objects and check the command to see which relations is wanted and use the world state
     *  to see existing sizes and relations
     */
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
                    for (var j = 0; j < targets.length; j++) {
                        conjunction.push({ pol: true, rel: relation, args: [primobj[i], targets[j]] });
                    }
                }
                interpretations.push(conjunction);
            } else if (cmd.ent.quant === "all") {               //When all primary objects are related to a single target objects
                var permutations = Math.pow(targets.length, primobj.length);
                var dnf: Literal[][] = [];

                   for (var i = 0; i < permutations; i++) {
                       dnf.push([]);
                   }

                var offset = permutations / targets.length;

                for (i = 0; i < primobj.length; i++) {
                    for (var j = 0; j < targets.length; j++) {
                        var li = 0 + j * offset;
                        var limit = li + offset;
                        for (; limit < permutations + 1; limit = li + offset) {
                            for (; li < limit; li++) {
                                dnf[li].push({ pol: true, rel: relation, args: [primobj[i], targets[j]] });
                            }
                            li = li - offset + offset * targets.length;
                        }
                    }
                    offset = offset / targets.length;
                }
                for (i = 0; i < dnf.length;i++) {
                    interpretations.push(dnf[i]);
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

    /** 
     * This function returns how o2 relates to o1. e.g o2 is left of o1; 
     * returns 'none' if there is no relation
     * possible relations: left, right, inside, under, above (beside = left or right)
     */
    function getRelation(o1s : string[], o2s : string[], rel : string, stacks : string[][]) : string[]{
        var correct = new collections.Set<string>();
        
        // Special case when O2 is the floor. Floor has character "_"
        if(o2s.length === 1 && o2s[0] === "_" && rel === "ontop"){
            for(var i = 0; i < o1s.length; i++){
                var coo1 = getStackIndex(o1s[i],stacks);
                if(coo1[1] === 0)
                  correct.add(o1s[i]);         
            }
            return correct.toArray();
        }
        
        // Define comparator function according to given relation we are looking for
        var f;
        if (rel === "leftof")
            f = function(co1 : number[], co2 : number[]) {return co1[0] < co2[0] };
        else if(rel === "rightof")
            f = function(co1 : number[], co2 : number[]) {return co1[0] > co2[0] };
        else if(rel === "inside" || rel === "ontop")
            f = function(co1 : number[], co2 : number[]) {return co1[1] === (co2[1]+1) && co1[0] === co2[0] };
        else if(rel === "under")
            f = function(co1 : number[], co2 : number[]) {return co1[1] < co2[1] && co1[0] === co2[0]};
        else if(rel === "beside")
            f = function(co1 : number[], co2 : number[]) {return (co1[0] === (co2[0]-1)) || (co1[0] === (co2[0]+1)) };
        else if(rel === "above")
            f = function(co1 : number[], co2 : number[]) {return co1[1] > co2[1] && co1[0] === co2[0]};
        
        // Run through all objects and check if the relation holds, then store.
        for(var i = 0; i < o1s.length; i++){
            var coo1 = getStackIndex(o1s[i],stacks);
            for(var j = 0; j < o2s.length; j++){
                var coo2 = getStackIndex(o2s[j],stacks);
                if(f(coo1, coo2))
                    correct.add(o1s[i]);
            }
        }
        // TODO: Think of edge cases.
        return correct.toArray();
    }

    /**
     * Returns coordinates in the stack for a given object.
     * returns -1, -1 if element does not exist.
     */
    function getStackIndex(o1 : string, stacks : string[][]) : number[]{
        var cords:number[] = [-1, -1];
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
