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

    function planInterpretation(topGoal : Interpreter.Goal, state : WorldState) : string[] {
        // This function returns an empty plan involving no random stack
        var plan : string[] = [];
        var statenr = 0;
        var MAX_STATES = 20000;

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
                if (a.holding == args[0] || a.holding == args[1]) {
                    return false;
                }
                var position = find_obj(args[0],a.stacks);
                if ((position[1] == 0) && (args[1] == "floor")){
                    return true;
                } else {
                    return ((a.stacks[position[0]][(position[1] - 1)]) == args[1])
                }
            },
            holding: function(a:ActionState, args:string[]) : boolean{
                return (a.holding == args[0]);
            },
            inside: function(a:ActionState, args:string[]) : boolean{
                return (pddl["ontop"](a,args)) &&
                       (state.objects[args[1]].form == "box");
            },
            leftof: function(a:ActionState, args:string[]) : boolean{
                if (a.holding == args[0] || a.holding == args[1]) {
                    return false;
                }
                var posX1 = find_obj(args[0], a.stacks)[0];
                var posX2 = find_obj(args[1], a.stacks)[0];
                return (posX1 < posX2);
            }, 
            rightof : function(a:ActionState, args:string[]) : boolean {
                return pddl["leftof"](a, [args[1], args[0]]);
            },
            above : function(a:ActionState, args:string[]) : boolean {
                if (a.holding == args[0] || a.holding == args[1]) {
                    return false;
                }
                if (args[1] == "floor") {
                    return true;
                }
                var pos1 = find_obj(args[0], a.stacks);
                var pos2 = find_obj(args[1], a.stacks);
                return (pos1[0] == pos2[0] && pos1[1] > pos2[1]);
            },
            under : function(a:ActionState, args:string[]) : boolean {
                return pddl["above"](a, [args[1], args[0]]);
            },
            beside : function(a:ActionState, args:string[]) : boolean {
                if (a.holding == args[0] || a.holding == args[1]) {
                    return false;
                }
                var posX1 = find_obj(args[0],a.stacks)[0];
                var posX2 = find_obj(args[1],a.stacks)[0];
                return (Math.abs(posX1 - posX2) == 1);
            }
        }
        
        /*
        Given a PDDL(1) description, this function is supposed to decide if a
        the given state satisfies the PDDL, making it a so called 
        goal-state. && between colums and || between rows.

        (1) - http://en.wikipedia.org/wiki/Planning_Domain_Definition_Language 
        */      
        function is_goalstate(astate : ActionState){
            return is_fulfilled(astate, topGoal);
        }
        
        function is_fulfilled(astate : ActionState, goal : Interpreter.Goal) : boolean {
            var lit : Interpreter.Literal = goal.goal;
            if (lit != null) {
                var condition = pddl[lit.rel](astate, lit.args);
                return  lit.pol ? condition : !condition;
            } else {
                var result : boolean;
                if (goal.isAnd) {
                    result = true;
                    goal.list.forEach((subGoal) => {
                        result = result && is_fulfilled(astate, subGoal);
                    });
                } else {
                    result = false;
                    goal.list.forEach((subGoal) => {
                        result = result || is_fulfilled(astate, subGoal);
                    });                
                }
                return result;
            }
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
            var costTuple : number[] = goal_heur(a1, topGoal);
            return costTuple[0] + costTuple[1];
        }
        
        function goal_heur(a1 : ActionState, goal : Interpreter.Goal) : number[] {
            var lit : Interpreter.Literal = goal.goal;
            if (lit != null) {
                return pddl[lit.rel](a1, lit.args) ? [0,0] : heuristic[lit.rel](a1, lit.args);
            } else {
                var newVal : number[];
                var result : number[];
                if (goal.isAnd) {
                    result = [0,0];
                    goal.list.forEach((subGoal) => {
                        newVal = goal_heur(a1, subGoal);
                        result[0] = Math.min(result[0], newVal[0]);
                        result[1] = result[1] + newVal[1];
                    });
                } else {
                    result = [MAX_STATES, MAX_STATES];
                    goal.list.forEach((subGoal) => {
                        newVal = goal_heur(a1, subGoal);
                        if (result[0]+result[1] > newVal[0]+newVal[1]) {
                            result = newVal;
                        }
                    });                
                }
                return result;
            }
        }
        
        var heuristic = {
            ontop : function(a:ActionState, args:string[]) : number[] {
                var top = args[0];
                var topPosX : number =
                    a.holding == top ? a.arm : find_obj(top, a.stacks)[0];
                var toFreeTop = heurFree(a,top);
                var bottom = args[1];
                var botPosX : number;
                var toFreeBottom : number;
                if (bottom == "floor") {
                    botPosX = findBestFloorSpot(a, topPosX);
                    toFreeBottom = heurFreeFloor(a, botPosX);
                } else {
                    botPosX = a.holding == bottom ? a.arm : find_obj(bottom, a.stacks)[0];
                    toFreeBottom = heurFree(a, bottom);
                }
                if (toFreeTop == 0) {
                    return [heurMoveArmToPOI(a,[topPosX]),
                            toFreeBottom + heurMoveObject(a,top,botPosX)];
                } else if (toFreeBottom == 0) {
                    return [heurMoveArmToPOI(a,[botPosX]),
                            toFreeTop + heurMoveObject(a,top,botPosX)];
                } else if (botPosX == topPosX) {
                    // In the case of the objects being in the same stack, then 
                    // adding the free heuristcs wont allways provide an underestimate
                    return [heurMoveArmToPOI(a,[topPosX]),Math.max(toFreeTop,toFreeBottom)];
                } else {
                    return [heurMoveArmToFreeBoth(a, topPosX, botPosX),
                            toFreeTop + toFreeBottom + heurMoveObject(a,top,botPosX)];
                }
            },
            inside : function(a:ActionState, args:string[]) : number[] {
                return heuristic["ontop"](a,args);
            },
            holding : function(a:ActionState, args:string[]) : number[] {
                var top = args[0];
                var toFreeTop;
                //if its allready holding obj a then the heuristics should equal 0,0
                if (a.holding  == top) { return [0,0] }; 
                var topPosX = find_obj(top, a.stacks)[0];
                // if im on top of the stack then 
                var ontopOfStack = (heurMoveArmToPOI(a,[topPosX]) == 0);
                // if its holding anything other than a, then it will have to put it down.
                var toPick =  1 ; 
                toFreeTop = heurFree(a,top) + toPick;
                return [heurMoveArmToPOI(a,[topPosX]),toFreeTop] 
            },
            above : function(a:ActionState, args:string[]) : number[] {
                var top = args[0];
                var bottom = args[1];
                if (bottom == "floor") {
                    return [0, a.holding == top ? 1 : 0];
                }
                var holdingCost = a.holding == bottom ? 1 : 0;
                var topPosX : number =
                    a.holding == top ? a.arm : find_obj(top, a.stacks)[0];
                var bottomPosX : number =
                    a.holding == bottom ? a.arm : find_obj(bottom, a.stacks)[0];

                var toFreeTop = heurFree(a,top);
                
                return [heurMoveArmToPOI(a,[topPosX]),
                        toFreeTop + heurMoveObject(a, top, bottomPosX) + holdingCost];
            },
            under : function(a:ActionState, args:string[]) : number[] {
                return heuristic["above"](a, [args[1], args[0]]);
            },
            rightof : function(a:ActionState, args:string[]) : number[] {
                var currentLeft = args[0];
                var currentRight = args[1];
                var cLeftPosX : number =
                    a.holding == currentLeft ? a.arm : find_obj(currentLeft, a.stacks)[0];
                var cRightPosX : number =
                    a.holding == currentRight ? a.arm : find_obj(currentRight, a.stacks)[0];
                var toFreeCLeft = heurFree(a,currentLeft);
                var toFreeCRight = heurFree(a,currentRight);
                if (cLeftPosX == 0) {
                    if (cRightPosX == a.stacks.length) {
                        return [heurMoveArmToPOI(a, [cLeftPosX, cRightPosX]),
                                toFreeCLeft + toFreeCRight + a.stacks.length];
                    } else {
                        return [heurMoveArmToPOI(a, [cLeftPosX]),
                                toFreeCLeft + heurMoveObject(a,currentLeft,cRightPosX+1)];
                    }
                } else if (cRightPosX == a.stacks.length || toFreeCRight < toFreeCLeft) {
                    return [heurMoveArmToPOI(a, [cRightPosX]),
                            toFreeCRight + heurMoveObject(a,currentRight,cLeftPosX-1)];
                } else {
                    return [heurMoveArmToPOI(a, [cLeftPosX]),
                            toFreeCLeft + heurMoveObject(a,currentLeft,cRightPosX+1)];
                }

            },         
            leftof : function(a:ActionState, args:string[]) : number[] {
                return heuristic["rightof"](a, [args[1], args[0]]);
            },
            beside : function(a:ActionState, args:string[]) : number[] {
                var fst = args[0];
                var snd = args[1];
                var fstPosX : number =
                    a.holding == fst ? a.arm : find_obj(fst, a.stacks)[0];
                var sndPosX : number =
                    a.holding == snd ? a.arm : find_obj(snd, a.stacks)[0];
                var toFreeFst = heurFree(a,fst);
                var toFreeSnd = heurFree(a,snd);
                if (toFreeFst < toFreeSnd) {
                    return [heurMoveArmToPOI(a, [fstPosX]),
                            toFreeFst + 
                            Math.min(heurMoveObject(a, fst, sndPosX - 1),
                                    heurMoveObject(a, fst, sndPosX + 1))];
                } else {
                    return [heurMoveArmToPOI(a, [sndPosX]),
                            toFreeSnd +
                            Math.min(heurMoveObject(a, snd, fstPosX - 1),
                                    heurMoveObject(a, snd, fstPosX + 1))];
                }
            }
        }
        
        // The approximate cost of moving the arm to a Place Of Interest
        // (while also dropping whatever it's holding from before)
        function heurMoveArmToPOI(a:ActionState, positions:number[]) : number {
            var dists : number[] = [];
            positions.forEach((pos) => {
                dists.push(Math.abs(a.arm - pos));
            });
            return Math.min.apply(null,dists);
        }

        // The approximate cost of the arm movements needed to free two objects,
        // excluding the actual freeing (i.e. moving the arm to and between the places
        // to free)
        function heurMoveArmToFreeBoth(a:ActionState, pos1:number, pos2:number) : number {
            var armPos = a.arm;
            var moveTo = Math.min(Math.abs(armPos - pos1), Math.abs(armPos - pos2));
            var moveBetween = Math.abs(pos1 - pos2) - 1;
            return moveTo + moveBetween;
        }
        
        function heurMoveObject(a:ActionState, obj:string, posX:number) : number {
            var objPos : number;
            var pickUpCost : number;
            if (a.holding == obj) {
                objPos = a.arm;
                pickUpCost = 0;
            } else {
                objPos = find_obj(obj, a.stacks)[0];
                pickUpCost = 1;
            }
            var moveDist = Math.abs(objPos - posX);
            return moveDist + pickUpCost;
        }
        
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
        
        function heurFreeFloor(a:ActionState, posX:number) : number {
                var heightOfStack = a.stacks[posX].length;
                return heightOfStack * 4;
        }
        
        function findBestFloorSpot(a:ActionState, posX:number) : number {
                var spots : number[] = [];
                var stack;
                for (var i = 0; i < a.stacks.length; i++) {
                    stack = a.stacks[i];
                    spots.push(stack.length * 4 + Math.abs(i - posX));
                }
                return min_index(spots);
        }
        
        function min_index(elements) {
            var i = 1;
            var mi = 0;
            while (i < elements.length) {
                if (elements[i] < elements[mi]) {
                    mi = i;
                }
                i += 1;
            }
            return mi;
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
        try {
            var path = Astar.Astar(start,{
                heuristic_approx: state_heur,
                dist_between: get_state_dist,
                get_children: dynamic_children,
                is_goalNode: is_goalstate
              });
        } catch (err) {
            //throw new Error("Impossible problem.");
            throw err;
        }
        for (var p = 1; p < path.length; p++){
            plan.push((<ActionState>path[p]).msg);
            plan.push((<ActionState>path[p]).action.command);            
        }
        return plan;
    }
}
