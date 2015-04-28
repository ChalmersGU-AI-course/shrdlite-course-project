///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="lib/collections.ts"/>

module Planner {

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
        var searchDepth = 10;

        //TODO this assumes state is a PDDL-world, not a WorldState
        //TODO WONT WORK!!!!!!!! MUST FIX!!!!!!!
        var topObjects:string[] = getObjectsOnTop(state);

        for(var i = 0; i<searchDepth; i++){
            for(var j = 0 ; i<topObjects.length; j++){

            }
        }

        //TODO create the graph here

        return plan;
    }

    // Returns a pddlworld where the given object is in the arm
    // Assumes that the given object is on top
    function liftObject(world:PddlLiteral[], object:string){
        var newWorld: PddlLiteral[];

        //TODO move to a clone-method somewhere
        for(var i in world) {
            newWorld[i] = {pol: world[i].pol, rel: world[i].rel, args: [world[i].args[0], world[i].args[1]]};
        }

        for(var i = 0; i<newWorld.length; i++){
            if(newWorld[i].args[0] === "object" && newWorld[i].rel === "ontop") {
                newWorld.splice(i, 1);
                //TODO what does the relation that an object is carried by the arm look like?
                newWorld.push({pol: true, rel:"inside", args: [object, "arm"]});
            }
        }

        return world;
    }

    //Takes a PDDL-world and returns an array of all the objects that are on top
    function getObjectsOnTop(world : ExtendedWorldState) {
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
