///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="lib/lodash.d.ts"/>

module Interpreter {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function interpret(parses : Parser.Result[], state : ExtendedWorldState) : PddlLiteral[][][] {

        // TODO remove, used for debugging
        this._ = _;

        var cmds        : Parser.Command[]    = <Parser.Command[]> _.map(parses, 'prs')
        //  , intpsPerCmd : PddlLiteral[][][][] = _.map(cmds, _.partial(interpretCommand, _, state))
          , intpsPerCmd : PddlLiteral[][][][] = _.map(cmds, function(a) {return interpretCommand(a, state);})
          , intps       : PddlLiteral[][][]   = concat(intpsPerCmd)
        if (intps.length) {
            return intps;
        } else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }

    export function interpretationToString(res : PddlLiteral[][]) : string {
        // TODO: print human-readable sentence? Or at least add new function for that
        return res.map((lits) => {
            return lits.map((lit) => literalToString(lit)).join(" & ");
        }).join(" | ");
    }

    export function literalToString(lit : PddlLiteral) : string {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }


    // TODO: Don't use anywhere! 'Tis bad!
    export interface Result extends Parser.Result {intp:PddlLiteral[][];}

    export class Error implements Error {
        public name = "Interpreter.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function interpretCommand(cmd : Parser.Command, state : ExtendedWorldState) : PddlLiteral[][][] {
        // Outer list: different interpretations
        // Inner list: different conditions for one interpretation, separated by OR.
        //             that is, either of may be true for the interpretation to be satisfied

        // Log interesting things
        console.log('state:',state);
        console.log('stacks:', state.stacks);
        console.log('cmd:',cmd);

        //workaround for incorrect command strings
        if(cmd.cmd === 'put'){
            cmd.cmd = 'move';
        }

        var objects   = state.objectsWithId
          , pddlWorld = state.pddlWorld;


        // cmd.cmd: what to do ("move")
        // cmd.ent: what object to do this with (may be undefined, if e.g. "drop")
        // cmd.loc: where to put it (may be undefined, if cmd is e.g. "take")

        var interpretations : PddlLiteral[][][] = [];

        // TODO Maybe we should refactor all the duplicated code for the commands?

        if (cmd.cmd === 'move') {
                // Which entity we should move
            if (cmd.ent != null) { // Move specified object.
                var entitiesIntrprt = findEntities(cmd.ent, objects, pddlWorld.rels)
                // Where we should move it
                    , locationsIntrprt = findEntities(cmd.loc.ent, objects, pddlWorld.rels)
                // How entity will be positioned on location (ontop, inside, ...)
                    , rel = cmd.loc.rel;
                if (entitiesIntrprt.length > 1) {
                    var promptStr = 'Multiple objects to move found:\n'
                    for(var i in entitiesIntrprt){
                        promptStr += i + '. The ' + entitiesIntrprt[i][0][0].size + ' ' 
                        + entitiesIntrprt[i][0][0].color + ' ' + entitiesIntrprt[i][0][0].form + '.\n';
                    }
                    promptStr += 'Which one did you mean?';
                    var selected = Number(prompt(promptStr));
                    entitiesIntrprt = [entitiesIntrprt[selected]];
                }

                if(locationsIntrprt.length > 1){
                    var promptStr = 'Multiple locations to move to found:\n'
                    for(var i in locationsIntrprt){
                        promptStr += i + '. The ' + locationsIntrprt[i][0][0].size + ' ' 
                        + locationsIntrprt[i][0][0].color + ' ' + locationsIntrprt[i][0][0].form + '.\n';
                    }
                    promptStr += 'Which one did you mean?';
                    var selected = Number(prompt(promptStr));
                    locationsIntrprt = [locationsIntrprt[selected]];
                }
                
                // Add all possible combinations of interpretations 
                interpretations = combineStuff(toIds(entitiesIntrprt), toIds(locationsIntrprt), rel);
            } else { // Move "it", that is, the object the arm is holding.
                var // Where we should move it
                    locationsIntrprt = findEntities(cmd.loc.ent, objects, pddlWorld.rels)
                // How entity will be positioned on location (ontop, inside, ...)
                    , rel = cmd.loc.rel
                    , it = pddlWorld.holding;
                if (it != null) { // Is there an object to move?
                    if (locationsIntrprt.length > 1) {
                    console.warn('Interpreter warning: ambiguous entity or location!' +
                        'Returning multiple interpretations');
                    }
                    // Add all possible combinations of interpretations
                    interpretations = combineStuff([[[it]]], toIds(locationsIntrprt), rel);
                } else {
                    console.warn('Interpreter warning: no entity in arm to move!' +
                        'Returning no interpretation');
                }
            }
        } else if (cmd.cmd === 'take') {
            // TODO: Should we check (here?) if the arm is already holding something?
            var entitiesIntrprt = findEntities(cmd.ent, objects, pddlWorld.rels);

            if (entitiesIntrprt.length > 1) {
                console.warn('Interpreter warning: ambiguous entity or location!' +
                'Returning multiple interpretations');
            }
            interpretations = combineStuff(toIds(entitiesIntrprt), null, 'holding');
        }

        else {
            var objectKeys : string[] = concat(state.stacks);
            // Below: old code
            var a = objectKeys[getRandomInt(objectKeys.length)];
            var b = objectKeys[getRandomInt(objectKeys.length)];

            var intprt : PddlLiteral[][] = [[
                {pol: true, rel: "ontop", args: [a, "floor"]},
                {pol: true, rel: "holding", args: [b]}
            ]];
        }

        console.log("returning",interpretations);
        return interpretations;
    }


    function toIds(objDefs : ObjectDefinitionWithId[][][]) : string[][][] {
        var interpretIds : string[][][] = [];
        for (var i in objDefs) {
            var ors = objDefs[i]
              , orsIds : string[][]= [];
            for (var j in ors) {
                var ands = ors[j]
                  , andsIds : string[] = [];
                for (var k in ands) {
                    andsIds.push(ands[k].id);
                }
                orsIds.push(andsIds);
            }
            interpretIds.push(orsIds);
        }
        return interpretIds;
    }

    // Helper function for interpret command. Takes two 3-dim lists with ids.
    // First list for entities, second for locations. Third argument is the relation between the two.
    // You can send a list as null, in case you don't want a relation with it.
    function combineStuff(entitiesIntrprt, locationsIntrprt, rel) : PddlLiteral[][][] {
        if (entitiesIntrprt == null) {
            entitiesIntrprt = [[[null]]];
        }
        if (locationsIntrprt == null) {
            locationsIntrprt = [[[null]]];
        }
        var interpretations : PddlLiteral[][][] = [];
        for (var i in entitiesIntrprt) {
            for (var j in locationsIntrprt) {
                var entitiesOr = entitiesIntrprt[i]
                    , locationsOr = locationsIntrprt[j]
                    , interpretationOr: PddlLiteral[][] = [];
                // Disjunctive
                for (var k in entitiesOr) {
                    for (var l in locationsOr) {
                        var entitiesAnd = entitiesOr[k]
                            , locationsAnd = locationsOr[l]
                            , interpretationAnd: PddlLiteral[] = [];
                        // Conjunctive
                        for (var m in entitiesAnd) {
                            for (var n in locationsAnd) {
                                var arg1 = ((entitiesAnd[m] == null) ? [] : [entitiesAnd[m]]);
                                var arg2 = ((locationsAnd[n] == null) ? [] : [locationsAnd[n]]);
                                var pddlGoal = { pol: true, rel: rel, args: arg1.concat(arg2) };
                                interpretationAnd.push(pddlGoal);
                            }
                        }
                        interpretationOr.push(interpretationAnd);
                    }
                }
                interpretations.push(interpretationOr);
            }
        }
        return interpretations;
    }

    // Finds one/many entities matching the description 'ent' from the parser
    // The outer list is of different interpretations,
    //   (e.g. "the white ball" may find several white balls. => [[[b1]], [[b2]]])
    // The middle list is of several acceptable entities for one interpretation ("the or list")
    //   (e.g. "the floor" should accept all floor tiles. => [[[b1],[b2]]])
    // The inner list is if several entities should be returned for one interpretation
    //   (e.g. "all balls" should select several: [[[b1,b2]]])
    function findEntities(ent : Parser.Entity,
                          objects : { [s: string]: ObjectDefinitionWithId; },
                          ppdlWorld : PddlLiteral[]) : ObjectDefinitionWithId[][][] /* : Parser.Entity[] */ {
        if (ent) {

            console.log("findEntities()....");

            var critLoc                              = ent.obj.loc || null // entitiy's location (if specified)
              , critObj                              = deleteNullProperties(ent.obj.obj || ent.obj) // description of entity
              , alikeObjs : ObjectDefinitionWithId[] = _.filter(objects, critObj);
            console.log('obj:', critObj, 'alike objects:', alikeObjs);

            // Location specified for entity? Filter further
            // Note: this has a different type than alikeObjs -
            //       this also accounts for different interpretations of locations
            if (critLoc) {
                if (critLoc.rel === 'inside' || critLoc.rel === 'ontop') {
                    var locationsIntrprt = findEntities(critLoc.ent, objects, ppdlWorld)
                      , rel         = critLoc.rel
                        // For each location interpretation, store all objects which has relation to that interpretation's location
                        // Example: "... the box to the left of the two blue balls"
                        // Example world: □1 o1 □2 o2   o3
                      , closeObjsIntrprt : ObjectDefinitionWithId[][] =
                            // for all interpretations...
                            // Example: three blue balls => three combinations/interpretations
                            // [ [[o1,o2]],[[o1,o3]],[[o2,o3]] ]
                          _.map(locationsIntrprt, function (locationsOr) {
                            // ...filter out all objects which...
                            return _.filter(alikeObjs, function (obj) {
                                // ... satisfies at least one ...
                                return _.any(locationsOr, function (locationsAnd) {
                                    // ... of the 'and'-lists.
                                    // In example: must have relation to both balls
                                    return _.all(locationsAnd, function(location) {
                                        return hasBinaryConstraint(ppdlWorld, true, rel, obj, location);
                                    });
                                });
                            })
                        });
                       // (Example output: [[□1], [□1], [□1,□2]]
                } else {
                    console.log("TODO: implement more relations! See rel value of ",critLoc);
                }
                console.log('close objects:', closeObjsIntrprt);
            }

            // Process quantifiers. (Produce the final obj[][][])
            var quantFilteredObjs : ObjectDefinitionWithId[][][] = [];
            // Has location already given rise to different interpretations?
            if (closeObjsIntrprt) {
                // "the"
                // Select only one object.
                // If several objects match location within an interpretation, create an interpretation for each
                // Example: [[□1], [□1], [□1,□2]] -> [[[□1]], [[□1]], [[□1]] ,[[□2]]]
                // Concat the list, and turn objects into singleton-singleton or-and lists
                if (ent.quant === 'the') {
                    var list = concat(closeObjsIntrprt);
                    quantFilteredObjs = _.map(list, function (i) {
                        return [[i]];
                    });
                }

                // "any"
                // Example: [[□1], [□1], [□1,□2]] -> [[[□1]], [[□1]], [[□1],[□2]]]
                // Create singleton and lists for each object
                else if (ent.quant === 'any') {
                    quantFilteredObjs = _.map(closeObjsIntrprt, function (i) {
                        return _.map(i, function (j) {
                          return [j];
                        });
                    });
                }

                // "all"
                // Select all objects in each interpretation.
                // Example: [[□1], [□1], [□1,□2]] -> [[[□1]], [[□1]], [[□1,□2]]]
                // Create singleton or lists
                else if (ent.quant === 'all') {
                    quantFilteredObjs = _.map(closeObjsIntrprt, function (i) {
                        return [i];
                    });
                }
            }
            // Location was not specified
            else {
                // TODO: test these

                // "The floor" does in fact mean any floor tile
                // TODO: change... parser?
                if ((ent.quant === 'the') && (ent.obj.form === 'floor')) {
                    ent.quant = 'any';
                }

                // "the" should only select one object. May spawn multiple interpretations
                if (ent.quant === 'the') {
                    quantFilteredObjs = _.map(alikeObjs, function (obj) {
                        return [[obj]];
                    });
                    console.log("the. found other objects!", quantFilteredObjs);
                }

                // "any" can select any object. Has only one interpretation
                else if (ent.quant === 'any') {
                    // Any object is acceptable (Put singleton and lists)
                    var allObjs : ObjectDefinitionWithId[][] = _.map(alikeObjs, function (obj) {
                        return [obj];
                    });
                    // Only one interpretation (singleton outer list)
                    quantFilteredObjs = [allObjs];
                    console.log("any. found objects!", quantFilteredObjs);
                }

                // "all" selects all objects. Has only one interpretation
                else if (ent.quant === 'all') {
                    quantFilteredObjs = [[alikeObjs]];
                    console.log("all. found objects!", quantFilteredObjs);
                }
            }

            // Nub the interpretation list (remove duplicates)
            // It doesn't matter which intermediate objects we used to find the object(s)
            // Example: [[[□1]],[[□1]],[[□1],[□2]]] -> [[[□1]],[[□1],[□2]]]
            var nubbedList = _.uniq(quantFilteredObjs, function (i) {
                return JSON.stringify(i); // (convert to string since array comparisons are done by reference)
            });
            console.log("nubbed list:",nubbedList);

            return nubbedList;
        }
    }


    // Checks if ppdlWorld has some binary constraint
    // (Typically 'inside' or 'ontop')
    function hasBinaryConstraint(ppdlWorld, pol, rel, obj1, obj2) {
        var constraint = {pol: pol, rel: rel, args: [obj1.id, obj2.id]}
          , found      = _.find(ppdlWorld, constraint);
        // console.log("hasBinaryConstraint(): constraint:",constraint,"ppdlWorld",ppdlWorld,"found:",found);
        return found;
    }



    // Removes all null properties in an object
    function deleteNullProperties(obj) {
        for (var k in obj) {
            if (obj[k] === null || obj[k] === 'anyform') {
                delete obj[k];
            }
        }
        return obj;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}

