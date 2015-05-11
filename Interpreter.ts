///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="LiteralHelpers.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);

            if (intprt.intp.length > 0) {
                interpretations.push(intprt);
            }
        });

        if (interpretations && interpretations.length > 0) {
            if (interpretations.length == 1) {
                return interpretations;
            }
            else {
                throw new Interpreter.Error("I found more than one interpretation");
            }
        }
        else {
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

        var intprt = [];

        if (cmd.cmd == "take") {
            if (!state.holding) {
                // "Take" an object if we know that the request only
                // considers at most one object in each OR-part
                var entities = interpretEntity(cmd.ent, state);

                if (maxNumberOfEntitiesConsidered(entities) == 1) {
                    intprt = createUnLiterals(entities, "holding");
                }
            }
        }
        else if (cmd.cmd == "put") {
            if (state.holding) {
                // "Put" the currently held object in relation to the locations
                // specified
                var locEntities = interpretEntity(cmd.loc.ent, state);

                intprt = createBiLiteralsSpecifyFirst(locEntities, cmd.loc.rel, state.holding);
            }
        }
        else if (cmd.cmd == "move") {
            // Make a literal for each object and possible
            // location to move it to, and combine the results

            // What to move?
            var orPart = interpretEntity(cmd.ent, state);
            // Where to move it?
            var locEntities = interpretEntity(cmd.loc.ent, state);

            // OR-part
            orPart.forEach(function(andPart: string[]) {
                var orStatements: Literal[][][] = [];

                // AND-part
                andPart.forEach(function(obj: string) {
                    // Create a set of literals for moving the current obj to
                    // any of the allowed locations
                    var lits = createBiLiteralsSpecifyFirst(locEntities, cmd.loc.rel, obj);

                    orStatements.push(lits);
                });

                // Compress all statements so that they fit into the format
                // (a ^ b ^ c) v (d ^ f)
                // and concatenate them with the previous ORs
                intprt = intprt.concat(flattenOrStatements(orStatements));
            });
        }

        return intprt;
    }

    function maxNumberOfEntitiesConsidered(entities: string[][]): number {
        // Go through the OR-part and find the maximum number of
        // entities in each AND-part

        var entitiesConsidered: number[] = [];

        entities.forEach(function(andPart: string[]) {
            entitiesConsidered.push(andPart.length);
        });

        return Math.max.apply(null, entitiesConsidered);
    }

    function interpretEntity(ent: Parser.Entity, state: WorldState): string[][] {
        console.log("Interpreting entity: " + ent);

        // Get all matching objects in the world
        var objects: string[] = interpretObject(ent.obj, state);

        // Depending on the quantity, choose which to return
        if (ent.quant == "any") {
            // "Any" means that either/or is okay, so we separate
            // the objects into the OR-part of the array (outer array)
            var output = [];

            objects.forEach(function(val: string, i: number) {
                output[i] = [val];
            });

            return output;
        }
        else if (ent.quant == "the") {
            // "The" can only refer to one object, so return nothing
            // if we find several matching objects. Else, return the
            // object as an AND-part array (inner array).
            if (objects.length != 1) {
                return [];
            }
            else{
                return [objects];
            }
        }
        else if (ent.quant == "all") {
            // "All" means that we want all of the objects, so return
            // all objects as the AND-part of the array.
            return [objects];
        }
    }

    function interpretObject(obj: Parser.Object, state: WorldState): string[] {
        console.log("Interpreting object: " + obj);

        // Do we have an advanced object definition?
        if (obj.obj && obj.loc) {
            // Advanced object definition:

            // Find all objects that matches the definition in the world
            var objsToCheck: string[] = interpretObject(obj.obj, state);

            // Only keep objects that fulfill the location requirement
            var relEnitities: string[][] = interpretEntity(obj.loc.ent, state);

            return objsToCheck.filter(function(objToCheck: string) {
                // Does the object-to-check fulfill the location requirement?
                var lits = createBiLiteralsSpecifySecond(relEnitities, obj.loc.rel, objToCheck);

                return LiteralHelpers.areLiteralsFulfilled(lits, state);
            });

        }
        else {
            // Simple object definition:
            return getObjectsFromDefinition(obj.size, obj.color, obj.form, state);
        }
    }

    function getObjectsFromDefinition(size: string, color: string, form: string, state: WorldState): string[] {
        // We can't use state.objects here since not all objects are placed in the world!
        var objNamesInWorld: string[] = Array.prototype.concat.apply([], state.stacks);

        // Collect objects that fulfill the object definition
        var output = [];

        objNamesInWorld.forEach(function(objName) {
            var objDef = state.objects[objName];

            if (objectFulfillsDefinition(objDef, size, color, form)) {
                output.push(objName);
            }
        });

        return output;
    }

    function objectFulfillsDefinition(objDef: ObjectDefinition, size: string, color: string, form: string): boolean{
        // Handle the "floor" object and other objects that lack an object definition
        if (!objDef) {
            return true;
        }

        // Make sure that the object definition matches the request
        var objOk = true;

        if (form && form != "anyform") {
            objOk = objOk && (objDef.form == form);
        }
        if (size) {
            objOk = objOk && (objDef.size == size);
        }
        if (color) {
            objOk = objOk && (objDef.color == color);
        }

        return objOk;
    }

    function createUnLiterals(entities: string[][], relation: string): Literal[][] {
        var orPart: Literal[][] = [];

        // OR part
        entities.forEach(function(objs: string[]) {
            var andPart: Literal[] = [];

            // AND part
            objs.forEach(function(obj: string) {
                var lit = { pol: true, rel: relation, args: [obj] };

                andPart.push(lit);
            });

            orPart.push(andPart);
        });

        return orPart;
    }

    function createBiLiteralsSpecifyFirst(entities: string[][], relation: string, firstObj: string): Literal[][] {
        var orPart: Literal[][] = [];

        // OR part
        entities.forEach(function(objs: string[]) {
            var andPart: Literal[] = [];

            // AND part
            objs.forEach(function(obj: string) {
                var lit = { pol: true, rel: relation, args: [firstObj, obj] };

                andPart.push(lit);
            });

            orPart.push(andPart);
        });

        return orPart;
    }

    function createBiLiteralsSpecifySecond(entities: string[][], relation: string, secondObj: string): Literal[][] {
        var orPart: Literal[][] = [];

        // OR part
        entities.forEach(function(objs: string[]) {
            var andPart: Literal[] = [];

            // AND part
            objs.forEach(function(obj: string) {
                var lit = { pol: true, rel: relation, args: [obj, secondObj] };

                andPart.push(lit);
            });

            orPart.push(andPart);
        });

        return orPart;
    }

    // Compress two statements so that they fit into the format
    // (a ^ b ^ c) v (d ^ f)
    function compressTwoOrStatements(orPartsA: Literal[][], orPartsB: Literal[][]): Literal[][] {
        var outputOrParts: Literal[][] = [];

        orPartsA.forEach(function(andA: Literal[]) {
            var outputAndParts: Literal[] = andA;

            orPartsB.forEach(function(andB: Literal[]) {
                outputAndParts = outputAndParts.concat(andB);
            });

            outputOrParts.push(outputAndParts);
        });

        return outputOrParts;
    }

    // Compress all statements so that they fit into the format
    // (a ^ b ^ c) v (d ^ f)
    function flattenOrStatements(orParts: Literal[][][]): Literal[][] {
        if (orParts.length > 2) {
            var firstTwoCompressed: Literal[][] = compressTwoOrStatements(orParts[0], orParts[1]);

            var restOrParts = orParts.slice(2);
            restOrParts.push(firstTwoCompressed)

            return flattenOrStatements(restOrParts);
        }
        else if (orParts.length == 2) {
            return compressTwoOrStatements(orParts[0], orParts[1]);
        }
        else {
            return orParts[0];
        }
    }
}

