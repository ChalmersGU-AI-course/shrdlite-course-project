///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Neighbour_functions.ts"/>
///<reference path="Heuristics.ts"/>
///<reference path="Astar.ts"/>
///<reference path="Goals.ts"/>

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
    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {    
        var pddl = intprt[0][0];

        var goal = Goals.createGoalFromPDDL(pddl, state);
        var heur = Heuristics.createHeuristicsFromPDDL(pddl, state);
        //Attempts to find a path, terminates after 20000 iterations of generating new frontiers
        var result = Astar.findPath(state, Neighbour.listNeighbours, heur, goal, worldStr, 20000);
        if(!result.success)
            throw new Planner.Error("The planner could not find a solution to the query.");

        var path = [];
        //Build a sequence of instructions for the robot.
        //"d" represents dropping the current object
        //"p" represents picking up the object directly below the robot
        //"r" represents taking a step to the right
        //"l" represents taking a step to the left
        for (var i = 1; i < result.nodes.length; i++)
        {
            var s0 = result.nodes[i - 1];
            var s1 = result.nodes[i];

            if(s0.holding && !s1.holding)
            {
                path.push("d");
            }
            else if(!s0.holding && s1.holding)
            {
                path.push("p");
            }
            else if(s0.arm < s1.arm)
            {
                path.push("r");
            }
            else if(s0.arm > s1.arm)
            {
                path.push("l");
            }
            else //This case is required if we started in the goal state
            {
                //No action.
                path.push("No action required.");
            }
        }

        return path;
    }

    //Returns a string representation of the world state
    function worldStr(a: WorldState): string 
    {
        var str = "";
        for (var i = 0; i < a.stacks.length; i++)
        {
            str = str + "(";
            for (var j = 0; j < a.stacks[i].length; j++)
            {
                //No separator is required inside the stacks in the example worlds,
                //since no object name can be constructed from other object names
                str = str + a.stacks[i][j];
            }
            str = str + ")";
        }

        str = str + a.holding + " " + a.arm.toString();
        return str;
    }
}
