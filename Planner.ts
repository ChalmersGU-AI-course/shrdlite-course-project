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
    // Private classes

    class ActionState extends Astar.Node{
            world: WorldState
            action: string
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns an empty plan involving no random stack
        var plan : string[] = [];
        
        //TODO: Make an appropriate type/struct for action/actions.
        var actions : string[]  = ["LEFT","RIGHT","GRAB","DROP"]; 
        
        //TODO: calculate a goalstate, or a function evaluation whether a state is a goalstate.
        function is_goalstate(state : ActionState): boolean{
            return true;
        }
        
        //TODO: wrap worldstate in something that inherits from Astar.Node.
        var start =  new ActionState("start");
        start.world = state; 
        
        function dynamic_children(state : ActionState){
            var states : [ActionState]; 
            for (var i in actions){
                if(works(actions[i],state.world) ){ //TODO: set ids etc  
                    states.push(calculate_state(actions[i],state.world));
                }
            }
            return states;
        }

        function works( action : string , state : WorldState) : boolean {
            //TODO: evaluates each action and returns a boolean if the action is possible to perform.
            switch(action){
                case 'LEFT':
                    return (state.arm > 0) 
                    break;
                case 'RIGHT':
                    return (state.arm < state.stacks.length)
                    break;
                case 'GRAB':
                    return (state.holding == null)
                    break;
                case 'DROP':
                    return (state.holding != null) //&& (state.stacks[state.arm])
                    break;
                default :
                    //Alternative: returns allways false
                    throw new Error("unsupported action");
            }
            
        }

        function calculate_state(action, state : WorldState) : ActionState {
            //TODO: calculates the next state given a action.
            //NOTE: Asuming call by value for state.
            var astate = new ActionState("state"); 
            switch(action){
                case 'LEFT':
                    state.arm = ( state.arm - 1 );
                    //astate.action = "l"
                    astate.id = "l"
                    astate.world = state; 
                    return astate;
                case 'RIGHT':
                    state.arm = ( state.arm - 1 );
                    //astate.action = "r"
                    astate.id = "l"
                    astate.world = state;
                    return astate; 
                case 'GRAB':
                    var stack = state.stacks[state.arm];
                    var height = (stack.length);
                    state.holding = stack.pop(); //Alt stack[height-1]
                    state.stacks[state.arm] = stack;
                    //astate.action = "p";
                    astate.id = "p";
                    astate.world = state;
                    return astate;
                case 'DROP':
                    var stack = state.stacks[state.arm];
                    stack.push(state.holding)
                    state.holding = null;
                    //astate.action = "d";
                    astate.id = "d";
                    astate.world = state;
                    return astate;
                default :
                    //Alternative: returns allways false
                    throw new Error("not yet implemented");
            }
        }

        function state_hier(){
            //TODO: Hieristics
            return 1; 
        }

        function get_state_dist(){
            //TODO: Calculates the distance between two states, see astarTest.
            return 1; 
        }

        var path = Astar.Astar(start,start,{
            heuristic_approx: state_hier,
            dist_between: get_state_dist,
            get_children: dynamic_children,
            is_goalNode: is_goalstate
          });
        
        //TODO: exctract the plan from the path.
        //ex. plan = ["label1","r","r","l","l"] 
        // for (var p in path){
        //     plan.push("id");
        //     alert((path[p]).id);
        // }
        console.log(path)
        //return plan;
        return ["label1","r","label2","r","label3","r","label4","l"];
    }
}
