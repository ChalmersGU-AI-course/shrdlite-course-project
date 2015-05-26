///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="lib/utils.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses:Parser.Result[], currentState:WorldState):Result[] {
        var interpretations:Result[] = [];

        parses.forEach((parseresult) => {
            var intprt:Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp.length > 0) {
                interpretations.push(intprt);
            }
        });

        if (interpretations.length) {
            if (interpretations.length > 1) {

                throw new Interpreter.Error("Found ambiguous interpretations");
            }

            return interpretations;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }


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


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd:Parser.Command, state:WorldState):Literal[][] {
        var lit:Literal[][] = [];
        if (cmd.cmd === "move" || cmd.cmd === "put") {
            var objs:string[][];
            if (cmd.cmd === "put") {
                if (state.holding === null) {
                    return lit;
                    //TODO: Throw error?
                }
                objs = [[state.holding]];
            } else {
                objs = interpretEntity(cmd.ent, state);
            }
            var locs:Sayings = interpretLocation(cmd.loc, state);
            var physics:objLocPair[][] = buildRules(true, objs, locs, state);

            //objs = physics.keys;
            physics.map(or => {
                var andList:Literal[] = [];
                or.map(and => {
                    var order:Literal = {pol: true, rel: locs.rel, args: [and.obj, and.loc]};
                    andList.push(order);
                });
                if (andList.length > 0) {
                    lit.push(andList);
                }
            });

        } else {
            var objs:string[][] = interpretEntity(cmd.ent, state);
            objs.map(objList => {   // obj or 
                var andList:Literal[] = [];
                objList.map(obj => {    //obj and
                    var order:Literal = {pol: true, rel: "holding", args: [obj]};
                    andList.push(order);
                });
                if (andList.length > 0) {
                    lit.push(andList);
                }
            });
        }
        return lit;
    }

    function interpretEntity(ent:Parser.Entity, state:WorldState):string[][] {
        var objs:string[][] = interpretObject(ent.obj, state);
        if (ent.quant === "the") {
            if (objs.length > 1) {
            	console.log(objs);
            	
                throw new Interpreter.Error("There are more than one object that matches that description");
                return objs;
            } else {
                return objs;
            }
        }
        if (ent.quant === "any") {
            return objs;
        }
        if (ent.quant === "all") {
            var newObjs:string[][] = [];
            var l:string[] = [];
            objs.map(o1 => o1.map(o2 => l.push(o2)));
            newObjs.push(l);
            return newObjs;
        }
        //TODO Throw error
        return objs;
    }

    function interpretObject(obj:Parser.Object, state:WorldState):string[][] {
        if (obj.obj != null) {
            var objs:string[][] = interpretObject(obj.obj, state);

            var locs:Sayings = interpretLocation(obj.loc, state);
            var physics:objLocPair[][] = buildRules(false, objs, locs, state);

            objs = [];
            physics.map(l => {
                var r:string[] = [];
                l.map(p => {if(r.indexOf(p.obj)<0){ r.push(p.obj);}});
                // Check if there is any array with the same objects inside as the new one.
                // in short terms: objs.contains(r)
                if(!objs.some(and => and.every(o1 => r.some(o2 => o1===o2)))){            	
	                objs.push(r);
	            }
            });
            return objs;
        } else {
            var objsindexes:string[] = state.getObjectByDefinition(obj.form, obj.size, obj.color);
            var newObjs:string[][] = [];
            objsindexes.map(o => {
                var l:string[] = [];
                l.push(o);
                newObjs.push(l);
            });
            return newObjs;
        }
    }

    function interpretLocation(loc:Parser.Location, state:WorldState):Sayings {
        return {rel: loc.rel, objs: interpretEntity(loc.ent, state)};
    }

    function buildStates(futureState:boolean, rel:string, objs:string[][], locs:string[][], state:WorldState):objLocPair[][] {
        var toomanydims:objLocPair[][][] = [];
        if (objs.length === 0 || locs.length === 0) return [];
        var rule:number = locs[0].length * objs[0].length;        
        var locs1ObjsMore : boolean = locs.length === 1 && locs[0][0] !== "floor" && objs.length >= 1;
        if(locs1ObjsMore){
            if(rel === "ontop" || rel === "inside"){
                objs = utils.transpose(objs);    
            }
            else{    
                //Keep the array as it is
            }
        } else if (locs.length === 1 && locs[0][0] !== "floor") {
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
                var disjs:objLocPair[][] = combineConj(fx, fy, rel, rule);
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
            if (objs.length > 9 || locs.length > 9) {
                //this will be a lot of permutations
                throw new Interpreter.Error("You should be more specific. I'm too stupid to handle the permutations.");
            }
            var p1:string[][] = utils.permute(objs, [], []);
            var p2:string[][] = utils.permute(locs, [], []);
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


    function buildRules(futureState:boolean, objs:string[][], locs:Sayings, state:WorldState):objLocPair[][] {
        var grid:objLocPair[][] = [];
        if (objs.length === 0 || locs.objs.length === 0) {
            return grid;
        }

        //all rules
        var rules:objLocPair[][] = buildStates(futureState, locs.rel, objs, locs.objs, state);
        if (rules.length === 0) {
            return grid;
        }
        // filter physical
        var filtered:objLocPair[][] = rules.filter(row => controlRuleSet(futureState, row, locs.rel, state));
        if (filtered.length === 0) {
            return grid;
        }
        //remove duplicates
        filtered.map(row => {
            var contains:boolean = grid.some(r => ruleSetEquals(r,row)); 
            if (!contains) {
                grid.push(row);
            }
        });
        return grid;

    }

    function ruleSetEquals(row:objLocPair[], newRow:objLocPair[]){
        return row.every(o1 => newRow.some(o2 => o1.obj === o2.obj && o1.loc === o2.loc));
    }
}

