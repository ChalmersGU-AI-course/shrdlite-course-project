///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

module Heuristics {

    // Ducktyping subtype of WorldState :)
    // should be sufficient.
    export class State{
        public constructor(public arm     : number,
                           public holding : string,
                           public stacks  : string[][]){}
        public toString(){
            return collections.makeString(this);
        }
    }

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

    export class ObjectPosition {
        constructor(public stackNo      : number,
                    public heightNo     : number,
                    public objectsAbove : number,
                    public isHeld       : boolean,
                    public isFloor      : boolean){}
    }

    export function computeObjectPosition(s : State, objA : String) : ObjectPosition{
        var stackA  : number = -1;
        var heightA : number = -1;
        var aboveA  : number = -1;

        if(objA != "floor"){
            for(var stackNo in s.stacks){
                if(stackA > -1){
                    break;
                }
                var stack = s.stacks[stackNo];
                for(var height in stack){
                    if(stack[height] === objA){
                        stackA = stackNo;
                        heightA = height;
                    }
                }
            }

            if(stackA > -1){
                aboveA = s.stacks[stackA].length -1 -heightA;
            }
        }

        if(s.holding === objA){
            stackA = s.arm;
            heightA = 0;
            aboveA = 0;
        }

        return new ObjectPosition(stackA, heightA, aboveA,
                   s.holding === objA,
                   objA === "floor");
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

    function heuristicAtom(s : State, atom : Interpreter.Literal) : number {

        switch(atom.rel){
            case "holding":
                var target = atom.args[0];
                var holds = s.holding === target;

                if(atom.pol){
                    return heuristicDistance(s, target);
                }
                if(holds){
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
                    // return 0;
                    return heuristicDifference(s, target, below, atom.rel != "above");
                }
                // Same heuristic as for grabbing the target.
                return heuristicDistance(s, target);

            default:
                throw new Planner.Error("!!! Unimplemented relation in heuristicAtom: "+atom.rel);
                return 0;
        }

        return 0;
    }

    export function heuristicDifference(s : State, above : String, below : String, exactlyOntop : boolean) : number {
        var somewhereAbove : boolean = !exactlyOntop;
        var a = computeObjectPosition(s, above);
        var b = computeObjectPosition(s, below);

        var holdCost = dropCost(s, a, b, exactlyOntop);

        var armCost = abs(s.arm - a.stackNo) + abs(a.stackNo - b.stackNo);
        // var armCost = moveCost(s, a, b, exactlyOntop);

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
            // throw new Planner.Error("should not be here atm...");
        }
        return holdCost + armCost + aboveCost;
    }

    function dropCost(s : State, a : ObjectPosition, b : ObjectPosition, exactlyOntop : boolean) : number{
        var somewhereAbove : boolean = !exactlyOntop;
        if(s.holding == null){
            return 0;
        } else if(a.isHeld && s.arm == b.stackNo &&
                 (somewhereAbove || b.objectsAbove == 0) ){
            return 1;
        } else if (b.isHeld && s.arm != a.stackNo){
            return 1;
        } else if (s.arm != b.stackNo && s.arm != a.stackNo){
            return 1;
        }
        // Holds something but needs to drop it somewhere else...
        // ...and come back?
        return 3;
    }

    // function moveCost(s : State, a : ObjectPosition, b : ObjectPosition, exactlyOntop : boolean) : number{
    //     return abs(s.arm - a.stackNo) + abs(a.stackNo - b.stackNo);
    //     // return abs(a.stackNo - b.stackNo) +
    //     //        min(abs(s.arm - a.stackNo), abs(s.arm - b.stackNo));
    // }

    ////////////////////////////////////////////////
    // Other method...

    // Computes the expected number of actions to grab an object
    function heuristicDistance(s : State, target : String) : number {
        if(s.holding === target){
            return 0;
        }

        var holdCost = 0;
        if(s.holding != null){
            holdCost = 1;
        }

        if(target === "floor"){
            var closest = Infinity;

            for(var stackNo in s.stacks){
                var stack = s.stacks[stackNo];
                var cost = abs(stackNo - s.arm) + 4*stack.length;
                if(closest > cost){
                    closest = cost;
                }
            }
            return closest;
        }

        for(var stackNo in s.stacks){
            var stack = s.stacks[stackNo];
            for(var height in stack){
                if(stack[height] === target){
                    var objectsAbove = stack.length -1 -height;
                    return abs(stackNo - s.arm) + 4*objectsAbove + holdCost; // - 0.5*emptyStacks;
                }
            }
        }

        throw new Planner.Error("!!! Error in heuristicDistance: must be able to find the target somewhere in the world...");
        // Of course unless the target is simply the floor...


        return 0;

    }

    ///////////////////////////////////////////////////////
    // Helper functions

    function max(a, b){
        if(a > b){
            return a;
        }
        return b;
    }

    function min(a, b){
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
