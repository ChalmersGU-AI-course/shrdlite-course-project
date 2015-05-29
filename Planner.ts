///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>
///<reference path="WorldNode.ts"/>
///<reference path="WorldAstar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        var error = null;
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            try {
                plan.plan = planInterpretation(plan.intp, currentState);
            }
            catch(err) {
                error = err;
                return;
            }
            if (plan.plan) {
                plans.push(plan);
            }
        });
        if (plans.length) {
            return plans;
        } else {
            if(error) {
                throw error;
            }

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
   

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        try {
            if (intprt.length == 0) {
                return null;
            }

            var goalFunc = getGoalFunc(intprt);
            var heuristicFunc = getHeuristicFunction(intprt);
            var world = new WorldNode(state)
            var astarResult = Astar(world, goalFunc, heuristicFunc, 5000);

            if (!astarResult || !astarResult.Path){
                return null;
            }

            var steps = astarResult.Path.Steps;
            var analyzedPlan = Planalyzer.planalyzeActions(steps, state, intprt);
            return analyzedPlan;
        } catch (err) {
            if (err instanceof TimeoutException) {
                throw new Error("timeout");
            } else {
                throw err;
            }
        }
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
