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
    // Private classes and interfaces

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

    /*
    * Main function, which has all sub-function it needs inside.
    * "topGoal" and "state" effectively serve as a global variables in all of
    * those functions.
    */
    function planInterpretation(topGoal : Interpreter.Goal, state : WorldState)
             : string[] {
             
        var statenr = 0;
        var MAX_STATES = 10000;

        var left : Action = {command : "l"};
        var right : Action = {command : "r"};
        var drop : Action = {command : "d"};
        var pick : Action = {command : "p"};
                
        var actions : Action[]  = [left, right, pick, drop]; 
        
        
        
        /******
        * Section: is_goalstate
        * This function is passed to Astar, to use it to identify a node where
        * the goal is fulfilled. Our version of Astar does not even need to
        * have an instance of a goal node, it can "search blind". Impossible
        * problems would be searched forever were it not for our time-out
        * mechanism.
        */
        

        // This function only adds "topGoal" to the call, which means that the
        // Astar module (which calls this function) does not need to know about
        // the Interpreter.Goal class, preserving its generality.
        function is_goalstate(astate : ActionState){
            return is_fulfilled(astate, topGoal);
        }
        
        
        function is_fulfilled(astate : ActionState, goal : Interpreter.Goal) : boolean {        
            var lit : Interpreter.Literal = goal.lit;
            if (lit != null) {
                // The goal is a Literal
                var condition = pddl[lit.rel](astate, lit.args);
                return  lit.pol ? condition : !condition;
            } else {
                // The goal is a combination of subGoals; connected with
                // either AND or OR
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
        
        /*
        These PDDL Interpretation function could be lifted out to a separate module,
        but they are not since they take an ActionState as an argument and since they
        are only used inside of  'planInterpretation'.
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

        
        /******
        * Section: dynamic_children
        * This function is passed to Astar, to use it to generate the search
        * tree ahead of the search frontier. We perform a one-step loop check:
        * each node represents a state with a memory of the previous action,
        * and the immediate reversal of that action is not considered a valid
        * neighbouring state.
        */
        
        // Similar to how is_goalnode adds "state" to the function call, this
        // function references "actions" so that Astar does not need to know
        // about them specifically; only neighbouring states.
        function dynamic_children(astate : ActionState){
            var states : ActionState[] = []; 
             actions.forEach((action) => { 
                if(validNeighbour(action,astate) ){
                    var s = calculate_state(action,astate);
                    states.push(s);
                }
            });
            return states;
        }
        
        /*
        Given a state and an action, action is applied upon the state, the state is modified,
        it is also given an 'plan action' - l:Left,r:right,d:drop,p:pick - and a corresponding
        message to go with it. 
        */ 
        function calculate_state(action : Action, astate : ActionState) : ActionState {
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
                    newstate.holding = objectToHold;
                    newstate.stacks = astate.stacks.slice();
                    newstate.stacks[astate.arm] = stack.slice();
                    newstate.msg = ("Taking the "+ getUniqueDescription(objectToHold));
                    return newstate;
            }else if (action == drop){
                    var stack = astate.stacks[astate.arm].slice();
                    var objectToDrop = astate.holding;
                    stack.push(objectToDrop);
                    newstate.holding = null;
                    newstate.stacks = astate.stacks.slice();
                    newstate.stacks[astate.arm] = stack;
                    newstate.arm = astate.arm;
                    newstate.msg = ("Dropping "+ getUniqueDescription(objectToDrop));
                    return newstate; 
            }
                    //Alternative: returns always false
                    throw new Error("not yet implemented");
        }
        
        /*
        This function validates whether an action can be applied to a state,
        without violating the physical conditions given. It also checks for
        immediate reversals (i.e. actions opposite to the action that lead
        to this state).
        */
        function validNeighbour(action : Action , astate : ActionState) : boolean {
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
        
        
        function getUniqueDescription(index : string) {
            var objectDef = state.objects[index];
            var formCount : number = 0;
            var formAndColorCount  : number = 0;
            var formAndSizeCount  : number = 0;
            var duplicateCount  : number = 0;
            // A function for counting each object in the world, to find uniqueness
            function increaseCounts(ind : string) {
                var def = state.objects[ind];
                if (def.form == objectDef.form) {
                    formCount++;
                    if (def.size == objectDef.size) {
                        formAndSizeCount++;
                    }
                    if (def.color == objectDef.color) {
                        formAndColorCount++;
                    }
                }
                if (ind == index) {
                    duplicateCount++;
                }
            }
            // Count all objects in stacks
            state.stacks.forEach((stack) => {
                stack.forEach((ind) => {
                    increaseCounts(ind);
                });
            });
            // Count the held object
            if (state.holding != null) {
                increaseCounts(state.holding);
            }
            if (duplicateCount > 1) {
                return "a "+objectDef.size+" "+objectDef.color+" "+objectDef.form;
            } else if (formCount == 1) {
                return "the "+objectDef.form;
            } else if (formAndColorCount == 1) {
                return "the "+objectDef.color+" "+objectDef.form;
            } else if (formAndSizeCount == 1) {
                return "the "+objectDef.size+" "+objectDef.form;
            } else {
                return "the "+objectDef.size+" "+objectDef.color+" "+objectDef.form;
            }
        }
        
        
        
        /******
        * Section: state_heur
        * This function is passed to Astar, to use it to estimate the distance
        * from a given node to a goal node. For more info on the heuristc, see
        * README.txt.
        */

        // Similar to is_goalstate and dynamic_children, this function's chief
        // purpose is to add topGoal to the call.
        function state_heur(a1 : ActionState) : number {
            var costTuple : number[] = goal_heur(a1, topGoal);
            return costTuple[0] + costTuple[1];
        }
        
        /*
        The reason for using a number[], and thus splitting the heuristic value
        in two, is to separate the contribution to the estimated cost from
        moving the arm to the right place, and the constribution from
        performing a task. The final heuristic for a single task is simply
        their sum, but for a series of conjunctive (AND) goals, counting the
        "move into place" constribution for every task can lead to
        overestimating the total cost.
        A simple example is where several
        objects in a stack are to be placed on the floor, and the arm is far
        from that stack. Summing both contributions would count the distance
        from the arm to the stack multiple times.
        */
        function goal_heur(a1 : ActionState, goal : Interpreter.Goal) : number[] {
            var lit : Interpreter.Literal = goal.lit;
            if (lit != null) {
                // The goal is a Literal. cf is_fulfilled.
                return pddl[lit.rel](a1, lit.args) ?
                       [0,0] :
                       heuristic[lit.rel](a1, lit.args);
            } else {
                var newVal : number[];
                var result : number[];
                if (goal.isAnd) {
                    // We have a conjunctive list of subgoals; we compute the
                    // heuristic for each and sum them (though see above)
                    result = [0,0];
                    goal.list.forEach((subGoal) => {
                        newVal = goal_heur(a1, subGoal);
                        result[0] = Math.min(result[0], newVal[0]);
                        result[1] = result[1] + newVal[1];
                    });
                } else {
                    // Disjunctive (OR) list of subgoals; compute all of them
                    // and return the minimum
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
                    botPosX = a.holding == bottom ?
                              a.arm : find_obj(bottom, a.stacks)[0];
                    toFreeBottom = heurFree(a, bottom);
                }
                if (toFreeTop == 0) {
                    return [heurMoveArmToPOI(a,[topPosX]),
                            toFreeBottom + heurMoveObject(a,top,botPosX)];
                } else if (toFreeBottom == 0) {
                    return [heurMoveArmToPOI(a,[botPosX]),
                            toFreeTop + heurMoveObject(a,top,botPosX)];
                } else if (botPosX == topPosX) {
                    // In the case of the objects being in the same stack,
                    // then adding both toFree heuristics might overestimate
                    // the true distance
                    return [heurMoveArmToPOI(a,[topPosX]),
                            Math.max(toFreeTop,toFreeBottom)];
                } else {
                    return [heurMoveArmToFreeBoth(a, topPosX, botPosX),
                            toFreeTop + toFreeBottom +
                                heurMoveObject(a,top,botPosX)];
                }
            },
            inside : function(a:ActionState, args:string[]) : number[] {
                // If the second argument is not a box, this is impossible;
                // but the goal-checking already takes care of that
                return heuristic["ontop"](a,args);
            },
            holding : function(a:ActionState, args:string[]) : number[] {
                var top = args[0];
                var toFreeTop;
                var topPosX = find_obj(top, a.stacks)[0];
                // if its holding anything other than a, then it will have to put it down.
                var toPick =  1 ; 
                toFreeTop = heurFree(a,top);
                return [heurMoveArmToPOI(a,[topPosX]),toFreeTop+toPick] 
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
                        toFreeTop + heurMoveObject(a, top, bottomPosX) +
                            holdingCost];
            },
            under : function(a:ActionState, args:string[]) : number[] {
                // Functionally identical to calling "above" with the arguments
                // in opposite order
                return heuristic["above"](a, [args[1], args[0]]);
            },
            rightof : function(a:ActionState, args:string[]) : number[] {
                var currentLeft = args[0];
                var currentRight = args[1];
                var cLeftPosX : number =
                    a.holding == currentLeft ?
                        a.arm : find_obj(currentLeft, a.stacks)[0];
                var cRightPosX : number =
                    a.holding == currentRight ?
                        a.arm : find_obj(currentRight, a.stacks)[0];
                var toFreeCLeft = heurFree(a,currentLeft);
                var toFreeCRight = heurFree(a,currentRight);
                if (cLeftPosX == 0) {
                    if (cRightPosX == a.stacks.length) {
                        return [heurMoveArmToPOI(a, [cLeftPosX, cRightPosX]),
                                toFreeCLeft + toFreeCRight + a.stacks.length];
                    } else {
                        return [heurMoveArmToPOI(a, [cLeftPosX]),
                                toFreeCLeft +
                                heurMoveObject(a,currentLeft,cRightPosX+1)];
                    }
                } else if (cRightPosX == a.stacks.length ||
                           toFreeCRight < toFreeCLeft) {
                    return [heurMoveArmToPOI(a, [cRightPosX]),
                            toFreeCRight +
                                heurMoveObject(a,currentRight,cLeftPosX-1)];
                } else {
                    return [heurMoveArmToPOI(a, [cLeftPosX]),
                            toFreeCLeft +
                                heurMoveObject(a,currentLeft,cRightPosX+1)];
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
        // (while dropping whatever it's already holding)
        function heurMoveArmToPOI(a:ActionState, positions:number[]) : number {
            var holdingPenalty : number = a.holding == null ? 0 : 1;
            var dists : number[] = [];
            positions.forEach((pos) => {
                dists.push(Math.abs(a.arm - pos));
            });
            return Math.min.apply(null,dists);
        }

        // The approx. cost of the arm movements needed to free two objects,
        // excluding the actual freeing (i.e. moving the arm to and between the places
        // to free)
        function heurMoveArmToFreeBoth(a:ActionState, pos1:number, pos2:number) : number {
            var armPos = a.arm;
            var moveTo = heurMoveArmToPOI(a, [pos1, pos2]);
            var moveBetween = Math.abs(pos1 - pos2) - 1;
            return moveTo + moveBetween;
        }
        
        // The approx. cost of moving an object to a position
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
        
        // The approx. cost to free an object (i.e. remove all objects above it)
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
        
        // Returns the spot which is cheapest (in the best case) to put
        // something on, if that something is currently at posX. Both distance
        // to the spot, and the number of objects currently occupying it,
        // contribute.
        function findBestFloorSpot(a:ActionState, posX:number) : number {
                var spots : number[] = [];
                var stack;
                for (var i = 0; i < a.stacks.length; i++) {
                    stack = a.stacks[i];
                    spots.push(heurFreeFloor(a, i) + Math.abs(i - posX));
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
        In this case, the weight of a step is 1. All the work in the heuristic
        goes toward approximating how many of these steps are left before the
        goal is reached.
        */
        function get_state_dist() : number {
            return 1; 
        }
        
        
        
        /*
        * General helper; used by several other functions.
        */
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
        
        
        
        //////
        // Here the "main" part of planInterpretation starts:
        
        var plan : string[] = [];
        var start =  new ActionState("start");
        start.arm = state.arm
        start.holding = state.holding;
        start.stacks = state.stacks.slice();
        
        try {
            // Perform Astar search, using several of the previously defined
            // functions as parameters
            var path = Astar.Astar(start,{
                heuristic_approx: state_heur,
                dist_between: get_state_dist,
                get_children: dynamic_children,
                is_goalNode: is_goalstate
              });
        } catch (err) {
            if (err instanceof Planner.Error) {
                throw err;
            } else {
                throw new Error("Impossible problem.");
            }
        }
        
        // Next step: convert the path in the search tree (i.e. a series of
        // ActionStates) into a plan (to be used in a Planner.Result).
        
        { // Extra block to prevent variable confusion - limits the scope.
            var state_stack = [];
            var current;
            var message;
            //TODO: Make the description of the action, i.e. "Moving the ball",
            // appear right before picking it up in the plan. This is probably
            // not that easy; will require some sort of buffer which we add to
            // the real plan when we actually drop the object
            for (var p = 1; p < path.length; p++){
                current = (<ActionState> path[p]);
                // Always include the action
                plan.push(current.action.command);        
                if (current.action.command == "d") {
                    // We're dropping something:
                    if (state_stack.length == 0) {
                        // We haven't picked anything up since we last dropped
                        // anything; i.e. we held it when we started
                        
                        // TODO: refactor these messages. They should all be
                        // created here; there is no need for an ActionState to
                        // have a message anymore.
                        plan.push(current.msg);
                    } else {
                        // We have picked something up during this plan, which
                        // means that we're moving it
                        var dropState = state_stack.pop();
                        message = "Moving " +
                                  getUniqueDescription(dropState.holding);
                        plan.push(message);
                    }
                } else if (current.action.command == "p" ){
                    // We're picking something up
                    if (p == (path.length - 1)){
                        // This is the last step of the plan, so we're not
                        // moving it anywhere; only picking it up
                        plan.push(current.msg);
                    }
                    state_stack.push(current);
                }
            }
        }
        return plan;
    }
}
