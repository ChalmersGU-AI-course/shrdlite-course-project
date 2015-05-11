///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

module Heuristics {

    // Ducktyping subtype of WorldState :)
    // should be sufficient.
    export interface State{
        arm : number;
        holding: string;
        stacks : string[][];
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
                var target = atom.args[0];
                var below = atom.args[1];

                if(atom.pol){
                    // return 0;
                    // return heuristicDistance(s, target) + heuristicDistance(s, below);
                    return heuristicDifference(s, target, below, true);
                }
                // Same heuristic as for grabbing the target.
                return heuristicDistance(s, target);

            default:
                throw new Planner.Error("!!! Unimplemented relation in heuristicAtom: "+atom.rel);
                return 0;
        }

        return 0;
    }

    class ObjectPosition {
        constructor(public stackNo      : number,
                    public heightNo     : number,
                    public objectsAbove : number,
                    public isHeld       : boolean,
                    public isFloor      : boolean){}
    }

    class HeuristicState {
        constructor(public above : ObjectPosition,
                    public below : ObjectPosition){}
    }

    function computeObjectPosition(s : State, objA : String) : ObjectPosition{
        var stackA = -1;
        var heightA = -1;
        var aboveA = -1;

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

        return new ObjectPosition(stackA, heightA, aboveA,
                   s.holding === objA,
                   objA === "floor");
    }

    // Another attempt at heuristic function. Doesn't work as well as the simple
    // grab heuristic. However, that one isnt really admissible...
    export function heuristicDifference(s : State, above : String, below : String, exactlyOntop : boolean) : number {

        var stackA  : number;
        var stackB  : number;
        var heightA : number;
        var heightB : number;
        var aboveA  : number;
        var aboveB  : number;

        // TODO floor...

        for(var stackNo in s.stacks){
            var stack = s.stacks[stackNo];
            for(var height in stack){
                if(stack[height] === above){
                    stackA = stackNo;
                    heightA = height;
                }
                if(stack[height] === below){
                    stackB = stackNo;
                    heightB = height;
                }
            }
        }

        var holdCost = 0;
        if(s.holding != null){
            holdCost = 1;
        }

        // OBS, can be in arm as well...
        if(s.holding === above){
            stackA = s.arm;
            aboveA = 0;
        } else {
            aboveA = s.stacks[stackA].length -1 -heightA;
        }

        if(s.holding === below){
            stackB = s.arm;
            aboveB = 0;
        } else {
            aboveB = s.stacks[stackB].length -1 -heightB;
        }

        var armCost = abs(s.arm - stackA) + abs(stackA - stackB);

        // Number of objects that needs to be moved.
        var aboveCost;
        if(exactlyOntop){
            if(stackA === stackB){
                aboveCost = 4 * max(aboveA, aboveB);
            } else {
                aboveCost = 4 * (aboveA + aboveB);
            }
        } else {
            // ie Just somewhere above is sufficient
            throw new Planner.Error("should not be here atm...");
        }
        // if(isUndefined(aboveCost)) throw new Planner.Error("aboveCost undefined!");
        return holdCost + armCost + aboveCost;
    }



    // Computes the expected number of actions to grab an object
    function heuristicDistance(s : State, target : String) : number {
        if(s.holding === target){
            return 0;
        }

        var holdCost = 0;
        if(s.holding != null){
            holdCost = 1;
        }

        var emptyStacks = 0;
        for(var stackNo in s.stacks){
            if(s.stacks[stackNo].length == 0){
                emptyStacks = emptyStacks +1;
            }
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

    function max(a, b){
        if(a > b){
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
