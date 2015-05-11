///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="lib/collections.ts"/>
///<reference path="astar/AStar.ts"/>

module Planner {
    //TODO put somewhere?
    var NUM_STACKS = 5;
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretation : PddlLiteral[][], currentState : ExtendedWorldState) : string[] {
        var plan : string[] = planInterpretation(interpretation, currentState);
        if (plan) {
            return plan;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }

    export function planToString(res : string[]) : string {
        return res.join(", ");
    }

    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions
    function planInterpretation(intprt : PddlLiteral[][], state : ExtendedWorldState) : string[] {
        var plan : string[] = [];

        console.log("planInterpretation()");

        //TODO should this be moved somewhere? Argument och global parameter?
        var searchDepth = 7;

        for(var i = 0; i<NUM_STACKS; i++) {
            var obs = state.objStacks[i];
            var obj = state.objStacks[i][obs.length-1];
            if(obs.length > 1) {
                state.pddlWorld.push({pol:true, rel:"attop", args:[obj.id, "floor-"+i]});
            }
        }

        console.log(intprt);

        //var boxes = findBoxes(state);

        state.pddlWorld.push({pol:true, rel:"at", args:["arm", state.arm+""]});
        var startNode:AStar.Node<PddlLiteral[]> = new AStar.Node<PddlLiteral[]>(state.pddlWorld, [], Infinity, null);
        var nPickUp = new AStar.Node<PddlLiteral[]>(liftObject(state.pddlWorld, 0), [], Infinity, null,"p"+1);
        var ePickUp = new AStar.Edge<PddlLiteral[]>(startNode, nPickUp, 1);
        startNode.neighbours.push(ePickUp);

        //Will hold all the created nodes
        //One of the dimensions is the "layers" of the node generation
        //The other dimension is the nodes within that layer
        var nodes: AStar.Node<PddlLiteral[]>[][] = [[]];
        nodes[0].push(startNode);
        nodes[0].push(nPickUp);

        for(var i = 0; i<searchDepth; i++){
            nodes[i+1] = [];
            for(var n in nodes[i]){
                var oldNode      = nodes[i][n]
                  , oldNodeWorld = oldNode.label
                  , armPos       = Number(getRel(oldNodeWorld, "at").args[1]);
                for(var j = 0; j<NUM_STACKS; j++) {
                    if(armPos != j) {
                        var dir  :string = j>armPos ? "r" : "l"
                          , cost :number = Math.abs(armPos-j)
                          , newNodeWorld = moveArm(oldNodeWorld, j);

                        var newNode = null;
                        // We can either -lift- or -putDown-
                        if(!isHolding(oldNodeWorld)) {
                            // We can't always lift - not if we lack objects!
                            var newerNodeWorld = liftObject(newNodeWorld, j);
                            if (newerNodeWorld) {
                                newNode = new AStar.Node<PddlLiteral[]>(newerNodeWorld, [], Infinity, null, dir+cost+"p"+1);
                            } else {
                                console.warn("breaking the first commandment");
                            }

                        } else {
                            // Try to putDown. Will fail if move is illegal
                            var newerNodeWorld = putDownObject(newNodeWorld, j, state);
                            if (newerNodeWorld) {
                                newNode = new AStar.Node<PddlLiteral[]>(newerNodeWorld, [], Infinity, null, dir+cost+"d"+1);
                            } else {
                                console.warn("breakin the laaw");
                            }
                        }

                        // Check if performing action at current column was legal
                        if (newNode) {
                            var edge = new AStar.Edge<PddlLiteral[]>(oldNode, newNode, cost);
                            oldNode.neighbours.push(edge); // Note: we don't want a return edge

                            // TODO: what happens when we do not push here?

                            nodes[i+1].push(newNode);
                        }
                    }
                }
/*
                if(!isHolding(oldNodeWorld)){
                    var node = new AStar.Node<PddlLiteral[]>(liftObject(oldNodeWorld, armPos), [], Infinity, null, "p"+1);
                    var edge = new AStar.Edge<PddlLiteral[]>(oldNode, node, 1);
                    oldNode.neighbours.push(edge);
                    nodes[i+1].push(node);
                } else {
                    var node = new AStar.Node<PddlLiteral[]>(putDownObject(oldNodeWorld,armPos, boxes), [], Infinity, null, "d"+1);
                    var edge = new AStar.Edge<PddlLiteral[]>(oldNode, node, 1);
                    oldNode.neighbours.push(edge);
                    nodes[i+1].push(node);
                }*/
            }
        }
        console.log("nodes",nodes);


        var searchResult = AStar.astar(startNode, createGoalFunction(intprt), createHeuristicFunction());

        console.log("Search result:");
        console.log(searchResult);

        for(var s in searchResult) {
            while(searchResult[s].action) {
                pushActions(plan, searchResult[s].action[0], Number(searchResult[s].action[1]));
                searchResult[s].action = searchResult[s].action.slice(2,searchResult[s].action.length);
            }

        }


        return plan;
    }

    function isHolding(world:PddlLiteral[]) {
        var holding = false;
        for(var i in world) {
            holding = holding || world[i].rel === "holding";
        }
        return holding;
    }

    function pushActions(plan:string[], action:string, times:number) {
        for(var i=0; i<times; i++) {
            plan.push(action);
        }
    }

    function createHeuristicFunction() {
        return function () {
            return 0;
        }
    }

    function createGoalFunction(goalWorld:PddlLiteral[][]) {
        return function(node:AStar.Node<PddlLiteral[]>) {
            var world = node.label;
            var done = false;
            for(var n in world) {
                for(var i in goalWorld) {
                    for(var j in goalWorld[i]) {
                        if(world[n].rel === goalWorld[i][j].rel &&
                            world[n].args[0] === goalWorld[i][j].args[0] &&
                            world[n].args[1] === goalWorld[i][j].args[1]) {
                            goalWorld[i].splice(i, 1);
                            break;
                        }
                    }

                    done = done || goalWorld[i].length === 0;
                }
            }

            return done;
        }
    }

    //Returns the first of the given relation in a Pddlworld
    function getRel(world:PddlLiteral[], rel:string):PddlLiteral {
        for(var i in world) {
            if(world[i].rel === rel) {
                return world[i];
            }
        }
    }

    //TODO put in PddlWorld interface in some way or other?
    function clonePddlWorld(world:PddlLiteral[]):PddlLiteral[] {
        var newWorld: PddlLiteral[] = [];

        //TODO move to a clone-method somewhere
        for(var w in world) {
            newWorld.push({pol: world[w].pol, rel: world[w].rel, args: [world[w].args[0], world[w].args[1]]});
        }

        return newWorld;
    }

    //Moves the arm in the given PddlWorld to the given stack
    //Returns the modified world, does not change the original!
    function moveArm(state:PddlLiteral[], stack:number):PddlLiteral[]{
        //If you try to move outside the world just ignore it
        if(stack > 5 || stack < 0) {
            return state;
        }

        var world:PddlLiteral[] = clonePddlWorld(state);

        for(var i in world) {
            //TODO should we put the arms current location in pddlworld?
            if(world[i].rel === "at") {
                world.splice(i,1);
                break;
            }
        }

        world.push({pol: true, rel: "at", args:["arm", ""+stack]});

        return world;
    }

    //Puts the held object down on the top object on the given stack
    //Takes a list of possible boxes to know if it should be "inside" or "ontop"
    //Returns the modified world, does not change the original!
    function putDownObject(world:PddlLiteral[], floor: number, state : ExtendedWorldState):PddlLiteral[] {
        var newWorld: PddlLiteral[] = clonePddlWorld(world);

        // Find currently held object
        var object = null;
        for(var i in newWorld) {
            if(newWorld[i].rel === "holding") {
                object = newWorld[i].args[1];
            }
        }
        if (!object) return null;

        // Find the object on top of the indicated stack. Also remove its 'attop' preicate
        var topObject = "floor-"+floor;
        for(var i in newWorld) {
            if(world[i].rel === "attop" && world[i].args[1] === "floor-"+floor) {
                topObject = world[i].args[0];
                newWorld.splice(i, 1);
                break;
            }
        }
        if (!topObject) return null;

        var objectObj = state.objectsWithId[object];
        var topObjectObj = state.objectsWithId[topObject];

        var objectForm    = objectObj.form
          , topObjectForm = topObjectObj.form;

        // TODO check if this placement is legal. If not, return null!

        // if object is a ball, and
        // if topObject is not floor or box,
        //   return null
        // TODO; this doesn't work!
        if (objectForm === 'ball' && (topObjectForm !== 'floor' || topObjectForm !== 'box')) {
            //console.log("should return null");
            //return null;
        }

        // if topObject is a ball,
        //   return null
        if (topObjectForm === 'ball') {
            //return null;
        }

        // if topObject is small and
        // if object is large,
        //   return null

        // if topObject is a box, and
        // if object is a pyramid, plank or box, and
        // if object and topObject have the same size,
        //   return null

        // if topObject is a (small brick) or pyramid, and
        // if object is a small box,
        //   return null

        // Large boxes cannot be supported by large pyramids.
        // if topObject is a large pyramid, and
        // if object is a large box,
        //   return null


        // Determine 'rel' part of the new predicate
        if (topObjectForm === 'box') {
            var rel = "inside";
        } else {
            var rel = "ontop";
        }

        removeLiteral(newWorld, {pol:true, rel:"holding", args:["arm", object]});

        newWorld.push({pol:true, rel:rel, args:[object, topObject]});
        newWorld.push({pol:true, rel:"attop", args:[object, "floor-"+floor]});
        return newWorld;
    }

    // Lifts the object that is on top of the given stack
    // Assumes that the arm is in the right position to do so
    function liftObject(world:PddlLiteral[], floor: number):PddlLiteral[] {
        var newWorld: PddlLiteral[] = clonePddlWorld(world);
        var foundObject = false;

        for(var i:number = 0; i<newWorld.length; i++){
            if(newWorld[i].rel === "attop" && newWorld[i].args[1] === "floor-"+floor) {
                var object = newWorld[i].args[0];
                newWorld.splice(i, 1);

                for(var j in newWorld) {
                    if((newWorld[j].rel === "ontop" || newWorld[j].rel === "inside") && world[j].args[0] === object) {
                        var topRel = newWorld.splice(j, 1);
                        if(topRel[0].args[1].indexOf("floor") === -1) {
                            newWorld.push({pol:true, rel:"attop", args:[topRel[0].args[1], "floor-"+floor]});
                        }
                    }
                }

                newWorld.push({pol: true, rel:"holding", args: ["arm", object]});
                foundObject = true;
                break;
            }
        }
        //if (!foundObject) {
        //    return null;
        //} else {
        //    return newWorld;
        //}
        return newWorld;
    }

    //Takes a PDDL-world and returns an array of all the objects that are on top
    function getObjectsOnTop(world : ExtendedWorldState):string[] {
        var objects: collections.Set<string> = new collections.Set<string>(),
            pddlWorld: PddlLiteral[] = world.pddlWorld;

        // Get every object in the world and add it to a set
        for(var id in world.objectsWithId){
            if(id.indexOf("floor") === -1) {
                objects.add(id);
            }
        }

        for(var i in pddlWorld){
            var rel = pddlWorld[i].rel;
            if(rel === "ontop" || rel === "inside") {
                objects.remove(pddlWorld[i].args[1]);
            }
        }

        return objects.toArray();
    }

    function removeLiteral(world: PddlLiteral[], literal:PddlLiteral) {
        for(var i in world) {
            if(literal.rel === world[i].rel && literal.pol === world[i].pol
                && literal.args[0] === world[i].args[0]
                && literal.args[1] === world[i].args[1]){
                world.splice(i, 1);
            }
        }

        return world;
    }

    function findBoxes(world: ExtendedWorldState):string[] {
        var boxes = [];
        for(var i in world.objectsWithId) {
            if(world.objectsWithId[i].form === "box") {
                boxes.push(i);
            }
        }
        return boxes;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
