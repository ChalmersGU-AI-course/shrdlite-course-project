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
        var MAX_STATES = 10000;

        //TODO: Make an appropriate type/struct for action/actions.
        var actions : string[]  = ['RIGHT','GRAB','LEFT','DROP']; 
        
        /*
        These PDDL Interpretation function could be lifted out to a separate module,
        but they are not since they take an ActionState as an argument and since they
        are only to be used inside of  'planInterpretation'.
        */
        var pddl = {
            ontop: function(a:ActionState, args:string[]) : boolean{
                var position;
                try{
                    position = find_obj([args[0]],a.stacks);
                }catch(err){
                    return false 
                }
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
                return (pddl["ontop"](a,args)) &&
                       (state.objects[args[1]].form == "box");
            }
            //TODO: beside, under, leftof, rightof, ontop
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
        start.holding = state.holding;
        start.stacks = state.stacks.slice();
        
        function dynamic_children(astate : ActionState){
            var states : ActionState[] = []; 
             actions.forEach((action) => { 
                if(works(action,astate) ){ //TODO: set ids etc  
                    var s = calculate_state(action,astate);
                    states.push(s);
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
                    return (canPickUp(astate))
                }else if (action == 'DROP'){
                    return (canDrop(astate));
                } else {
                    //Alternative: returns always false
                    throw new Error("unsupported action");
                }
        }
        
        function canPickUp(astate : ActionState) : boolean  {
            var armEmpty = astate.holding == null;
            var somethingToPickUp = astate.stacks[astate.arm].length != 0;
            return armEmpty && somethingToPickUp;
        }
        
        function canDrop(astate : ActionState) : boolean {
            var heldObject = astate.holding;
            if (heldObject == null) {
              return false;
            }
            var stack = astate.stacks[astate.arm];
            if (stack.length == 0) {
              return true;
            }
            var topObject = stack[stack.length - 1];
            return canRestOn(heldObject,
                              topObject);
        }
        
        function canRestOn(a : string, b : string) : boolean {
            var aForm = state.objects[a].form;
            var aSize = state.objects[a].size;
            var bForm = state.objects[b].form;
            var bSize = state.objects[b].size;
            // Balls cannot support:
            if (bForm == "ball") {
                return false;
            }
            // Balls must be in boxes:
            if (aForm == "ball" && bForm != "box") {
                return false;
            }
            // Small cannot support large:
            if (bSize == "small" && aSize == "large") {
                return false;    
            }
            // Large can always support small:
            if (bSize == "large" && aSize == "small") {
                return true;
            }
            // If we get here, both are same size
            // Boxes cannot support pyramids, planks or boxes of same size:
            if (bForm == "box") {
                return (aForm != "pyramid" && aForm != "plank" && aForm != "box");
            }
            // Small bricks and pyramids cannot support small boxes:
            if (bSize == "small") {
                //i.e. both are small
                if (bForm == "brick" || bForm == "pyramid") {
                    return (aForm != "box");
                }
            }
            // If we get here, both are large
            // Large pyramids cannot support large boxes:
            if (aForm == "box" && bForm == "pyramid") {
                return false;
            }
            return true;
        }
        
        /*
        Given a state and an action, action is applied upon the state, the state is modified,
        it is also given an 'plan action' - l:Left,r:right,d:drop,g:grab - and a corresponding
        message to go with it. 
        */ 
        function calculate_state(action, astate : ActionState) : ActionState {
            //TODO: calculates the next state given a action.
            statenr++;
            if (statenr > MAX_STATES) {
                throw new Error("Search tree too big; no solution found.");
            }
            var newstate = new ActionState(("state" + statenr));
            if (action == 'LEFT'){
                    newstate.arm = ( astate.arm - 1 );
                    newstate.action = "l";
                    newstate.holding = astate.holding
                    newstate.stacks = astate.stacks.slice();
                    newstate.msg = "Moving left"; 
                    return newstate;
            }else if (action == 'RIGHT'){
                    newstate.arm = ( astate.arm + 1 );
                    newstate.action = "r"
                    newstate.holding = astate.holding
                    newstate.stacks = astate.stacks.slice();
                    newstate.msg = "Moving right"; 
                    return newstate; 
            }else if (action == 'GRAB'){
                    newstate.arm = astate.arm;
                    var stack = astate.stacks[astate.arm].slice();
                    var height = (stack.length);
                    var objectToHold = stack[height-1];
                    stack.pop();
                    newstate.holding = objectToHold;//Alt stack[height-1]
                    newstate.stacks = astate.stacks.slice();
                    newstate.stacks[astate.arm] = stack.slice();
                    newstate.action = "p";
                    newstate.msg = ("Picking up the "+ state.objects[objectToHold].form);
                    return newstate;
            }else if (action == 'DROP'){
                    var stack = astate.stacks[astate.arm].slice();
                    var objectToDrop = astate.holding;
                    stack.push(objectToDrop);
                    newstate.holding = null;
                    newstate.stacks = astate.stacks.slice();
                    newstate.stacks[astate.arm] = stack;
                    newstate.arm = astate.arm;
                    newstate.action = "d";
                    newstate.msg = ("Dropping the "+ state.objects[objectToDrop].form) ;
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

        NOTE: That the current heuristics is apperently making it slower!
        That is why it is commented out. Now it is basicly a breath first
        search.
        */
        function state_heur(a1 : ActionState, a2 : ActionState){

            // var nearest_obj = find_obj(["g"],a2.stacks)[0] //g
            // var arm_dist = Math.abs(a1.arm - nearest_obj);
            // console.log("\n");
            // return arm_dist; 
            return 0;
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
}
