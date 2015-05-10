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
        // This returns a dummy interpretation involving two random objects in the world
        /*
        var objs : string[] = Array.prototype.concat.apply([], state.stacks);
        var a = objs[getRandomInt(objs.length)];
        var b = objs[getRandomInt(objs.length)];
        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];*/

        var intprt = [];

        if (cmd.cmd == "take") {
            var orEntities = interpretEntity(cmd.ent, state);

            for (var i = 0; i < orEntities.length; i++) {
                var andObjs = orEntities[i];

                if (andObjs.length == 1) {
                    var lit = { pol: true, rel: "holding", args: [andObjs[0]] };

                    intprt.push([lit]);
                }
            }
        }
        else if (cmd.cmd == "put") {
            if (state.holding) {
                var locOrEntities = interpretEntity(cmd.loc.ent, state);

                for (var i = 0; i < locOrEntities.length; i++) {
                    var locAndObjs = locOrEntities[i];

                    var andLits = [];
                    for (var j = 0; j < locAndObjs.length; j++) {
                        var lit = { pol: true, rel: cmd.loc.rel, args: [state.holding, locAndObjs[j]] };

                        andLits.push(lit);
                    }
                    intprt.push(andLits);
                }
            }
        }
        else if (cmd.cmd == "move") {
            var orEntities = interpretEntity(cmd.ent, state);

            // THERE IS PROBABLY A BUG HERE SOMEWHERE!
            // How should this be interpreted?
            
            // What to move?
            for (var i = 0; i < orEntities.length; i++) {
                var andObjs = orEntities[i];

                var andLits = [];
                for (var j = 0; j < andObjs.length; j++) {

                    // Where to move it?
                    var locOrEntities = interpretEntity(cmd.loc.ent, state);

                    for (var k = 0; k < locOrEntities.length; k++) {
                        var locAndObjs = locOrEntities[k];

                        for (var l = 0; l < locAndObjs.length; l++) {
                            var lit = { pol: true, rel: cmd.loc.rel, args: [andObjs[j], locAndObjs[l]] };

                            andLits.push(lit);
                        }
                    }
                }

                intprt.push(andLits);

            }
        }

        return intprt;
    }

    function interpretEntity(ent: Parser.Entity, state: WorldState): string[][]{
        var objects: string[] = interpretObject(ent.obj, state);
        if(ent.quant == "any"){
            var output = [];
            for (var i = 0; i < objects.length;i++){
                output[i] = [objects[i]];
            }
            return output;
        }
        else if(ent.quant == "the"){
            if(objects.length>1){
                return [];
            }
            else{
                return [objects];
            }
        }
        else if(ent.quant == "all"){
            return [objects];
        }
    }

    function interpretObject(obj: Parser.Object, state: WorldState): string[]{
        if (obj.obj && obj.loc) {
            // Find all objects that fit description
            var objsToCheck: string[] = interpretObject(obj.obj, state);


            var relEnitities: string[][] = interpretEntity(obj.loc.ent, state);

            // Filter objects that fulfill location
            return objsToCheck.filter(function(objToCheck: string) {
                // Does the object to check fulfill the relation?
                var objToCheckFulfills = false;

                var orEntities = relEnitities;

                for (var i = 0; i < orEntities.length; i++) {
                    var andObjs = orEntities[i];

                    var andFulfilled = true;

                    for (var j = 0; j < andObjs.length; j++) {
                        var lit = { pol: true, rel: obj.loc.rel, args: [objToCheck, andObjs[j]] };

                        andFulfilled = andFulfilled && LiteralHelpers.isLiteralFullfilled(lit, state);
                    }

                    if (andFulfilled) {
                        return true;
                    }
                }

                return false;
            });

        }
        else {
            return getObjectsFromDescription(obj.size, obj.color, obj.form, state);
        }
    }

    function getObjectsFromDescription(size: string, color: string, form: string, state: WorldState): string[]{
        var objectsFromDescription = [];

        for (var objName in state.objects) {
            var currentObjectDescription = state.objects[objName];
            if(objectFulfillsDescription(currentObjectDescription,size,color,form)){
                objectsFromDescription.push(objName);
            }
        }
        return objectsFromDescription;
    }

    function objectFulfillsDescription(objDef: ObjectDefinition, size: string, color: string, form: string): boolean{
        if (!objDef) {
            return true;
        }

        var objOk = true;

        if (form && form != "anyform") {
            objOk = objOk && (objDef.form == form);
        }
        if(size){
            objOk = objOk && (objDef.size == size);
        }
        if(color){
            objOk = objOk && (objDef.color == color);
        }

        return objOk;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

