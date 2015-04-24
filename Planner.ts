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

        //TODO this assumes state is a PDDL-world, not a WorldState
        //TODO WONT WORK!!!!!!!! MUST FIX!!!!!!!
        var topObjects:string[] = getObjectsOnTop(state);



        //TODO create the graph here

        return plan;
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
