///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="lib/collections.ts"/>
///<reference path="astar/AStar.ts"/>

module Planner {
    //TODO put somewhere?
    var NUM_STACKS = 5;
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : ExtendedWorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
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

        //TODO should this be moved somewhere? Argument och global parameter?
        var searchDepth = 5;

        for(var i = 0; i<NUM_STACKS; i++) {
            var obs = state.objStacks[i];
            var obj = state.objStacks[i][obs.length-1];
            if(obs.length > 1) {
                state.pddlWorld.push({pol:true, rel:"attop", args:[obj.id, "floor-"+i]});
            }
        }

        console.log(intprt);

        var boxes = findBoxes(state);

        state.pddlWorld.push({pol:true, rel:"at", args:["arm", state.arm+""]});


        var startNode:AStar.Node<PddlLiteral[]> = new AStar.Node<PddlLiteral[]>(state.pddlWorld, [], Infinity, null);

        //Will hold all the created nodes
        //One of the dimensions is the "layers" of the node generation
        //The other dimension is the nodes within that layer
        var nodes: AStar.Node<PddlLiteral[]>[][] = [[]];
        nodes[0].push(startNode);

        for(var i = 0; i<searchDepth; i++){
            nodes[i+1] = [];
            for(var n in nodes[i]){
                var armPos = Number(getRel(nodes[i][n].label, "at").args[1]);
                for(var j = 0; j<NUM_STACKS; j++) {
                    if(armPos != j) {
                        var dir:string = j>armPos ? "r" : "l";
                        var cost:number = Math.abs(state.arm-j);
                        var node = new AStar.Node<PddlLiteral[]>(moveArm(nodes[i][n].label, j), [], Infinity, null, dir+cost);
                        var edge = new AStar.Edge<PddlLiteral[]>(nodes[i][n], node, cost);
                        nodes[i][n].neighbours.push(edge);
                        nodes[i+1].push(node);
                    }
                }

                if(!isHolding(nodes[i][n].label)){
                    var node = new AStar.Node<PddlLiteral[]>(liftObject(nodes[i][n].label, armPos), [], Infinity, null, "p"+1);
                    var edge = new AStar.Edge<PddlLiteral[]>(nodes[i][n], node, 1);
                    nodes[i][n].neighbours.push(edge);
                    nodes[i+1].push(node);
                } else {
                    var node = new AStar.Node<PddlLiteral[]>(putDownObject(nodes[i][n].label,armPos, boxes), [], Infinity, null, "d"+1);
                    var edge = new AStar.Edge<PddlLiteral[]>(nodes[i][n], node, 1);
                    nodes[i][n].neighbours.push(edge);
                    nodes[i+1].push(node);
                }
            }
        }


        var searchResult = AStar.astar(startNode, createGoalFunction(intprt), createHeuristicFunction());

        console.log("Search result:");
        console.log(searchResult);

        for(var s in searchResult) {
            pushActions(plan, searchResult[s].action[0], Number(searchResult[s].action[1]));
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

    //Puts the given object cdown on the top object on the given stack
    //Takes a list of possible boxes to know if it should be "inside" or "ontop"
    //Returns the modified world, does not change the original!
    function putDownObject(world:PddlLiteral[], floor: number, boxes:string[]):PddlLiteral[] {
        var newWorld: PddlLiteral[] = clonePddlWorld(world);

        var object = null;
        for(var i in newWorld) {
            if(newWorld[i].rel === "holding") {
                object = newWorld[i].args[1];
            }
        }


        var topObject = "floor-"+floor;
        for(var i in newWorld) {
            if(world[i].rel === "attop" && world[i].args[1] === "floor-"+floor) {
                topObject = world[i].args[0];
                newWorld.splice(i, 1);
                break;
            }
        }

        var rel = "ontop";

        for(var i in boxes) {
            if(boxes[i] === topObject) {
                rel = "inside";
            }
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
                break;
            }
        }

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
