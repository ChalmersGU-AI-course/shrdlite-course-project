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
        var pddl = intprt[0][0];
        console.log("here i am!", pddl);
        if(pddl.rel == null)
            return ["Nothing needs to change!"];
                    
        console.log("here i am!", pddl);
        var heur = function(a : WorldState)
        {
            return 0;
        }
            
        var goal;
        if(pddl.rel === "holding")
        {
            goal = holdingGoal(intprt[0][0].args[0]);
        }           
        else if(pddl.rel === "ontop" || 
                pddl.rel == "inside" || 
                pddl.rel == "under"  ||
                pddl.rel == "over")
        {
            if(pddl.rel == "under")
            {
                var tmp = pddl.args[0];
                pddl.args[0] = pddl.args[1];
                pddl.args[1] = tmp;
            }
            
            //Some things cannot be placed ontop of other things.
            //But everything can be placed on the floor.
            if(pddl.args[1] !== "floor")
            {
                var a = state.objects[pddl.args[0]];
                var b =  state.objects[pddl.args[1]];            
                if(!Spatial.canBeOntop(a, b) )
                    return [Spatial.ontopError(a, b)];
            }
            
            goal = ontopGoal(pddl.args[0], pddl.args[1]);
        }
        else if(pddl.rel === "rightof")
        {
            goal = sideOfGoal(pddl.args[1], pddl.args[0]);
        }
        else if(pddl.rel === "leftof")
        {
            goal = sideOfGoal(pddl.args[0], pddl.args[1]);
        }
        else 
        {
            goal = goalFn;
        }
            
        var result = Astar.findPath(state, Neighbour.listNeighbours, heur, worldEq, goal, worldStr);
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
                //No action.
                path.push("No action required.");
            }
        }

        return path;
    }
    
    function holdingGoal(obj : string) : (a : WorldState) => boolean
    {
        return function(a : WorldState) : boolean
        {
            return a.holding === obj;
        }
    }
    
    function ontopGoal(over : string, under : string) : (a : WorldState) => boolean
    {
        if(under == "floor")
        {
            return function(a : WorldState) : boolean
            {
                for (var i = 0; i < a.stacks.length; i++)
                {
                    if(a.stacks[i].length > 0 &&
                       a.stacks[i][0] === over)
                       return true;
                }
                return false;
            }
        }
        else 
        {        
            return function(a : WorldState) : boolean
            {
                for (var i = 0; i < a.stacks.length; i++)
                {
                    for (var j = 0; j < a.stacks[i].length - 1; j++)
                    {
                        if(a.stacks[i][j] == under &&
                           a.stacks[i][j + 1] == over)
                           return true;
                    }
                }
                
                return false;
            }
        }
    }

    function sideOfGoal(left: string, right : string) : (a : WorldState) => boolean
    {
        return function(a : WorldState) : boolean
        {
            var le = a.stacks.length, ri = 0;
            for (var i = 0; i < a.stacks.length; i++)
            {
                for (var j = 0; j < a.stacks[i].length; j++)
                {
                    if(a.stacks[i][j] == left)
                    {
                        le = i;
                    }
                    else if(a.stacks[i][j] == right)
                    {
                        ri = i;
                    }
                }
            }
            
            return le < ri;
        }
    }
    
    function goalFn(a : WorldState) : boolean
    {
        return worldEq(a, endState);
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
        if(a.stacks.length !== b.stacks.length) return false;
        for (var i = 0; i < a.stacks.length; i++)
        {
            if(a.stacks[i].length !== b.stacks[i].length) return false;
            for (var j = 0; j < a.stacks[i].length; j++)
            {
                if(a.stacks[i][j] !== b.stacks[i][j]) return false;
            }
        }

        return true;
    }
}