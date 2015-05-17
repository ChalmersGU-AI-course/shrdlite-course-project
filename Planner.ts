///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="lib/astar-worldstate/astar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
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


    export class Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {

        var solution = aStar.aStar(new WorldStateNode(state), intprt);

        if(solution !== null ) {
            var moves = [];

            solution.getPath().forEach((move) => {
                moves.push(move.getCommand());
                return true;
            });

            return moves;
        } else {
            throw new Planner.Error("Could not plan a path that fulfills the goals.")
        }
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
