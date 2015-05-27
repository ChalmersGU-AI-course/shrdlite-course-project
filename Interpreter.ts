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
    interface Sayings {rel:string; objs:string[][]
    }
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

    function interpretCommand(cmd:Parser.Command, state:WorldState):Literal[][] {
        var lit:Literal[][] = [];
        if (cmd.cmd === "move" || cmd.cmd === "put") {
            var objs:string[][];
            objs = (cmd.cmd === "move" || state.holding === null) 
            	? interpretEntity(cmd.ent, state) : [[state.holding]];
            var locs:Sayings = interpretLocation(cmd.loc, state);
            var disjunct:objLocPair[][] = buildRules(true, objs, locs, state);

            disjunct.map(or => {
                var list:Literal[] = or.map(and => {return {pol: true, rel: locs.rel, args: [and.obj, and.loc]};});
                if (list.length > 0) {
                    lit.push(list);
                }
            });

        } else {
            var objs:string[][] = interpretEntity(cmd.ent, state);
            objs.map(or => {   // obj or 
                var list:Literal[] = or.map(obj => {return {pol: true, rel: "holding", args: [obj]};});
                if (list.length > 0) {
                    lit.push(list);
                }
            });
        }
        return lit;
    }

    function interpretEntity(ent:Parser.Entity, state:WorldState):string[][] {
        var objs:string[][] = interpretObject(ent.obj, state);
        if (ent.quant === "the") {
            if (objs.length > 1) {
                throw new Interpreter.Error("There are more than one object that matches that description.");
            } else {
                return objs;
            }
        }
        if (ent.quant === "any") {
            return objs;
        }
        if (ent.quant === "all") {
            var disj:string[][] = [];
            var conj:string[] = Array.prototype.concat.apply([], objs);
            disj.push(conj);
            return disj;
        }
        return objs;
    }

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

    function interpretLocation(loc:Parser.Location, state:WorldState):Sayings {
        return {rel: loc.rel, objs: interpretEntity(loc.ent, state)};
    }

    function buildRules(futureState:boolean, objs:string[][], locs:Sayings, state:WorldState):objLocPair[][] {
        var finalSet:objLocPair[][] = [];
        if (objs.length === 0 || locs.objs.length === 0) {
            return finalSet;
        }

        //all rules
        var rules:objLocPair[][] = buildStates(futureState, locs.rel, objs, locs.objs, state);
        if (rules.length === 0) {
            return finalSet;
        }
        // filter physical
        var filtered:objLocPair[][] = rules.filter(row => controlRuleSet(futureState, row, locs.rel, state));
        if (filtered.length === 0) {
            return finalSet;
        }
        //remove duplicates
        filtered.map(row => {
            if (!objLocPairListListContains(finalSet, row)) {
                finalSet.push(row);
            }
        });
        return finalSet;

    }

    function buildStates(futureState:boolean, rel:string, objs:string[][], locs:string[][], state:WorldState):objLocPair[][] {
        if (objs.length === 0 || locs.length === 0){
         	return [];
     	}
        var toomanydims:objLocPair[][][] = [];
        var ruleLength:number = locs[0].length * objs[0].length;      

        var locs1ObjsMore : boolean = locs.length === 1 && locs[0][0] !== "floor" && objs.length >= 1;
        var locsConjunctive : boolean = locs.length === 1 && locs[0][0] !== "floor";
        if(locs1ObjsMore){
            if(rel === "ontop" || rel === "inside"){
                objs = utils.transpose(objs);    
            }
            else{    
                //Keep the array as it is
            }
        } else if (locsConjunctive) {
            objs = utils.transpose(objs);
        } else {
            locs = utils.transpose(locs);
        }

        objs.map(x => locs.map(y => {
            var fx:string[];
            var fy:string[];
            if (futureState) {
                fx = x.filter(o => y.some(l => state.validPlacement(o, l, rel)));
                fy = y.filter(l => x.some(o => state.validPlacement(o, l, rel)));
            } else {
                fx = x.filter(o => y.some(l => state.relationExists(o, l, rel)));
                fy = y.filter(l => x.some(o => state.relationExists(o, l, rel)));
            }
            if (fx.length !== 0 && fy.length !== 0) {
                var disjs:objLocPair[][] = combineConj(fx, fy, rel, ruleLength);
                toomanydims.push(disjs);
            }
        }));

        if (toomanydims.length > 0) {
            var result:objLocPair[][] = [];
            result = result.concat.apply(result, toomanydims);
            return result;
        }
        return [];
    }

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
            if(objs.length > 9){
                //this will be a lot of permutations
  				throw new Interpreter.Error("You should be more specific. I'm too stupid to handle the object permutations.");
        	} else{
            	p1 = utils.permute(objs, [], []);
        	}
        	if(locs.length > 9){
        		//this will be a lot of permutations
  				throw new Interpreter.Error("You should be more specific. I'm too stupid to handle the location permutations.");
        	} else{
            	p2 = utils.permute(locs, [], []);
        	}
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

    function controlRuleSet(futureState:boolean, rules:objLocPair[], rel:string, state:WorldState):boolean {
        return futureState ?
            rules.every(r => r.obj !== r.loc && state.validPlacement(r.obj, r.loc, rel)) :
            rules.every(r => r.obj !== r.loc && state.relationExists(r.obj, r.loc, rel));
    }

    function stringListListContains(list : string[][], sl : string[]) : boolean {
    	return list.some(and => and.every(o1 => sl.some(o2 => o1===o2)));
    }
    
    function objLocPairListListContains(list:objLocPair[][], olpl : objLocPair[]) : boolean {
    	return list.some(l => objLocPairEquals(l,olpl))
    }

    function objLocPairEquals(row:objLocPair[], newRow:objLocPair[]) : boolean{
        return row.every(o1 => newRow.some(o2 => o1.obj === o2.obj && o1.loc === o2.loc));
    }

    function interpretationListContains(list : Result[], intrprt : Result) : boolean {
    	return list.some(intp => interpretationEquals(intp,intrprt));
    }

    function interpretationEquals(intrprt1 : Result, intrprt2 : Result) : boolean{
    	return intrprt1.intp.every(and1 => intrprt2.intp.some(and2 => andSetEquals(and1,and2)));
    }
    function andSetEquals(and1 : Literal[], and2 : Literal[]) : boolean{
    	return and1.every(o1 => and2.some(o2 => literalEquals(o1,o2)));
    }

    function literalEquals(lit1 : Literal, lit2 : Literal) : boolean {
    	return lit1.pol === lit2.pol && lit1.rel === lit2.rel && 
    		((lit1.args[0] === lit2.args[0]) && 
    		(lit1.rel==="holding" || lit1.args[1] === lit2.args[1]));
    }
}

