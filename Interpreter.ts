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
            physics.forEach(or => {
                var andList:Literal[] = [];
                or.forEach(and => {
                    var order:Literal = {pol: true, rel: locs.rel, args: [and.obj, and.loc]};
                    andList.push(order);
                    return true;
                });
                if (andList.length > 0) {
                    lit.push(andList);
                }
                return true;
            });
            //Only place we know which object to put where

        } else {
            var objs:string[][] = interpretEntity(cmd.ent, state);
            objs.forEach(objList => {   // obj or 
                var andList:Literal[] = [];
                objList.forEach(obj => {    //obj and
                    var order:Literal = {pol: true, rel: "holding", args: [obj]};
                    andList.push(order);
                    return true;
                });
                if (andList.length > 0) {
                    lit.push(andList);
                }
                return true;
            });
        }
        return lit;
    }

    function interpretEntity(ent:Parser.Entity, state:WorldState):string[][] {
        var objs:string[][] = interpretObject(ent.obj, state);
        if (ent.quant === "the") {
            if (objs.length > 1) {
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
            objs.forEach(o1 => {
                o1.forEach(o2 => {
                    l.push(o2);
                    return true;
                });
                return true;
            });
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
            physics.forEach(l => {
                var r:string[] = [];
                l.forEach(p => {
                    r.push(p.obj);
                    return true;
                });
                objs.push(r);
                return true;
            });
            //e = physics.keys;
            return objs;
        } else {
            var objsindexes:string[] = Array.prototype.concat.apply([], state.stacks);
            if (obj.form === "floor") {
                return [["floor"]];
            }
            if (obj.size !== null) {
                objsindexes = objsindexes.filter(e=> state.objects[e].size === obj.size);
            }
            if (obj.color !== null) {
                objsindexes = objsindexes.filter(e=> state.objects[e].color === obj.color);
            }
            if (obj.form !== "anyform") {
                objsindexes = objsindexes.filter(e=> state.objects[e].form === obj.form);
            } else if (obj.size === null && obj.color === null) {
                objsindexes.push("floor");
            }
            var newObjs:string[][] = [];
            objsindexes.forEach(o => {
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
        //this works for everything but "put any object on all tables" and such queries.
        //and all loose relations of course. "above","below","leftof","rightof"
        //objs = utils.transpose(objs );
        if (locs.length === 1) {
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
                throw new Interpreter.Error("You should be more specific. this will take too long to calculate");

            }
            var p1:string[][] = permute(objs, [], []);
            var p2:string[][] = permute(locs, [], []);
            console.log("hello. man." + p1.length);
            p1.forEach(obj =>
                p2.map(loc => {
                    var row:objLocPair[] = [];
                    for (var i = 0; i < ruleLength; i++) {
                        row.push({"obj": obj[i % objs.length], "loc": loc[i % locs.length]});
                        console.log("obj " + obj[i % objs.length] + " loc " + loc[i % locs.length]);
                    }
                    allRules.push(row);
                    console.log(row.length);
            }));
        }
        if (rel === "leftof" || rel === "rightof" || rel === "below" || rel === "above") {

        } else {
            if (objs.length > locs.length) {
            } else {
                var p1:string[][] = permute(locs, [], []);
                p1.forEach(loc => {
                    var row:objLocPair[] = [];
                    for (var i = 0; i < objs.length; i++) {
                        row.push({"obj": objs[i], "loc": loc[i]});
                    }
                    //allRules.push(row);
                });
            }
        }
        return allRules;
    }

    function controlRuleSet(futureState:boolean, rules:objLocPair[], rel:string, state:WorldState):boolean {
        return futureState ?
            rules.every(r => state.validPlacement(r.obj, r.loc, rel)) :
            rules.every(r => state.relationExists(r.obj, r.loc, rel));
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
        console.log("rules: " + grid.length);
        // filter physical
        var filtered:objLocPair[][] = rules.filter(row => controlRuleSet(futureState, row, locs.rel, state));
        if (filtered.length === 0) {
            return grid;
        }
        console.log(filtered.length)
        //remove duplicates

        filtered.map(row => {
            var contains:boolean = grid.some(r => row.every(p => rowContainsPair(r, p.obj, p.loc, locs.rel)));
            if (!contains) {
                grid.push(row);
            }
        });
        return grid;

    }

    function validRuleSet(row:objLocPair[]):boolean {
        for (var i = 0; i < row.length; i++) {
            for (var j = 0; j < row.length; j++) {
                if (i !== j) {
                    if (row[j].loc !== "floor" || row[i].loc !== "floor") {
                        if (row[i].obj === row[j].obj || (row[i].loc === row[j].loc)) {
                            7
                            console.log(row[j].obj + row[j].loc + "  spaces-- " + row[i].obj + row[i].loc);
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    function rowContainsPair(row:objLocPair[], obj:string, loc:string, rel:string):boolean {
        console.log("comparing with : " + row.map(o => "o: " + o.obj + " l: " + o.loc + "\t"));
        console.log("obj : " + obj + "\t loc : " + loc + "\t value: " + row.every(o => (o.obj === obj && o.loc === loc)
                //||
            ));//(o.obj === obj && o.loc !== loc && loc === "floor")));
        return row.every(o => (o.obj === obj && o.loc === loc)// ||
        );//(o.obj === obj && o.loc !== loc && loc === "floor"));
    }

    function permute(input:string[], usedChars:string[], permArr:string[][]) {
        var i:number, ch:string;
        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length == 0) {
                permArr.push(usedChars.slice());
            }
            permute(input, usedChars, permArr);
            input.splice(i, 0, ch);
            usedChars.pop();
        }
        return permArr;
    }
}

