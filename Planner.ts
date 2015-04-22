///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Neighbour_functions.ts"/>
///<reference path="Heuristics.ts"/>
///<reference path="Astar.ts"/>

module Planner {

var endState : WorldState = { 
    "stacks": [[],["g","l"],["m"],["k","e"],["f"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "a": { "form":"brick",   "size":"large",  "color":"green" },
        "b": { "form":"brick",   "size":"small",  "color":"white" },
        "c": { "form":"plank",   "size":"large",  "color":"red"   },
        "d": { "form":"plank",   "size":"small",  "color":"green" },
        "e": { "form":"ball",    "size":"large",  "color":"white" },
        "f": { "form":"ball",    "size":"small",  "color":"black" },
        "g": { "form":"table",   "size":"large",  "color":"blue"  },
        "h": { "form":"table",   "size":"small",  "color":"red"   },
        "i": { "form":"pyramid", "size":"large",  "color":"yellow"},
        "j": { "form":"pyramid", "size":"small",  "color":"red"   },
        "k": { "form":"box",     "size":"large",  "color":"yellow"},
        "l": { "form":"box",     "size":"large",  "color":"red"   },
        "m": { "form":"box",     "size":"small",  "color":"blue"  }
    },
    "examples": [
        "put the white ball in a box on the floor",
        "put the black ball in a box on the floor",
        "take a blue object",
        "take the white ball",
        "put all boxes on the floor",
        "move all balls inside a large box"
    ]
};



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
    
         var result = Astar.findPath(state, endState, Neighbour.listNeighbours, Heuristics.simple, worldEq, worldStr);
        
        var path = [];
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
            else 
            {
                throw "Error in planner!";
            }
        }

        return path;
    }

    function worldStr(a: WorldState): string 
    {
        var str = "";
        for (var i = 0; i < a.stacks.length; i++)
        {
            str = str + "(";
            for (var j = 0; j < a.stacks[i].length; j++)
            {
                str = str + a.stacks[i][j];

            }
            str = str + ")";
        }

        str = str + a.holding + " " + a.arm.toString();
        return str;
    }

    function worldEq(a: WorldState, b: WorldState): boolean 
    {
        return worldStr(a) === worldStr(b);
    }

    function nullheur(a : WorldState, b: WorldState) : number
    {
        return 0;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
