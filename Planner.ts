///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="astarAlgorithm.ts"/>

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
        // This function returns an empty plan involving no random stack
        var plan : string[] = [];
        
        //TODO: calculate a goalstate, or a function evaluation if a state is a goalstate.
        //TODO: wrap worldstate in something that inherits from Astar.Node.
        //TODO: Make an appropriate type/struct for action/actions.

        function dynamic_children(state : Worldstate){
            var states : states[] = []; 
            for (action in actions){
                if(works(action)){ //TODO: set ids etc  
                    states.push(calculate_state(state,action));
                }
            }
            return states;
        }

        function works(action) : boolean {
            //TODO: evaluates each action and returns a bolan if the action is possible to preform.
        }

        function calculate_state(action, state : Worldstate) : Worldstate {
            //TODO: calculates the next state given a action.
        }

        function state_hier(){
            //TODO: Hieristics 
        }

        function get_state_dist(){
            //TODO: Calculates the distance between two states, see astarTest.
        }

        var path = Astar.Astar(state,goal,{
            heuristic_approx: state_hier,
            dist_between: get_state_dist,
            get_children: dynamic_children
          });
        
        //TODO: exctract the plan from the path.

        return plan;
    }
}
