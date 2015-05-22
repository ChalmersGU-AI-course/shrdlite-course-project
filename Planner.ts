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
            action: Action;
            stacks: string[][];
            holding: string;
            arm: number;
            msg: string;
    }
    
    interface Action {
            command : string;
    }

    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns an empty plan involving no random stack
        var plan : string[] = [];
        var statenr = 0;
        var MAX_STATES = 10000;

        var left : Action = {command : "l"};
        var right : Action = {command : "r"};
        var drop : Action = {command : "d"};
        var pick : Action = {command : "p"};
                
        var actions : Action[]  = [left, right, pick, drop]; 
        
        /*
        These PDDL Interpretation function could be lifted out to a separate module,
        but they are not since they take an ActionState as an argument and since they
        are only to be used inside of  'planInterpretation'.
        */
        var pddl = {
            ontop: function(a:ActionState, args:string[]) : boolean{
                var position;
                try{
                    position = find_obj(args[0],a.stacks);
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
        Given a PDDL(1) description, this function is supposed to decide if a
        the given state satisfies the PDDL, making it a so called 
        goal-state. && between colums and || between rows.

        (1) - http://en.wikipedia.org/wiki/Planning_Domain_Definition_Language 
        */      
        function is_goalstate(astate : ActionState){
            var or : boolean[] = []; 
            for(var i = 0 ; i < intprt.length ; i++){
                var and : boolean =  pddl[(intprt[i][0]).rel](astate,(intprt[i][0]).args)
                for(var ii = 1; ii < intprt[i].length ; ii++){
                    and = and && pddl[(intprt[i][ii]).rel](astate,(intprt[i][ii]).args)
                }
                or.push(and);
            }
            var result : boolean = or[0];
            or.forEach((a)=> { result = result || a });
            return result;
        } 

        var start =  new ActionState("start");
        start.arm = state.arm
        start.holding = state.holding;
        start.stacks = state.stacks.slice();
        
        function dynamic_children(astate : ActionState){
            var states : ActionState[] = []; 
             actions.forEach((action) => { 
                if(works(action,astate) ){
                    var s = calculate_state(action,astate);
                    states.push(s);
                }
            });
            return states;
        }
        
        /*
        This function validates whether an action can be applied to a state, without
        violating the physical conditions given. 
        */
        function works(action : Action , astate : ActionState) : boolean {
                if (isOpposite(action, astate.action)) {
                    return false;
                }
                if (action == left){
                    return (astate.arm > 0) 
                }else if (action == right){
                    return (astate.arm < state.stacks.length - 1)
                }else if (action == pick){
                    return (canPickUp(astate))
                }else if (action == drop){
                    return (canDrop(astate));
                } else {
                    //Alternative: returns always false
                    throw new Error("unsupported action");
                }
        }
        
        function isOpposite(a1 : Action, a2 : Action) {
            if (a1 == a2) {
                return false;
            } else if (a1 == left) {
                return (a2 == right)
            } else if (a1 == right) {
                return (a2 == left)
            } else if (a1 == drop) {
                return (a2 == pick)
            } else if (a1 == pick) {
                return (a2 == drop)
            }
            return false;
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
        it is also given an 'plan action' - l:Left,r:right,d:drop,p:pick - and a corresponding
        message to go with it. 
        */ 
        function calculate_state(action : Action, astate : ActionState) : ActionState {
            //TODO: calculates the next state given a action.
            statenr++;
            if (statenr > MAX_STATES) {
                throw new Error("Search tree too big; no solution found.");
            }
            var newstate = new ActionState(("state" + statenr));
            newstate.action = action;
            if (action == left){
                    newstate.arm = ( astate.arm - 1 );
                    newstate.holding = astate.holding
                    newstate.stacks = astate.stacks.slice();
                    newstate.msg = "Moving left"; 
                    return newstate;
            }else if (action == right){
                    newstate.arm = ( astate.arm + 1 );
                    newstate.holding = astate.holding
                    newstate.stacks = astate.stacks.slice();
                    newstate.msg = "Moving right"; 
                    return newstate; 
            }else if (action == pick){
                    newstate.arm = astate.arm;
                    var stack = astate.stacks[astate.arm].slice();
                    var height = (stack.length);
                    var objectToHold = stack[height-1];
                    stack.pop();
                    newstate.holding = objectToHold;//Alt stack[height-1]
                    newstate.stacks = astate.stacks.slice();
                    newstate.stacks[astate.arm] = stack.slice();
                    newstate.msg = ("Picking up the "+ state.objects[objectToHold].form);
                    return newstate;
            }else if (action == drop){
                    var stack = astate.stacks[astate.arm].slice();
                    var objectToDrop = astate.holding;
                    stack.push(objectToDrop);
                    newstate.holding = null;
                    newstate.stacks = astate.stacks.slice();
                    newstate.stacks[astate.arm] = stack;
                    newstate.arm = astate.arm;
                    newstate.msg = ("Dropping the "+ state.objects[objectToDrop].form) ;
                    return newstate; //&& (state.stacks[state.arm])
            }
                    //Alternative: returns always false
                    throw new Error("not yet implemented");
        }
        
        /*
        The simplest possible one is "return 0", which turns Astar
        into breadth-first search.
        */
        function state_heur(a1 : ActionState) : number {
            /*var or : number = MAX_STATES; 
            for(var i = 0 ; i < intprt.length ; i++){
                var and : number =  heuristic[(intprt[i][0]).rel](a1,(intprt[i][0]).args)
                for(var ii = 1; ii < intprt[i].length ; ii++){
                    and = and + heuristic[(intprt[i][ii]).rel](a1,(intprt[i][ii]).args)
                }
                or = Math.min(or, and);
            }
            return or;*/
            return 0;
        } 
        
        /*var heuristic = {
            ontop : function(a:ActionState, args:string[]) : number{
                var top = args[0];
                var bottom = args[1];
                var botPosX = find_obj(bottom, a.stacks)[0];
                var topPosX = find_obj(top, a.stacks)[0];
                var toFreeTop = heurFree(a,top);
                var toFreeBottom = heurFree(a,bottom)
                if (toFreeTop == 0) {
                    return heurMoveToPOI(a,[topPosX]) + toFreeBottom +
                           heurMove(a,top,botPosX);
                } else if (toFreeBottom == 0) {
                    return heurMoveToPOI(a,[botPosX]) + toFreeTop +
                           heurMove(a,top,botPosX);
                } else {
                    return heurMoveToFreeBoth(a,[topPosX, botPosX]) +
                           toFreeTop + toFreeBottom + heurMove(a,top,botPosX);
                }
            }
        }*/
        
        // The approximate cost of moving the arm to a Place Of Interest
        // (while also dropping whatever it's holding from before)
        function heurMoveToPOI(a:ActionState, positions:number[]) : number {
            var dists : number[] = [];
            positions.forEach((pos) => {
                dists.push(Math.abs(a.arm - pos));
            });
            return Math.min.apply(null,dists);
        }

/*        function heurMoveToFreeBoth(a:ActionState, positions:number[]) : number {
            var dists : number[] = [];
            positions.forEach((pos) => {
                dists.push(Math.abs(a.arm - pos));
            });
            return Math.min.apply(null,dists);
        }
        
        function heurMove(a:ActionState, obj:string, posX:number) : number {
            var objPos : number;
            var pickUpCost : number;
            if (a.holding == obj) {
                objPos = a.arm;
                pickUpCost = 0;
            } else {
                
            }
        }*/
        
        /*
        function isFree(a:ActionState, obj:string) : boolean {
            return heurFree(a,obj) == 0;
        }*/
        
        function heurFree(a:ActionState, obj:string) : number {
            if (a.holding == obj) {
                return 0;
            } else {
                // Don't catch the error - if the object doesn't exist, we're
                // working toward an impossible goal anyway
                var position = find_obj(obj,a.stacks);
                var heightOfObj = position[1];
                var heightOfStack = a.stacks[position[0]].length;
                return ((heightOfStack - 1) - heightOfObj) * 4;
                // 4 is the minimum number of moves needed per object to be removed
            }
        }
        
        /*
        Calculates the distance between two states, see astarTest.
        In this case, the weight of a step is 1. 
        */
        function get_state_dist() : number {
            return 1; 
        }
        
        //Probably unnecessary
        function find_obj(obj : string, stacks : string[][]) : number[] {
            for (var i = 0 ; i < stacks.length; i++){
                for (var ii = 0 ; ii < stacks[i].length ; ii++){
                    if (obj == stacks[i][ii]){
                      return [i,ii]  
                    }
                } 
            }
            throw new Error("no such object");
        }
        
        /*
        Conversion from path to plan.
        */
        var path = Astar.Astar(start,{
            heuristic_approx: state_heur,
            dist_between: get_state_dist,
            get_children: dynamic_children,
            is_goalNode: is_goalstate
          });
        for (var p = 1; p < path.length; p++){
            plan.push((<ActionState>path[p]).msg);
            plan.push((<ActionState>path[p]).action.command);            
        }
        return plan;
    }
}
