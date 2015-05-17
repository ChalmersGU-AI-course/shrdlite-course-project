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
        var statenr = 0;
        console.log(state);

        //TODO: Make an appropriate type/struct for action/actions.
        var actions : string[]  = ['RIGHT','GRAB','LEFT','DROP']; 
        
        /*
        These PDDL Interpretation function could be lift out to a separate module,
        but they are not since they take an ActionState as an argument and since they
        are only to be used inside of  'planInterpretation'.
        */
        var pddl = {
            ontop: function(a:ActionState, args:string[]) : boolean{
                var position = find_obj([args[0]],a.stacks);
                if ((position[1] == 0) && (args[1] == "floor")){
                    return true;
                }else if((a.stacks[position[0]][(position[1] - 1)]) == args[1]){
                    return true;
                }
                return false;
                
            },
            holding: function(a:ActionState, args:string[]) : boolean{
                return (a.holding == args[0]);
            },
            inside: function(a:ActionState, args:string[]) : boolean{
                var position = find_obj([args[0]],a.stacks);
                if(((a.stacks[position[0]][(position[1] - 1)]) == args[1]) &&  
                    state.objects[args[1]].form == "box"){
                    return true;
                }
                return false;   
            }
        }
        
        /*
        Given a PDDL(1) description, this function is supposed to decides if a
        the given state satiesfies the PDDL which hence makes it a so called 
        goal-state. && between colums and || between rows.

        (1) - http://en.wikipedia.org/wiki/Planning_Domain_Definition_Language 
        */      
        function is_goalstate(astate : ActionState){ //Typescript is a shitty thing!!!
            var and : boolean[] = []; 
            for(var i = 0 ; i < intprt.length ; i++){
                var or : boolean =  pddl[(intprt[i][0]).rel](astate,(intprt[i][0]).args)
                for(var ii = 1; ii < intprt[i].length ; ii++){
                    or = or && pddl[(intprt[i][ii]).rel](astate,(intprt[i][ii]).args)
                }
                and.push(or);
            }
            var result : boolean = and[0];
            and.forEach((a)=> { result = result || a });
            return result;
        } 

        var start =  new ActionState("start");
        start.arm = state.arm
        start.stacks = state.stacks.slice();
        start.holding = state.holding;
        
        function dynamic_children(astate : ActionState){
            var states : ActionState[] = []; 
             actions.forEach((action) => { 
                if(works(action,astate) ){ //TODO: set ids etc  
                    states.push(calculate_state(action,astate));
                } 
            });
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
            statenr++;
            var newstate = new ActionState(("state" + statenr));
            if (action == 'LEFT'){
                    newstate.arm = ( astate.arm - 1 );
                    newstate.action = "l"
                    newstate.stacks = astate.stacks.slice();
                    newstate.msg = "Moving left"; 
                    return newstate;
            }else if (action == 'RIGHT'){
                    newstate.arm = ( astate.arm + 1 );
                    newstate.action = "r"
                    newstate.stacks = astate.stacks.slice();
                    newstate.msg = "Moving right"; 
                    return newstate; 
            }else if (action == 'GRAB'){
                    newstate.arm = astate.arm;
                    var stack = astate.stacks[astate.arm].slice();
                    var height = (stack.length);
                    newstate.holding = stack[height-1]; //Alt stack[height-1]
                    newstate.stacks = astate.stacks.slice();
                    newstate.stacks[astate.arm] = stack.slice();
                    newstate.action = "p";
                    newstate.msg = ("Picking up the "); //+ state.objects[astate.holding].form) ;
                    return newstate;
            }else if (action == 'DROP'){
                    var stack = astate.stacks[astate.arm].slice();
                    stack.push(astate.holding)
                    newstate.arm = astate.arm;
                    newstate.holding = null;
                    newstate.action = "d";
                    newstate.msg = ("Dropping the "); //+ state.objects[astate.holding].form) ;
                    newstate.stacks = astate.stacks.slice();
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
        function state_heur(a1 : ActionState, a2 : ActionState){
            var nearest_obj = find_obj(["l"],a2.stacks)[0]
            var arm_dist = Math.abs(a1.arm - nearest_obj);
            return arm_dist; 
        }
        /*
        Calculates the distance between two states, see astarTest.
        In this case, the weight of a step is 1. 
        */
        function get_state_dist(){
            return 1; 
        }
        //Probably unnecessary
        function find_obj(objs : string[], stacks : string[][]) {
            var objects : number[][] = [];
            for (var i = 0 ; i < stacks.length; i++){
                for (var ii = 0 ; ii < stacks[i].length ; ii++){
                    //objects.push([i,ii])
                    if (objs[0] == stacks[i][ii]){
                      return [i,ii]  
                    }
                } 
            }
            throw new Error("no such object");
        }
        /*
        Conversion from path to plan.
        */
        var path = Astar.Astar(start,start,{
            heuristic_approx: state_heur,
            dist_between: get_state_dist,
            get_children: dynamic_children,
            is_goalNode: is_goalstate
          });
        for (var p = 1; p < path.length; p++){
            plan.push((<ActionState>path[p]).msg);
            plan.push((<ActionState>path[p]).action);            
        }
        return plan;
    }


    function pddl_evaluate(){

    }
    



}
