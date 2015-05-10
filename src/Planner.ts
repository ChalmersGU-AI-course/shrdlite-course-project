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
    
    class Plan {
        plan : string[];
        arm : number;
        
        constructor(armPos : number) {
            this.plan = [];
            this.arm = armPos;
        }
        
        public move(dest : number) {
            var diff = dest-this.arm;
            var m = diff<0 ? "l" : "r";
            for(var i = 0; i<Math.abs(diff); i++) {
                this.plan.push(m);
            }
        }
        
        public pick() {
            this.plan.push("p");
        }
        
        public drop() {
            this.plan.push("d");
        }
    }
    
    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        var plan = new Plan(state.arm)
        var orderedGoals = orderGoals(intprt, state)
        solve(orderedGoals, state, plan)
        return plan.plan;
        /*
        // This function returns a dummy plan involving a random stack
        do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan : string[] = [];

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

        return plan;*/
    }
    
    function orderGoals(intprt : Interpreter.Literal[][], state : WorldState) : Interpreter.Literal[] {
        return intprt[0];
    }
    
    // NB: we would probably add some constraints argument over the previous objects which have been placed.
        var goal = goals[0];
        delete goals[0];
        var depCol = getCol(goal.args[0], state.stacks);
        var forbid = [];
        if (goal.args.length>1) {
            forbid.push(getCol(goal.args[1], state.stacks));
        }
        unstack(depCol, goal.args[0], forbid, plan);
        if (goal.args.length>1) {
            unstack(forbid[0], goal.args[1], [depCol], plan);
        }
    }
    
    function getCol(obj : string, stacks : string[][]) : number {
        var i : number;
        for (i=0; i<stacks.length || stacks[i].indexOf(obj)<0; i++) {
            
        }
        if (i==stacks.length) {i=-1;}
        return i;
    }
    
    function unstack(col : number, obj : string, forbid : number[], plan : Plan) {
        
    }
    
    /**
     * Simply returns the sum of objects piled over the concerned objects defined in objectToMove.
     * The contribution of each oject could be depending on their constraints.
     * (Ex : ball > box > pyramid > table and small > large)
     */
    function heuristic(objToMove : string[], stacks : string[][]) : number {
        var score = 0;
        for(var i=0; i<stacks.length; i++) {
            for(var j=0; j<stacks[i].length; j++) {
                if (objToMove.indexOf(stacks[i][j])>-1) {
                    score+=j;
                }
            }
        }
        return score;
    }
    
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
