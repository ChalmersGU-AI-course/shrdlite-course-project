///<reference path="Puzzle.ts"/>
///<reference path="Interpreter.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : PuzzleState) : Result[] {
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

    function planInterpretation(intprt : Interpreter.Literal[][], state : PuzzleState) : string[] {
        var plan : string[] = [];
        var mn = 10000;
        var mi = 0;
        var newfrontier : PuzzleState[] = [];
        var newcost : number[] = [];

        state.InitialCost = 1; //initial path cost
        var frontier : PuzzleState[] = [state];
        var cost : number[] = [getCostOfState(state)];

        // the aStar part , kind of rudimentary as I need to finish TODAY!!! and I dont know tyepscript...
        do {
           for (var i = 0; i < cost.length; i++)
                if(cost[i] < mn) {
                        mn = cost[i];
                        mi = i;
                }
            var nextState : PuzzleState = frontier[mi];
            if(goal(nextState))
                return planFor(nextState, state);
            var solvingI = nextState.InitialCost;
            for(var i=0; i < solvingI; ++i)
                if(state.stacks[solvingI].length == 0)
                    solvingI++;
            var fl : number = frontier.length;
            var aState : PuzzleState = clone(nextState);
            ++aState.InitialCost;//path cost
            for(var j = aState.stacks[solvingI].length; j < 8; j++) {
                aState = clone(aState);
                aState.stacks[solvingI].push("x");
                if(!canBeAttacked(aState, solvingI)) { //prune
                    frontier.push(aState);
                    cost.push(getCostOfState(aState));
                }
            }
            newfrontier = [];
            newcost = [];
            for (var i = 0; i < cost.length; i++)
               if(i != mi) {
                    newfrontier.push(frontier[i]);
                    newcost.push(cost[i]);
               }
            frontier = newfrontier;
            cost = newcost;

        } while(frontier.length > 0);
        plan.push("Moving right as I couldnt finish "+mi+" "+frontier.length);
        plan.push("r");
        return plan;
    }

    function planFor(nextState : PuzzleState, state: PuzzleState) {
        var plan : string[] = [];
        var statearm = state.arm;
        var pickstack = -1;
        do {
            ++pickstack;
        } while (state.stacks[pickstack].length == 0);
        while(pickstack < state.stacks.length) {
            if(state.stacks[pickstack].length != nextState.stacks[pickstack].length) {
                // First move the arm to the position
                if (pickstack < statearm) {
                    plan.push("Moving left");
                    for (var i = statearm; i > pickstack; i--) {
                        plan.push("l");
                    }
                } else if (pickstack > state.arm) {
                    plan.push("Moving right");
                    for (var i = statearm; i < pickstack; i++) {
                        plan.push("r");
                    }
                }
                statearm = pickstack;
                // Then pick up the object
                var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
                plan.push("Picking up the " + state.objects[obj].form,
                          "p");

                // Raising it up
                plan.push("Raising the " + state.objects[obj].form);
                for (var i = state.stacks[pickstack].length; i < nextState.stacks[pickstack].length; i++)
                    plan.push("a");

                // Finally put it down again
                plan.push("Dropping the " + state.objects[obj].form,
                          "d");
            }
            pickstack++;
        }
        return plan;
    }

    function getCostOfState(state : PuzzleState) {
        var cost : number = state.InitialCost
        for(var i = 0; i < state.stacks.length; i++)
            if(isAttacked(state, i, state.stacks.length))
                ++cost; // You have to move it if its attacked
        return cost;
    }

    function canBeAttacked(state : PuzzleState, i:number): Boolean {
        for(var j = 0; j < i; j++) // horizontal attacks
          if(state.stacks[j].length != 0)
            if(state.stacks[i].length == state.stacks[j].length)
                return true;
        for(var j = 0; j < i; j++) // Diagonal up
          if(state.stacks[j].length != 0)
            if(state.stacks[i].length == state.stacks[j].length + (j-i))
                return true;
        for(var j = 0; j < i; j++) // Diagonal down
          if(state.stacks[j].length != 0)
            if(state.stacks[i].length == state.stacks[j].length - (j-i))
                return true;
    }

    function isAttacked(state : PuzzleState, i:number, mx:number): Boolean {
        if(state.stacks[i].length == 0)
            return false;
        for(var j = i + 1; j < mx; j++) // horizontal attacks
          if(state.stacks[j].length != 0)
            if(state.stacks[i].length == state.stacks[j].length)
                return true;
        for(var j = i + 1; j < mx; j++) // Diagonal up
          if(state.stacks[j].length != 0)
            if(state.stacks[i].length == state.stacks[j].length + (j-i))
                return true;
        for(var j = i + 1; j < mx; j++) // Diagonal down
          if(state.stacks[j].length != 0)
            if(state.stacks[i].length == state.stacks[j].length - (j-i))
                return true;
    }

    function goal(state : PuzzleState): Boolean {
        for(var i = 0; i < state.stacks.length; i++)
            if(isAttacked(state, i, state.stacks.length))
                return false;
        return true;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function clone<T>(obj: T): T {
        if (obj != null && typeof obj == "object") {
            var result : T = obj.constructor();
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = clone(obj[key]);
                }
            }
            return result;
        } else {
            return obj;
        }
    }

}
