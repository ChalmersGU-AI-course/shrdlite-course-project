///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>
///<reference path="Position.ts"/>


module Heuristics {

    /**
    * @return heuristic function for Astar.
    */
    export function computeHeuristicFunction(intprt : Interpreter.Literal[][]) : Astar.Heuristic<State>{
        return (s : State) => {
            var hValue = Infinity;
            for(var ix in intprt){
                var hc = heuristicConjunctiveClause(s, intprt[ix]);
                if(hValue > hc){
                    hValue = hc;
                }
            }
            // Return minimum heuristic value of the disjunction.
            return hValue;
        };
    }

    //////////////////////////////////////////////////////////////////////
    // (mostly) private functions

    function heuristicConjunctiveClause(s : State, c : Interpreter.Literal[]) : number{
        var hValue = 0;
        for(var ix in c){
            var hc = heuristicAtom(s, c[ix]);
            if(hValue < hc){
                hValue = hc;
            }
        }
        // Return maximum heuristic value of the conjuction.
        return hValue;
    }

    // Returns heuristic value for this atom.
    // `atom.pol` is interpreted as negation, however, in the current code it is
    // always true: there is no grammar for negation as of yet.
    function heuristicAtom(s : State, atom : Interpreter.Literal) : number {

        switch(atom.rel){
            case "holding":
                var target = atom.args[0];

                if(atom.pol){
                    return heuristicGrab(s, target);
                }
                if(s.holding === target){
                    return 1;
                    // Just drop it. Optionally: use canSupport function.
                }
                // Already done
                return 0;

            case "inside": // Same as ontop.
            case "ontop":
            case "above": // Also successfully incorporates "under"
                var target = atom.args[0];
                var below = atom.args[1];

                if(atom.pol){
                    return heuristicMoveOntop(s, target, below, atom.rel != "above");
                }
                // Same heuristic as for grabbing the target.
                return heuristicGrab(s, target);

            case "beside":
                var target = atom.args[0];
                var beside = atom.args[1];
                var rightSide = heuristicMoveLeftOf(s, beside, target);
                var leftSide = heuristicMoveLeftOf(s, target, beside);
                return min(rightSide, leftSide);

            case "leftof":
                var target = atom.args[0];
                var leftof = atom.args[1];
                return heuristicMoveLeftOf(s, target, leftof);

            case "rightof":
                var target = atom.args[0];
                var rightof = atom.args[1];
                return heuristicMoveLeftOf(s, rightof, target);

            default:
                throw new Planner.Error("!!! Unimplemented relation in heuristicAtom: "+atom.rel);
                return 0;
        }

        return 0;
    }

    // a should be leftof b.
    function heuristicMoveLeftOf(s : State, target, leftof) : number {

        var a = computeObjectPosition(s, target);
        var b = computeObjectPosition(s, leftof);

        var moveA = heuristicMoveToStack(s, a, b.stackNo-1);
        var moveB = heuristicMoveToStack(s, b, a.stackNo+1);

        // Move one of them to the other?
        return min(moveA, moveB);
    }

    /**
    * The heuristic cost of moving object `a` to the top of stackNo `stack`.
    */
    function heuristicMoveToStack(s : State, a : ObjectPosition, stack : number) : number {
        if(stack < 0 || stack >= s.stacks.length){
            return Infinity;
        }
        if(a.stackNo === stack){
            return 0;
        }

        // clear the way so can grab the object.
        var aboveCost = a.objectsAbove * 4;

        // move the arm to `a`
        var armCost = abs(a.stackNo - s.arm);

        // then move the arm to the correct stack
        armCost = armCost + abs(a.stackNo - stack);
        if(! a.isHeld){
            // pick up the object
            armCost = armCost + 1;
        }

        var stackObj : ObjectPosition = {stackNo : stack, heightNo : -1,
                       objectsAbove : 0, isHeld : false, isFloor : false};

        // +1 for dropping the object or
        // if holding something else, drop that first.
        var holdCost = dropCost(s, a, stackObj, false);

        return aboveCost + armCost + holdCost;
    }

    function heuristicMoveOntop(s : State, above : String, below : String, exactlyOntop : boolean) : number {
        var somewhereAbove : boolean = !exactlyOntop;
        var a = computeObjectPosition(s, above);
        var b = computeObjectPosition(s, below);

        var holdCost = dropCost(s, a, b, exactlyOntop);

        var armCost = abs(s.arm - a.stackNo) + abs(a.stackNo - b.stackNo);

        // Number of objects that needs to be moved.
        var aboveCost;
        if(exactlyOntop){
            if(a.stackNo === b.stackNo){
                aboveCost = 4 * max(a.objectsAbove, b.objectsAbove);
                // + 3?
            } else {
                aboveCost = 4 * (a.objectsAbove + b.objectsAbove);
            }
        } else {
            aboveCost = 4 * a.objectsAbove;
            // ie Just somewhere above is sufficient
        }
        return holdCost + armCost + aboveCost;
    }

    function dropCost(s : State, a : ObjectPosition, b : ObjectPosition, exactlyOntop : boolean) : number{
        var somewhereAbove : boolean = !exactlyOntop;
        if(s.holding == null){
            return 0;
        } else if(a.isHeld && s.arm == b.stackNo &&
                 (somewhereAbove || b.objectsAbove == 0) ){
            // Just drop `a` and we are done
            return 1;
        } else if (b.isHeld && s.arm != a.stackNo){
            // Drop `b` anywhere so it doesn't block `a`
            return 1;
        } else if (s.arm != b.stackNo && s.arm != a.stackNo){
            // We are holding something else and we should drop it here
            // so it doesn't block `a` or `b`
            return 1;
        }
        // Holds something but needs to drop it somewhere else...
        // ...and come back
        return 3;
    }

    // Computes the expected number of actions to grab an object
    function heuristicGrab(s : State, target : String) : number {
        if(s.holding === target){
            return 0;
        }

        var holdCost = 0;
        if(s.holding != null){
            holdCost = 1;
            // This can be done more intelligently but
            // it doesn't reduce the number of iterations very much: from 96 -> 90.
            // The increased cost for computing the heuristic might not be worth it.
        }

        if(target === "floor"){
            throw new Planner.Error("!!! Error in heuristicGrab: This should never happen??");
            // var closest = Infinity;
            //
            // for(var stackNo in s.stacks){
            //     var stack = s.stacks[stackNo];
            //     var cost = abs(stackNo - s.arm) + 4*stack.length;
            //     if(closest > cost){
            //         closest = cost;
            //     }
            // }
            // return closest;
        }

        for(var stackNo in s.stacks){
            var stack = s.stacks[stackNo];
            for(var height in stack){
                if(stack[height] === target){
                    var objectsAbove = stack.length -1 -height;
                    return abs(stackNo - s.arm) + 4*objectsAbove + holdCost;
                }
            }
        }

        throw new Planner.Error("!!! Error in heuristicGrab: must be able to find the target somewhere in the world...");
    }

    ///////////////////////////////////////////////////////
    // Helper functions

    function max(a : number, b : number) : number{
        if(a > b){
            return a;
        }
        return b;
    }

    function min(a : number, b : number) : number{
        if(a < b){
            return a;
        }
        return b;
    }

    function abs(a : number) : number{
        if(a < 0){
            return -a;
        }
        return a;
    }
}
