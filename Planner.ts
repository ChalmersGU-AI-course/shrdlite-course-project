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

    //TODO first create the graph then find shortest path with AStar
    //TODO Remove the code that is here right now
    function planInterpretation(intprt : PddlLiteral[][], state : ExtendedWorldState) : string[] {
        var plan : string[] = [];

        //TODO should this be moved somewhere? Argument och global parameter?
        var searchDepth = 2;

        //TODO this assumes state is a PDDL-world, not a WorldState
        //TODO WONT WORK!!!!!!!! MUST FIX!!!!!!!
        var topObjects:string[] = getObjectsOnTop(state);

        state.pddlWorld.push({pol:true, rel:"at", args:["arm", "0"]});

        var startNode:AStar.Node<PddlLiteral[]> = new AStar.Node<PddlLiteral[]>(state.pddlWorld, [], Infinity, null);

        //Will hold all the created nodes
        //One of the dimensions is the "layers" of the node generation
        //The other dimension is the nodes within that layer
        var nodes: AStar.Node<PddlLiteral[]>[][] = [[]];
        nodes[0].push(startNode);

        for(var i = 0; i<searchDepth; i++){
            nodes[i+1] = [];
            for(var n in nodes[i]){
                if(state.holding === null){
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
                    //TODO add a lift to the top object under arm


//                    var node = new AStar.Node<PddlLiteral[]>(liftObject(nodes[i][n].label, stack[stack.length-1].id));
                }
            }
        }


        //Create a testgoal

        var goal:PddlLiteral[] = [
            {pol:true, rel:"at", args:["arm", "3"]}
        ];

        var searchResult = AStar.astar(startNode, createGoalFunction(goal), createHeuristicFunction());

        console.log("Search result:");
        console.log(searchResult);

        console.log("Start node:");
        console.log(startNode);

        console.log("State:");
        console.log(state);

        for(var s in searchResult) {
            pushActions(plan, searchResult[s].action[0], Number(searchResult[s].action[1]));
        }

        console.log("Plan:");
        console.log(plan);

        return plan;
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

    function createGoalFunction(goalWorld:PddlLiteral[]) {
        return function(node:AStar.Node<PddlLiteral[]>) {
            var world = node.label;
            for(var n in world) {
                for(var i in goalWorld) {
                    if(world[n].rel === goalWorld[i].rel &&
                        world[n].args[0] === goalWorld[i].args[0] &&
                        world[n].args[1] === goalWorld[i].args[1]) {
                        goalWorld.splice(i, 1);
                        break;
                    }
                }
            }

            return goalWorld.length === 0;
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

    //Returns a PddlWorld where the arm has moved to the given number
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

    // Returns a pddlworld where the given object is in the arm
    // Assumes that the given object is on top
    function liftObject(world:PddlLiteral[], object:string):PddlLiteral[] {
        var newWorld: PddlLiteral[] = clonePddlWorld(world);

        for(var i:number = 0; i<newWorld.length; i++){
            if(newWorld[i].args[0] === "object" && newWorld[i].rel === "ontop") {
                newWorld.splice(i, 1);
                //TODO what does the relation that an object is carried by the arm look like?
                newWorld.push({pol: true, rel:"inside", args: [object, "arm"]});
            }
        }

        return world;
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

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
}
