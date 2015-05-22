///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar/astar.ts"/>
///<reference path="World_State.ts"/>

module Planner { 

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            if (plan.plan) {
                plans.push(plan);
            }
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
        var starting_state = new State(state)
        var goal = find_goal_node(intprt);
        var heuristic = create_heuristic(intprt);
        
        var path = astar_search(starting_state, goal, heuristic);

        console.log("Path")
        console.log(path.Path.Operations)
        return path.Path.Operations;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    ////////////////////// Defining GOal //////////////////////

    function find_goal_node(intprt: Interpreter.Literal[][]) {
        return function testNode(state: State) : boolean {
            for (var i=0; i < intprt.length; i++) {
                var validWorldState : boolean = true;
                for (var j=0; j< intprt[i].length; j++) {
                    if (!checkStateValidity(state.State, intprt[i][j])) {
                        validWorldState = false;
                        break;
                    }
                }
                if (validWorldState) {
                    return true;
                }

            }
            return false;
        }
    }

    export function checkStateValidity(state: WorldState, literal: Interpreter.Literal) : boolean {
        if (literal.rel.indexOf("holding") != -1)
            return state.holding == literal.args[0];

        if ((literal.args[0].indexOf("floor") != -1) && (literal.rel.indexOf("under") != -1))
            return false;

        var pos1 = locate_object(literal.args[0], state);
        if (!pos1)
            return false;
        
        var pos2: Object_Location;
        if (literal.args[1].indexOf("floor") != -1) {
            pos2 = new Object_Location(pos1.location, -1);
        } 
        else {
            pos2 = locate_object(literal.args[1], state);
        }

        if (!pos2)
            return false;

        if (literal.rel.indexOf("leftof") != -1)
            return pos1.location < pos2.location;

        else if (literal.rel.indexOf("rightof") != -1)
            return pos1.location > pos2.location;

        else if (literal.rel.indexOf("beside") != -1)
            return Math.abs(pos1.location - pos2.location) == 1;

        else if ((literal.rel.indexOf("ontop") != -1) || (literal.rel.indexOf("inside") != -1))
            return pos1.location == pos2.location && pos1.height == pos2.height + 1;

        else if (literal.rel.indexOf("under") != -1)
            return pos1.location == pos2.location && pos1.height < pos2.height;

        else if (literal.rel.indexOf("above") != -1)
            return pos1.location == pos2.location && pos1.height > pos2.height;
        else
            return null;

    }

    function locate_object(obj: string, state: WorldState): Object_Location {
        if (state.holding == obj)
            return null;
        
        for (var i = 0; i < state.stacks.length; i++) {
            for (var j = 0; j < state.stacks[i].length; j++) {
                if (obj == state.stacks[i][j]) {
                    return new Object_Location(i, j);
                }
            }
        }
        return null;
    }
}