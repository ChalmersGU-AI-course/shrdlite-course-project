///<reference path="World.ts"/>
///<reference path="Parser.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], currentState : WorldState) : Result[] {
        var interpretations : Result[] = [];
        parses.forEach((parseresult) => {
            var intprt : Result = <Result>parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            interpretations.push(intprt);
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
        var matching = findObjects(cmd.ent, state);

        // This returns a dummy interpretation involving two random objects in the world
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];
        return intprt;
    }

    function findObjects(entity: Parser.Entity, world: WorldState): string[] {
        var parserObject = entity.obj;
        if (parserObject.obj) {
            return findObjectsByLocation(parserObject, world);
        } else {
            return findObjectsByDescription(parserObject, world);
        }
    }

    function findObjectsByDescription(object: Parser.Object, world: WorldState): string[] {
        var result: string[] = [];

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
        var matchingEntities = findObjects(location.ent, world);
        for (var matchingNr = 0; matchingNr < matchingEntities.length; ++matchingNr) {
            if (isRelativeMatch(objectId, location.rel, matchingEntities[matchingNr], world)) {
                return true;
            }
        }
        return false;
    }

    function isRelativeMatch(firstObject: string, relation: string, secondObject: string, world: WorldState): boolean {
        var firstPosition = getObjectPosition(firstObject, world);
        var secondPosition = getObjectPosition(secondObject, world);

        if (!firstPosition || !secondPosition) {
            return false;
        }

        switch (relation) {
            case "leftof":
                return firstPosition.Stack < secondPosition.Stack;
            case "rightof":
                return firstPosition.Stack > secondPosition.Stack;
            case "beside":
                return Math.abs(firstPosition.Stack - secondPosition.Stack) === 1;
            case "inside":
            case "ontop":
                return firstPosition.Stack === secondPosition.Stack && 
                       firstPosition.ObjectNr === secondPosition.ObjectNr + 1;
            case "under":
                return firstPosition.Stack === secondPosition.Stack && 
                       firstPosition.ObjectNr < secondPosition.ObjectNr;
            case "above":
                return firstPosition.Stack === secondPosition.Stack && 
                       firstPosition.ObjectNr > secondPosition.ObjectNr;
        }
        throw "Invalid relation '" + relation + "'";
    }
    class ObjectPosition {
        constructor(
            public Stack: number,
            public ObjectNr: number
        ) {}
    }

    function getObjectPosition(objectId: string, world: WorldState): ObjectPosition {
        if (world.holding === objectId) {
            return null;
        }
        for (var stack = 0; stack < world.stacks.length; ++stack) {
            for (var objectnr = 0; objectnr < world.stacks[stack].length; ++objectnr) {
                if (objectId === world.stacks[stack][objectnr]) {
                    return new ObjectPosition(stack, objectnr);
                }
            }
        }
        throw "Unable to find object with id " + objectId;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

