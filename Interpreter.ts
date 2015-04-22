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

        // Log interesting things
        console.log('state:',state);
        console.log('stacks:', state.stacks);
        console.log('cmd:',cmd);

        // cmd.cmd: what to do ("move")
        // cmd.ent: what object to do this with (may be undefined, if e.g. "drop")
        // cmd.loc: where to put it (may be undefined, if cmd is e.g. "take")

        // For debugging, store in window object
        this.objects = state.objects;
        
        // Create convenient world representation (store the objects in stacks, rather than id's)
        var stacks : any = _.map(state.stacks, function (stack, i) {
            var newStack = _.map(stack, function (objId) {
                // Add 'id' property to each object
                return _.assign(state.objects[objId], {id: objId});
                //return state.objects[objId];
            });
            // Add floor objects at beginning of each stack
            var floor = {form: 'floor', id: 'floor-'+i}
            newStack.unshift(floor);
            return newStack;
        });
        // Create array of all objects (also convenient)
        var objects = concat(stacks);

        // Create PPDL representation
        // TODO: don't do it here; waste of CPU cycles
        var ppdlWorld : Literal[] = [];
        for (var x in stacks) {
            // Add constraints
            for (var y = 0; y<stacks[x].length; y++) {
                // On top / inside
                var obj     = stacks[x][y]
                  , nextObj =stacks[x][y+1];
                if (nextObj) {
                    var rel        = (obj.form == 'box') ? 'inside' : 'ontop'
                      , constraint = {pol: true, rel: rel, args: [nextObj.id, obj.id]};
                    ppdlWorld.push(constraint);
                }
            }
        }

        console.log("stacks:",stacks);
        console.log("ppdlWorld:",ppdlWorld);

        var interpretations = [];

        if (cmd.cmd === 'move') {
                // Which entity we should move
            var entities        = findEntities(cmd.ent, objects, ppdlWorld)
                // Where we should move it
              , locations       = findEntities(cmd.loc.ent, objects, ppdlWorld)
                // How entity will be positioned on location (ontop, inside, ...)
              , rel             = cmd.loc.rel;
            if (entities.length > 1 || locations.length > 1) {
                console.warn('Interpreter warning: ambiguous entity or location!' +
                'Returning multiple interpretations');
            }
            // Add all possible combinations of interpretations
            for (var i in entities) {
                for (var j in locations) {
                    var entity         = entities[i]
                      , location       = locations[j]
                      , interpretation = {pol: true, rel: rel, args: [entity, location]};
                    // in this case: only one PPDL goal => singleton list
                    interpretations.push([interpretation]);
                }
            }
        }

        else {
            var objectKeys : string[] = concat(state.stacks);
            // Below: old code
            var a = objectKeys[getRandomInt(objectKeys.length)];
            var b = objectKeys[getRandomInt(objectKeys.length)];

            var intprt : Literal[][] = [[
                {pol: true, rel: "ontop", args: [a, "floor"]},
                {pol: true, rel: "holding", args: [b]}
            ]];
        }

        console.log("returning",interpretations);
        return interpretations;
    }

    // Finds one/many entities matching the description 'ent' from the parser
    // TODO: find sensible type for objects (if needed?)
    function findEntities(ent : Parser.Entity, objects, ppdlWorld) /* : Parser.Entity[] */ {
        if (ent) {
            var critLoc   = ent.obj.loc || null // entitiy's location (if specified)
              , critObj   = deleteNullProperties(ent.obj.obj || ent.obj) // description of entity
              , alikeObjs = _.filter(objects, critObj);
            console.log('obj:', critObj, 'alike objects:', alikeObjs);

            // Location specified for entity? Filter further
            var closeObjs = alikeObjs;
            if (critLoc) {
                if (critLoc.rel === 'inside' || critLoc.rel === 'ontop') {
                    var boxes       = findEntities(critLoc.ent, objects, ppdlWorld)
                      , rel         = critLoc.rel
                      , objsInBoxes = _.map(boxes, function (box) {
                            return _.filter(alikeObjs, _.partial(hasBinaryConstraint, ppdlWorld, true, rel, box));
                        });
                    closeObjs = concat(objsInBoxes);
                } else {
                    console.log("TODO: implement more relations! See rel value of ",critLoc);
                }

                console.log('close objects:', closeObjs);
            }


            // Parse only one thing (for now) asdf
            if (ent.quant === 'the') {
                // TODO: Special case for floor?
                return closeObjs; // TODO: conflict resolution?
            }
            if (ent.quant === 'any') {
                return closeObjs;
            }
        }
    }


    //function hasConstraint(ppdlWorld, constraint) {
    //    return _.find(ppdlWorld, constraint);
    //}

    // Checks if ppdlWorld has inside constraint
    //function isInside(ppdlWorld, box, ent) {
    //    // TODO
    //    var constraint = newInside(true, ent.id, box.id)
    //      , found      = _.find(ppdlWorld, constraint);
    //    console.log("isInside(): constraint:",constraint,"ppdlWorld",ppdlWorld,"found:",found);
    //    return found;
    //}

    // Checks if ppdlWorld has some binary constraint
    // (Typically 'inside' or 'ontop')
    function hasBinaryConstraint(ppdlWorld, pol, rel, obj1, obj2) {
        var constraint = {pol: pol, rel: rel, args: [obj1.id, obj2.id]}
          , found      = _.find(ppdlWorld, constraint);
        // console.log("hasBinaryConstraint(): constraint:",constraint,"ppdlWorld",ppdlWorld,"found:",found);
        return found;
    }


    // Checks if ent is inside box, in the world with objects 'objects'
    function isOntop(ppdlWorld, box, ent) {
        // TODO
        var constraint = {pol: true, rel: 'inside', args: [ent.id, box.id]}
            , found      = _.find(ppdlWorld, constraint);
        //console.log("isInside(): constraint:",constraint,"ppdlWorld",ppdlWorld,"found:",found);
        return found;
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

