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

    class ActionState extends Astar.Node {
            action: string;
            stacks: string[][];
            holding: string;
            arm: number;
            msg: string;

    }

    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns an empty plan involving no random stack
        var plan : string[] = [];

        //TODO: Make an appropriate type/struct for action/actions.
        var actions : string[]  = ['RIGHT','GRAB','LEFT','DROP']; 
        
        /*
        Given a PDDL(1) description, this function is supposed to decides if a
        the given state satiesfies the PDDL which hence makes it a so called 
        goal-state.

        (1) - http://en.wikipedia.org/wiki/Planning_Domain_Definition_Language 
        */      
        function is_goalstate(astate : ActionState): boolean{
            
            if ((astate.arm == astate.stacks.length-1)){
                return true;
            }else{
                return false;
            }   
        }
        var start =  new ActionState("start");
        start.arm = state.arm
        start.stacks = state.stacks
        start.holding = state.holding;
        console.log(start) 
        
        function dynamic_children(astate : ActionState){
            var states : ActionState[] = []; 
            for (var i in actions){
                if(works(actions[i],astate) ){ //TODO: set ids etc  
                    states.push(calculate_state(actions[i],astate));
                } 
            }
            console.log (states)
            return states;
        }
        /*
        This function validates whether an action can be applied to a state, without
        violating the physical conditions given. 
        TODO: Extend 'Drop', so that it cosiders the shape of the element at the top of the state stack.
        */
        function works( action : string , astate : ActionState) : boolean {
                if (action == 'LEFT'){
                    return (astate.arm > 0) 
                }else if (action == 'RIGHT'){
                    return (astate.arm < state.stacks.length - 1)
                }else if (action == 'GRAB'){
                    return (astate.holding == null)
                }else if (action == 'DROP'){
                    return (astate.holding != null) //&& (state.stacks[state.arm])
                }
                    //Alternative: returns allways false
                    throw new Error("unsupported action");
        }
        /*
        Given a state and an action, action is applied upon the state, the state is modified,
        it is also given an 'plan action' - l:Left,r:right,d:drop,g:grab - and a corresponding
        message to go with it. 
        */ 
        function calculate_state(action, astate : ActionState) : ActionState {
            //TODO: calculates the next state given a action.
            var newstate = new ActionState("state");
            if (action == 'LEFT'){
                    newstate.arm = ( astate.arm - 1 );
                    newstate.action = "l"
                    newstate.stacks = astate.stacks;
                    newstate.msg = "Moving left"; 
                    return newstate;
            }else if (action == 'RIGHT'){
                    newstate.arm = ( astate.arm + 1 );
                    newstate.action = "r"
                    newstate.stacks = astate.stacks;
                    newstate.msg = "Moving right"; 
                    return newstate; 
            }else if (action == 'GRAB'){
                    var stack = astate.stacks[state.arm];
                    var height = (stack.length);
                    newstate.holding = stack.pop(); //Alt stack[height-1]
                    newstate.stacks = astate.stacks;
                    newstate.stacks[astate.arm] = stack;
                    newstate.action = "p";
                    newstate.msg = ("Picking up the ") //+ state.objects[astate.holding].form) ;
                    return newstate;
            }else if (action == 'DROP'){
                    var stack = astate.stacks[astate.arm];
                    stack.push(astate.holding)
                    newstate.holding = null;
                    newstate.action = "d";
                    newstate.msg = ("Dropping the ") //+ state.objects[astate.holding].form) ;
                    return newstate; //&& (state.stacks[state.arm])
            }
                    //Alternative: returns always false
                    throw new Error("not yet implemented");
        }
        /*
        NOTE: This function is to be viewed as the first version, it has
        known flaws, so feel free to change the it - if you can come up
        with something better.
        
        The function considers two factors when aproximating/undestimating
        the number of steps needed to reach a goal-state, namely :
        * The distance from the arm the nearest misplaced object.
        * The number of missplaced objects and the distance between them. 
        using this two parameter one
        */
        function state_heur(){
            //misplaced arm
            //misplaced objects

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
        
        for (var p = 1; p < path.length; p++){
            plan.push((<ActionState>path[p]).msg);
            plan.push((<ActionState>path[p]).action);            
        }
        return plan;
        //return ["label1","r","label2","r","label3","r","label4","l"];
    }
}
