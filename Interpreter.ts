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
        // Outer list: different interpretations
        // Inner list: different conditions for one interpretation, separated by OR.
        //             that is, either of may be true for the interpretation to be satisfied

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
        // Add the arm to the pddl-world
        ppdlWorld.push({pol: true, rel: 'holding', args: (state.holding == null) ? [] : [state.holding]});

        console.log("stacks:",stacks);
        console.log("ppdlWorld:",ppdlWorld);

        var interpretations : Literal[][] = [];

        if (cmd.cmd === 'move') {
                // Which entity we should move
            var entitiesIntrprt        = findEntities(cmd.ent, objects, ppdlWorld)
                // Where we should move it
              , locationsIntrprt       = findEntities(cmd.loc.ent, objects, ppdlWorld)
                // How entity will be positioned on location (ontop, inside, ...)
              , rel             = cmd.loc.rel;
            if (entitiesIntrprt.length > 1 || locationsIntrprt.length > 1) {
                console.warn('Interpreter warning: ambiguous entity or location!' +
                'Returning multiple interpretations');
            }
            // Add all possible combinations of interpretations
            for (var i in entitiesIntrprt) {
                for (var j in locationsIntrprt) {
                    var entities                   = entitiesIntrprt[i]
                      , locations                  = locationsIntrprt[j]
                      , interpretation : Literal[] = [];
                    // For each interpretation, create all possible PDDL goal states
                    for (var k in entities) {
                        for (var l in locations) {
                            // TODO: do not return actual objects in the PDDL goal, but their id's!
                            var possiblePddlGoal = {pol: true, rel: rel, args: [entities[k].id, locations[l].id]};
                            interpretation.push(possiblePddlGoal);
                        }
                    }
                    interpretations.push(interpretation);
                }
            }
        } else if (cmd.cmd === 'take') {
            // TODO: Should we check (here?) if the arm is already holding something?
            var entitiesIntrprt = findEntities(cmd.ent, objects, ppdlWorld);

            if (entitiesIntrprt.length > 1) {
                console.warn('Interpreter warning: ambiguous entity or location!' +
                'Returning multiple interpretations');
            }
            for (var i in entitiesIntrprt) {
                var entities                   = entitiesIntrprt[i]
                  , interpretation : Literal[] = [];
                for (var k in entities) {
                    var possiblePddlGoal = { pol: true, rel: 'holding', args: [entities[k]] };
                    interpretation.push(possiblePddlGoal);
                }
                interpretations.push(interpretation);
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
    // Returns obj[][].
    // The outer list is of _different_ interpretations,
    //   (i.e. "the white ball" may find several white balls. => [[b1], [b2]])
    // The inner list is of several acceptable entities for one interpretation
    //   (e.g. "the floor" should accept all floor tiles. => [[b1,b2]])
    // TODO: find sensible type for objects (if needed?)
    function findEntities(ent : Parser.Entity, objects, ppdlWorld) : any[][] /* : Parser.Entity[] */ {
        if (ent) {

            console.log("findEntities()....");

            var critLoc           = ent.obj.loc || null // entitiy's location (if specified)
              , critObj           = deleteNullProperties(ent.obj.obj || ent.obj) // description of entity
              , alikeObjs : any[] = _.filter(objects, critObj)
              , hasDoneIntrprt    = false; // whether we have done obj[] -> obj[][] yet or not
            console.log('obj:', critObj, 'alike objects:', alikeObjs);

            // Location specified for entity? Filter further
            // Note: this has a different type than alikeObjs -
            //       this also accounts for different interpretations of locations
            var closeObjsIntrprt : any[][] = null;
            if (critLoc) {
                if (critLoc.rel === 'inside' || critLoc.rel === 'ontop') {
                    var locationsIntrprt = findEntities(critLoc.ent, objects, ppdlWorld)
                      , rel         = critLoc.rel;
                    // for all interpretations...
                    closeObjsIntrprt = _.map(locationsIntrprt, function (locations) {
                        // ...filter out all object which has relation to any location in locations
                        return _.filter(alikeObjs, function (obj) {
                            return _.any(locations, function (location) {
                                return hasBinaryConstraint(ppdlWorld, true, rel, obj, location);
                            })
                        })
                    });
                } else {
                    console.log("TODO: implement more relations! See rel value of ",critLoc);
                }
                hasDoneIntrprt = true;
                console.log('close objects:', closeObjsIntrprt);
            }

            // Turn into obj[][], if it has not already been done, by filtering through quantities
            var quantFilteredObjs : any[][] = [[]];
            if (hasDoneIntrprt) {
                // Big TODO: should we ignore all quantifiers when filtered by location? No, right?
                quantFilteredObjs = closeObjsIntrprt;
            }
            else {
                // "the" should only select one object. May spawn multiple interpretations
                if (ent.quant === 'the') {
                    if (ent.obj.form === 'floor') {
                        // Any floor tile is acceptable (Put into same inner list)
                        var allFloorTiles = concat(alikeObjs);
                        // Only one interpretation (singleton outer list)
                        quantFilteredObjs = [allFloorTiles];
                        console.log("the. found the floor!", quantFilteredObjs);
                    }
                    else {
                        // Any object is not acceptable, each is different interpretation
                        quantFilteredObjs = _.map(alikeObjs, function (obj) {
                            return [obj];
                        });
                        console.log("the. found other objects!", quantFilteredObjs);
                    }
                }
                // "any" can select any object. Has only one interpretation
                if (ent.quant === 'any') {
                    // Any object is acceptable (put into same inner list)
                    var allFloorTiles = concat(alikeObjs);
                    // Only one interpretation (singleton outer list)
                    quantFilteredObjs = [allFloorTiles];
                    console.log("any. found objects!", quantFilteredObjs);
                }
            }

            return quantFilteredObjs;
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

