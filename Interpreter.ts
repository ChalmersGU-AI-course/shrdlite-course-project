///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="lib/lodash.d.ts"/>

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
        // This returns a dummy interpretation involving two random objects in the world

        // TODO: we should implement this function
        // What should it return? The goal functions?
        // Whatever we return here is only for our own benefit, in the planner


        // We see here that an object simply has a one-letter identifier
        console.log('state:',state);
        console.log('stacks:', state.stacks);

        console.log('cmd:',cmd);
        // cmd.cmd: what to do ("move")
        // cmd.ent: what object to do this with
        // cmd.loc: where to put it (may be undefined, if cmd is e.g. "take"


        var world = _.map(state.stacks, function (stack) {
            return _.map(stack, function (objId) {
                return state.objects[objId];
            })
        });

        var objectKeys : string[] = concat(state.stacks);
        var objectValues = _.map(objectKeys, function (objId) {return state.objects[objId]});
        console.log("world:",world);
        var objects = _.zipObject(objectKeys, objectValues);

        // Parse entity (if any)
        var entities = findEntities(cmd.ent, objects);

        // Below: old code
        var a = objectKeys[getRandomInt(objectKeys.length)];
        var b = objectKeys[getRandomInt(objectKeys.length)];

        var intprt : Literal[][] = [[
            {pol: true, rel: "ontop", args: [a, "floor"]},
            {pol: true, rel: "holding", args: [b]}
        ]];

        return intprt;
    }

    // TODO: find sensible type for objects (if needed)
    // TODO: keep track of id
    function findEntities(ent : Parser.Entity, objects) /* : Parser.Entity[] */ {
        if (ent) {
            var critLoc   = ent.obj.loc || null // entitiy's location (if specified)
              , critObj   = deleteNullProperties(ent.obj.obj || ent.obj) // description of entity
              , alikeObjs = _.filter(objects, critObj);
            console.log('obj:', critObj);
            console.log('alike objects:', alikeObjs);

            // Location specified for entity? Filter further
            var closeObjs = alikeObjs;
            if (critLoc) {
                if (critLoc.rel === 'inside') {
                    var boxes       = findEntities(critLoc.ent, objects)
                      , objsInBoxes = _.map(boxes, function (box) {
                            return _.filter(alikeObjs, _.partial(isInside, objects, box));
                        });
                    closeObjs = concat(objsInBoxes);
                }
            }
            console.log('close objects:', closeObjs);

            // Parse only one thing (for now)
            if (ent.quant === 'the') {
                return closeObjs; // TODO: conflict resolution?
            }
            if (ent.quant === 'any') {
                return closeObjs;
            }
        }
    }

    // Checks if ent is inside box, in the world with objects 'objects'
    function isInside(objects, box, ent) {
        // TODO
        return true;
    }


    // Removes all null properties in an object
    // Not used atm
    function deleteNullProperties(obj) {
        for (var k in obj) {
            if (obj[k] === null) {
                delete obj[k];
            }
        }
        return obj;
    }

    // Concats a list of lists into a list
    function concat(lists) {
        return Array.prototype.concat.apply([], lists);
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

