///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

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


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function printLog(log : Object) : void {
        document.getElementById('log').innerHTML += JSON.stringify(log) + "<br/>";
    }

    var exampleState = {
        "stacks": [["e"],["g","l"],[],["k","m","f"],[]],
        "holding":null,
        "arm":0,
        "objects":{
            "a":{"form":"brick","size":"large","color":"green"},
            "b":{"form":"brick","size":"small","color":"white"},
            "c":{"form":"plank","size":"large","color":"red"},
            "d":{"form":"plank","size":"small","color":"green"},
            "e":{"form":"ball","size":"large","color":"white"},
            "f":{"form":"ball","size":"small","color":"black"},
            "g":{"form":"table","size":"large","color":"blue"},
            "h":{"form":"table","size":"small","color":"red"},
            "i":{"form":"pyramid","size":"large","color":"yellow"},
            "j":{"form":"pyramid","size":"small","color":"red"},
            "k":{"form":"box","size":"large","color":"yellow"},
            "l":{"form":"box","size":"large","color":"red"},
            "m":{"form":"box","size":"small","color":"blue"}
            },
        "examples":[]
    };

    var exampleGoal = "inside(f, k)";

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        var plan : string[] = [];
        printLog(state);
        /*do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        plan.push("Picking up the " + state.objects[obj].form,
                  "p");

        if (pickstack < state.stacks.length-1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length-1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length-1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
                  "d");
        */
        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
