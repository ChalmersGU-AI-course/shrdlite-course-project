///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="AmbiguityResolve.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        var differentParseStrings = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp) {
                interpretations.push(intprt);
            }
        });
        if (interpretations.length > 0) {
            return interpretations;
        } else  {
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
        var matching: string[];
        if (cmd.ent) {
            matching = findObjects(cmd.ent.obj, state);
            AmbiguityResolve.checkTheTheAmbiguity(cmd.ent, matching, state);
        } else if(state.holding) {
            matching = [state.holding];
        }

        var literals: Literal[][] = [];

        if (!cmd.loc) {
            for (var i = 0; i < matching.length; ++i) {
                literals.push([{pol: true, rel: "holding", args: [matching[i]]}]);
            }
            return literals;
        }

        if (cmd.ent && cmd.ent.quant == "any" && cmd.loc.ent && cmd.loc.ent.quant == "all" ) {
            //reverse the command:
            cmd.ent.quant = "all";
            cmd.loc.ent.quant = "any";
            var tmpObj = cmd.ent.obj;
            cmd.ent.obj = cmd.loc.ent.obj;
            cmd.loc.ent.obj = tmpObj;
            cmd.loc.rel = reverseRelation(cmd.loc.rel);
            return interpretCommand(cmd, state);
        }

        for (var i=0; i < matching.length; ++i)
        {
            var matchLiterals = buildRelativeLiterals(matching[i], cmd.loc, state);
            var previousLiterals = literals.slice();
            if (cmd.ent && cmd.ent.quant == "all") {
                var newLiterals : Literal[][] = [];
                for (var j=0; j<matchLiterals.length; ++j) {
                    if (previousLiterals.length == 0) {
                        newLiterals = matchLiterals.slice();
                        continue;
                    }
                    for (var k = 0; k < previousLiterals.length; ++k) {
                        var tempLiteral : Literal[] = previousLiterals[k].slice();
                        var matchLiteral : Literal[] = matchLiterals[j].slice();
                        var newestLiterals = concatLiterals(tempLiteral, matchLiteral);
                        if (!listContainsList(newLiterals, newestLiterals)) {
                            newLiterals.push(newestLiterals);
                        }
                    }
                }
                literals = newLiterals.slice();
            }
            else{
                literals = literals.concat(matchLiterals);
            }
        }
        return literals;
    }

    function concatLiterals(literals1: Literal[], literals2 : Literal[]) : Literal[] {
        var literals = literals1.slice();
        for (var i = 0; i < literals1.length; ++i) {
            for (var j=0; j < literals2.length; ++j) {
                if (literals1[i] === literals2[j]) {
                    continue;
                }
                literals.push(literals2[j]);
            }
        }
        return stripDuplicates(literals);
    }

    function stripDuplicates(literals : Literal[]) : Literal[] {
        var newLiterals : Literal[] = [];
        for (var i=0; i<literals.length; ++i) {
            if (!listContainsObject(newLiterals, literals[i]))
            {
                newLiterals.push(literals[i]);
            }
        }
        return newLiterals;
    }

    function listContainsObject(list, obj) : boolean {
        for (var i=0; i<list.length; ++i) {
            if (list[i] === obj) {
                return true;
            }
        }
        return false;
    }

    function listContainsList(listlist, list) : boolean {
        for (var i=0; i<listlist.length; ++i) {
            var isEqual = true;
            for (var j=0; j<list.length; ++j) {
                if(!listContainsObject(listlist[i], list[j])) {
                    isEqual = false;
                }
            }
            if (isEqual) {
                return true;
            }
        }
        return false;
    }

    function buildRelativeLiterals(object: string, location: Parser.Location, world: WorldState): Literal[][] {
        var matching: string[];
        if (location.ent.obj.obj) {
            matching = findObjectsByDescription(location.ent.obj.obj, world);
        } else {
            matching = findObjectsByDescription(location.ent.obj, world) || [];
        }
        AmbiguityResolve.checkTheTheAmbiguity(location.ent, matching, world);

        var result: Literal[][] = [];

        if (location.ent.obj.loc) {
            for (var i = 0; i < matching.length; ++i) {
                var literals = buildRelativeLiterals(matching[i], location.ent.obj.loc, world);
                for (var j = 0; j < literals.length; ++j) {
                    literals[j].splice(0, 0, {pol: true, rel: location.rel, args: [object, matching[i]]});
                }
                result = result.concat(literals);
            }

            return result;
        } else {
            var result: Literal[][] = [];
            if (location.ent.quant !== "all"){
                for (var m = 0; m < matching.length; ++m) {
                    result.push([{pol: true, rel: location.rel, args: [object, matching[m]]}]);
                }
            }
            else {
                var res = [];
                for (var m = 0; m < matching.length; ++m) {
                    res.push({pol: true, rel: location.rel, args: [object, matching[m]]});
                }
                result.push(res);
            }
            return result;
        }
    }

    function findObjects(parserObject: Parser.Object, world: WorldState): string[] {
        if (parserObject.obj) {
            return findObjectsByLocation(parserObject, world);
        } else {
            return findObjectsByDescription(parserObject, world);
        }
    }

    function findObjectsByDescription(object: Parser.Object, world: WorldState): string[] {
        var result: string[] = [];

        if (object.form === "floor") {
            result.push("floor");
            return result;
        }
        
        if (world.holding) {
            var objectDefinition = world.objects[world.holding];
            if (isMatchByDescription(object, objectDefinition)) {
                result.push(world.holding);
            }
        }
        
        for (var stack = 0; stack < world.stacks.length; ++stack) {
            for (var objectnr = 0; objectnr < world.stacks[stack].length; ++objectnr) {
                var worldObject = world.stacks[stack][objectnr];
                var objectDefinition = world.objects[worldObject];
                if (isMatchByDescription(object, objectDefinition)) {
                    result.push(worldObject);
                }
            }
        }
        return result;
    }

    function isMatchByDescription(object: Parser.Object, objectDefinition: ObjectDefinition): boolean {
        if (object.form !== "anyform" && object.form !== objectDefinition.form) {
            return false;
        }

        if (object.size && object.size !== objectDefinition.size) {
            return false;
        }

        if (object.color && object.color !== objectDefinition.color) {
            return false;
        }
        return true;
    }

    function findObjectsByLocation(object: Parser.Object, world: WorldState): string[] {
        var result: string[] = [];
        var matchingObjects = findObjectsByDescription(object.obj, world);

        for (var objectnr = 0; objectnr < matchingObjects.length; ++objectnr) {
            var matchingObject = matchingObjects[objectnr];
            if (isMatchByLocation(matchingObject, object.loc, world)) {
                result.push(matchingObject);
            }
        }
        return result;
    }

    function isMatchByLocation(objectId: string, location: Parser.Location, world: WorldState): boolean {
        //TODO: handle singular vs plural quantifier
        var matchingEntities = findObjects(location.ent.obj, world);
        for (var matchingNr = 0; matchingNr < matchingEntities.length; ++matchingNr) {
            if (isRelativeMatch(objectId, location.rel, matchingEntities[matchingNr], world)) {
                if(location.ent.quant !== "all") {
                    return true;
                }
            }
            else {
                if (location.ent.quant === "all") {
                    return false;
                }
            }
        }
        if (location.ent.quant === "all") {
            return true;
        }
        return false;
    }

    function reverseRelation(relation : string) : string {
        switch (relation) {
            case "leftof":
                return "rightof";
            case "rightof":
                return "leftof";
            case "containing":
                return "inside";
            case "under":
                return "ontop";
            case "inside":
                return "containing";
            case "ontop":
                return "under";
            case "below":
                return "above";
            case "above":
                return "below";
        }
        return relation;
    }
}

