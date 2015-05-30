///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="lib/utils.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    export interface Result extends Parser.Result {intp:Literal[][];
    }
    export interface Literal {pol:boolean; rel:string; args:string[];
    }
    /**
	 * A type used to hold both the relation to the objects and a disjunct list of the objects.
	 */
    interface Sayings {rel:string; objs:string[][]
    }
    /**
    * A type used to have a tuple with the object and location relation. 
    */
    interface objLocPair {obj:string; loc:string
    }

    export function interpretationToString(res:Result):string {
        return res.intp.map((lits) => {
            return lits.map((lit) => literalToString(lit)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit:Literal):string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }

    export class Error implements Error {
        public name = "Interpreter.Error";

        constructor(public message?:string) {
        }

        public toString() {
            return this.name + ": " + this.message
        }
    }
    /**
     * Returns a list of interpretations given a list of parse results and a world state
     * @returns {Result[]}, a list of different valid interpretations.
     */
    export function interpret(parses:Parser.Result[], currentState:WorldState):Result[] {
        var interpretations:Result[] = [];

        parses.forEach((parseresult) => {
            var intprt:Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp.length > 0) {
            	if(!interpretationListContains(interpretations, intprt)){
                	interpretations.push(intprt);
            	}
            }
        });

        if (interpretations.length) {
            if (interpretations.length > 1) {

                //throw new Interpreter.Error("Found ambiguous interpretations");
            }

            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }

    //////////////////////////////////////////////////////////////////////
    // private functions

    
    /**
     * Returns a complete interpretation given a parse command and a world state
     * @returns {Literal[][]}, A disjunction between conjunct literals.
     */
    function interpretCommand(cmd:Parser.Command, state:WorldState):Literal[][] {
        var lit:Literal[][] = [];
        if (cmd.cmd === "move" || cmd.cmd === "put") {
            var objs:string[][];
            // The objects to move
            objs = (cmd.cmd === "move" || state.holding === null) 
            	? interpretEntity(cmd.ent, state) : [[state.holding]];
            // The objects to put the objects on.
            var locs:Sayings = interpretLocation(cmd.loc, state);
            // Build all viable rules to give the planner
            var conjunct:objLocPair[][] = buildRules(true, objs, locs, state);

            //Build move or put list
            conjunct.map(or => {
                var list:Literal[] = or.map(and => {return {pol: true, rel: locs.rel, args: [and.obj, and.loc]};});
                if (list.length > 0) {
                    lit.push(list);
                }
            });

        } else {
        	//the objects to take
            var objs:string[][] = interpretEntity(cmd.ent, state);
        	//build the take list
            objs.map(or => or.map(obj => {
    			if(obj !== "floor"){
        			lit.push([{pol: true, rel: "holding", args: [obj]}]);
        		}
    		}));
        }
        return lit;
    }

    /**
     * Returns a disjunction of conjunct object strings depending on the content of {Parser.Entity}. 
     * @returns {string[][]}, A disjunction between conjunct strings. 
     */
    function interpretEntity(ent:Parser.Entity, state:WorldState):string[][] {
        var objs:string[][] = interpretObject(ent.obj, state);
        if (ent.quant === "the") {
            if(objs.length>1){
            	throw new Interpreter.Error("There are more than one object that matches that description.");
            }    
            return objs;
        }
        if (ent.quant === "all") {
            var disj:string[][] = [Array.prototype.concat.apply([], objs)];
            return disj;
        }
        //any
        return objs;
    }

    /**
     * Returns a disjunction of conjunct object strings depending on the content of {Parser.Object}. 
     * @returns {string[][]}, A disjunction of {string[]} with one {string} in each. 
     */
    function interpretObject(obj:Parser.Object, state:WorldState):string[][] {
        var objs:string[][] = [];
        if (obj.obj != null) {
        	objs = interpretObject(obj.obj, state);
            var locs:Sayings = interpretLocation(obj.loc, state);
            var disj:objLocPair[][] = buildRules(false, objs, locs, state);

            objs = [];
            disj.map(l => {
                var r:string[] = [];
                l.map(p => {if(r.indexOf(p.obj)<0){ r.push(p.obj);}});
                // Check if there is any array with the same objects inside as the new one.
                // in short terms: objs.contains(r)
                if(r.length > 0 && !stringListListContains(objs, r)){            	
	                objs.push(r);
	            }
            });
        } else {
            var objsindexes:string[] = state.getObjectByDefinition(obj.form, obj.size, obj.color);
            objs = objsindexes.map(o => [o]);
        }
        return objs;
    }

    /**
     * Returns a {Saying} build up depending on the information in {Parser.Location}. 
     * @returns {Saying}, A disjunction between conjunct strings and what the relation is supposed to be to them. 
     */
    function interpretLocation(loc:Parser.Location, state:WorldState):Sayings {
        return {rel: loc.rel, objs: interpretEntity(loc.ent, state)};
    }

    /**
     * Constructs all valid pairs of objects given objs, locs, futureState and a worldState.
     * @returns {objLocPair[][]}, A disjunction between conjunct objLocPairs. 
     */
    function buildRules(futureState:boolean, objs:string[][], locs:Sayings, state:WorldState):objLocPair[][] {
        var finalSet:objLocPair[][] = [];
        if (objs.length === 0 || locs.objs.length === 0) {
            return finalSet;
        }

        //all rules
        var rules:objLocPair[][] = buildAllDisjunctions(futureState, locs.rel, objs, locs.objs, state);
        if (rules.length === 0) {
            return finalSet;
        }        
        //remove duplicates
        var noDups : objLocPair[][] = rules.filter(conj => !containsDuplicateObjLocPair(conj));  
        if (noDups.length === 0) {
            return finalSet;
        }

        // filter physical
        var filtered:objLocPair[][] = noDups.filter(row => controlRuleSet(futureState, row, locs.rel, state));
        if (filtered.length === 0) {
            return finalSet;
        }
        //remove duplicates between conjunctive rules
        filtered.map(row => {
            if (!objLocPairListListContains(finalSet, row)) {
                finalSet.push(row);
            }
        });
        return finalSet;

    }

    /**
     * Given two disjunct lists of strings a new disjunct list of {objLocPair} is created.
     * @returns {objLocPair[][]}, A disjunction between conjunct objLocPairs. 
     */
    function buildAllDisjunctions(futureState:boolean, rel:string, objs:string[][], locs:string[][], state:WorldState):objLocPair[][] {
        if (objs.length === 0 || locs.length === 0){
         	return [];
     	}
        var result:objLocPair[][] = [];
        var ruleLength:number = locs[0].length * objs[0].length;      
        //Transpose depending on relation of objects and locations
        if(locs.length === 1 && locs[0][0] !== "floor"){
        	if(rel === "ontop" || rel === "inside"){
	    		if(locs[0].length>8){
	    			return [];
	    		}
	    		objs = utils.transpose(objs); 
        	} else {
        		if(locs[0].length>8){
        			console.log(state.getNrOfObjects("any","any","any"));
        			console.log(locs[0].length);
        			if(locs[0].length=== state.getNrOfObjects("any","any","any")+1){ //floor
        				return [];
        			}
	    			throw new Interpreter.Error("The interpreter is too stupid to handle the permutations");
	    		}
        	}
    	} else {
    		if(objs[0].length>8){
    			throw new Interpreter.Error("The interpreter is too stupid to handle the permutations");
    		}
	    	locs = utils.transpose(locs);
    	}

        objs.map(x => locs.map(y => {
            // filter objects that are not possible
            var fx:string[];
            var fy:string[];
            if (futureState) {
                fx = x.filter(o => y.some(l => state.validPlacement(o, l, rel)));
                fy = y.filter(l => x.some(o => state.validPlacement(o, l, rel)));
            	console.log("obj: ", fx, " loc: ",fy, " Lengths: "+ fx.length, ", ",fy.length);
            } else {

                fx = x.filter(o => y.some(l => state.relationExists(o, l, rel)));
                fy = y.filter(l => x.some(o => state.relationExists(o, l, rel)));
                console.log("obj: ", fx, " loc: ",fy, " Lengths: "+ fx.length, ", ",fy.length);
            }
            if (fx.length !== 0 && fy.length !== 0) {
            	//Create the conjunctions
                var disjs:objLocPair[][] = combineConj(fx, fy, rel, ruleLength);
                disjs.map(conj => result.push(conj));
            }
        }));
        return result;
    }

    /**
     * Creates all permutations of the conjunctions between the two parameters objs and locs {string[]}
     * @returns {objLocPair[][]}, 
     */
    function combineConj(objs:string[], locs:string[], rel:string, ruleLength:number):objLocPair[][] {
        var allRules:objLocPair[][] = [];
        if (locs.length === 1 && locs[0] === "floor") {
            //special case for floor
            var row:objLocPair[] = []
            objs.map(o => row.push({"obj": o, "loc": locs[0]}));
            allRules.push(row);
        }
        else {
            var p1:string[][] = [];
            var p2:string[][] = [];
            if(objs.length > 8){
                //n = 9 : 9*8*...*2*1 different arrays
                //this will be a lot of and therefor permutation space is reduced.
  				objs = objs.slice(0,8);
        	}
        	p1 = utils.permute(objs, [], []);        	
        	if(locs.length > 8){
        		//this will be a lot of and therefor permutation space is reduced.
  				locs = locs.slice(0,8);
  			}
  			p2 = utils.permute(locs, [], []);

            p1.map(obj =>
                p2.map(loc => {
                    var row:objLocPair[] = [];
                    for (var i = 0; i < ruleLength; i++) {
                        row.push({"obj": obj[i % objs.length], "loc": loc[i % locs.length]});
                    }
                    allRules.push(row);
            }));
        }
        return allRules;
    }

    /**
     * Controls the conjunctive rules with the worldstate. 
     * @returns true if all rules are possible individually.
     */
    function controlRuleSet(futureState:boolean, rules:objLocPair[], rel:string, state:WorldState):boolean {
        var valid : boolean =  futureState ?
	        rules.every(r => r.obj !== r.loc && state.validPlacement(r.obj, r.loc, rel)) :
	        rules.every(r => r.obj !== r.loc && state.relationExists(r.obj, r.loc, rel));
	    var doubleRef : boolean = rules.some(p1=> rules.some(p2 => (p1!==p2 && p1.obj ===p2.loc && p1.loc === p2.obj)));
	    var b : boolean = rel === "leftof" || rel === "rightof";
	    if(b){
	    	return valid && !doubleRef;
	    }
	    return valid;
    }

    /**
     * A contains method where the objects are {string[]}
     * @returns true if there is one such list where all {string} objects has a match.
     */
    function stringListListContains(list : string[][], sl : string[]) : boolean {
    	return list.some(and => and.every(o1 => sl.some(o2 => o1===o2)));
    }
    
    /**
     * A contains method where the objects are {objLocPair[]}
     * @returns true if there is one such list where all {objLocPair} objects has a match.
     */
    function objLocPairListListContains(list:objLocPair[][], olpl : objLocPair[]) : boolean {
    	return list.some(l => objLocPairListEquals(l,olpl))
    }

    /**
     * A verification method used to see if there is a duplicate rule in a conjunction
     * @returns true if there is two or more rules that are the same.
     */
    function containsDuplicateObjLocPair(conj : objLocPair[]) : boolean{
    	return conj.some(o1 => conj.some(o2 => (o1!==o2 && objLocPairEquals(o1,o2))));
    }

    /**
     * An equals method for the object {objLocPair[]}
     * @returns true if all rules in the first list exists in the second.
     */
    function objLocPairListEquals(conj:objLocPair[], newConj:objLocPair[]) : boolean{
        return conj.every(o1 => newConj.some(o2 => objLocPairEquals(o1,o2)));
    }

    /**
     * An equals method for the object {objLocPair}
     * @returns true if the objLocPairs match.
     */
    function objLocPairEquals(o1 : objLocPair, o2 : objLocPair) : boolean {
    	return o1.obj === o2.obj && o1.loc === o2.loc;
    }

    /**
     * An contains method for the object {Result}
     * @returns true if the second argument already is in the list.
     */
    function interpretationListContains(list : Result[], intrprt : Result) : boolean {
    	return list.some(intp => interpretationEquals(intp,intrprt));
    }

    /**
     * An equals method for the object {Result}
     * @returns true if the disjunctive list of rules exists in the second.
     */
    function interpretationEquals(intrprt1 : Result, intrprt2 : Result) : boolean{
    	return intrprt1.intp.every(and1 => intrprt2.intp.some(and2 => andSetEquals(and1,and2)));
    }
    /**
     * An equals method for the object {Literal[]}
     * @returns true if the conjunctive list of rules exists in the second.
     */
    function andSetEquals(and1 : Literal[], and2 : Literal[]) : boolean{
    	return and1.every(o1 => and2.some(o2 => literalEquals(o1,o2)));
    }

    /**
     * An equals method for the object {Literal}
     * @returns true if the conjunctive list of rules exists in the second.
     */
    function literalEquals(lit1 : Literal, lit2 : Literal) : boolean {
    	return lit1.pol === lit2.pol && lit1.rel === lit2.rel && 
    		((lit1.args[0] === lit2.args[0]) && 
    		(lit1.rel==="holding" || lit1.args[1] === lit2.args[1]));
    }
}

