///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

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
    // private functions

    var worldDictionary : {[s:string] : ObjectDefinition} = null;

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {

        worldDictionary = state.objects;

        var goal = computeGoalFunction(intprt);
        var heur = computeHeuristicFunction(intprt);

        var plan : string[] = Astar.astar(neighbours, cost, heur, state, goal, false, 10000);
        plan.shift();

        return plan;
    }

    // Ducktyping subtype of WorldState :)
    // should be sufficient.
    interface State{
        arm : number;
        holding: string;
        stacks : string[][];
    }

    function cost(a : State, b : State) : number{
        return 1;
    }

    // Dummy heuristic function
    function heuristic(s : State) : number{
        return 0;
    }

    /**
    * @return heuristic function for Astar.
    */
    function computeHeuristicFunction(intprt : Interpreter.Literal[][]) : Astar.Heuristic<State>{
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

            case "ontop":
                var target = atom.args[0];
                var below = atom.args[1];

                if(atom.pol){
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

    function heuristicDifference(s : State, above : String, below : String, exactlyOntop : boolean) : number {

        var stackA : number;
        var stackB : number;
        var heightA : number;
        var heightB : number;

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
        if(s.holding === above){
            stackA = s.arm;
            heightA = s.stacks[stackA].length -1;
        }
        if(s.holding === below){
            stackB = s.arm;
            heightB = s.stacks[stackB].length -1;
        }
        // OBS, can be in arm as well...

        if(isUndefined(stackA)) throw new Planner.Error("stackA undefined! "+above);
        if(isUndefined(stackB)) throw new Planner.Error("stackB undefined! "+below);
        if(isUndefined(heightA)) throw new Planner.Error("heightA undefined! "+above);
        if(isUndefined(heightB)) throw new Planner.Error("heightB undefined! "+below);

        var armCost = abs(s.arm - stackA) + abs(stackA - stackB);

        var aboveA = s.stacks[stackA].length -1 -heightA;
        var aboveB = s.stacks[stackB].length -1 -heightB;

        // Number of objects that needs to be moved.
        var aboveCost;
        if(exactlyOntop){
            if(stackA === stackB){
                aboveCost = max(aboveA, aboveB);
            } else {
                aboveCost = aboveA + aboveB;
            }
        } else {
            throw new Planner.Error("should not be here atm...");
            // Just somewhere above is sufficient
        }

        if(isUndefined(aboveCost)) throw new Planner.Error("aboveCost undefined!");

        return armCost + 4*aboveCost;
    }

    function isUndefined(a){
        return typeof a === 'undefined' ;
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

    /**
    * @return goal function for Astar.
    */
    function computeGoalFunction(intprt : Interpreter.Literal[][]) : Astar.Goal<State>{
        return (s : State) => {
            for(var ix in intprt){
                if(testConjunctiveClause(s, intprt[ix])){
                    return true;
                }
            }
            // None of them is true
            return false;
        };
    }

    function testConjunctiveClause(s : State, c : Interpreter.Literal[]) : boolean{
        for(var ix in c){
            if(! testAtom(s, c[ix])){
                return false;
            }
        }
        // They are all true
        return true;
    }

    function testAtom(s : State, atom : Interpreter.Literal) : boolean {
        var ret = (result => {
            if(atom.pol){
                return result;
            }
            return ! result;
        })

        var result : boolean;

        switch(atom.rel){
            case "holding":
                return ret(s.holding === atom.args[0]);
            case "ontop":
                var locationObject = atom.args[1];
                if(locationObject === "floor"){
                    for(var stackNo in s.stacks){
                        var stack = s.stacks[stackNo];
                        if(stack.length > 0 && stack[0] === atom.args[0]){
                            return ret(true);
                        }
                    }
                    return ret(false);
                }

                for(var stackNo in s.stacks){
                    var stack = s.stacks[stackNo];
                    for(var height in stack){
                        if(stack[height] === atom.args[0]){
                            return ret(height > 0 &&
                                       stack[height-1] === locationObject);
                        }
                    }
                }
                return ret(false);

            default:
                throw new Planner.Error("!!! Unimplemented relation in testAtom: "+atom.rel);
                return true;
        }
        console.log("OOPS? testAtom: Default return for relation "+atom.rel);
        return ret(false);
    }



    function neighbours(s : State) : Astar.Neighb<State>[]{
        var result = [];
        var numStacks = s.stacks.length;

        if(s.arm > 0){
            // Can move left
            result.push(performAction("l",s));
        }
        if(s.arm < numStacks-1){
            // Can move right
            result.push(performAction("r",s));
        }

        if(s.holding == null){
            if(s.stacks[s.arm].length>0){
                // Can pick up
                result.push(performAction("p",s));
            }
        } else {
            var currStack = s.stacks[s.arm];
            if(currStack.length > 0){
                var head : string = currStack[currStack.length-1];
                if(canSupport(s.holding, head)){

                    // Can drop here
                    // console.log(s.holding + " can be supported by " + head);
                    result.push(performAction("d",s));
                } else {
                    // console.log(s.holding + " can't be supported by " + head);
                }
            } else {
                // Floor
                result.push(performAction("d",s));
            }
        }

        return result;
    }

    function performAction(action: string, state: State) : Astar.Neighb<State>{
        var newState = cloneState(state);

        switch(action){
            case "l":
                newState.arm = state.arm - 1;
                break;
            case "r":
                newState.arm = state.arm + 1;
                break;
            case "p":
                newState.holding = newState.stacks[newState.arm].pop();
                break;
            case "d":
                newState.stacks[newState.arm].push(newState.holding);
                newState.holding = null;
                break;
            default:
                throw new Planner.Error("ERROR: unknown action "+action);
                return undefined;
        }
        return {state: newState, action: action};
    }

    function canSupport(above: string, below: string) : boolean{
        var objA : ObjectDefinition = worldDictionary[above];
        var objB : ObjectDefinition = worldDictionary[below];

        if(! objB){
            throw new Planner.Error("DEBUG: objB undefined: "+below);
        }

        if(objB.form == "floor"){
            // The floor can support any object
            return true;
        }

        var cs = compareSize(objB.size, objA.size);
        if(cs < 0){
            // No small object can support a large(r) one.
            return false;
        }

        if(objA.form == "ball"){
            // A ball can only be supported by the floor or a box.
            return objB.form == "box";
        }

        if(objB.form == "ball"){
            // A ball cannot support anything
            return false;
        }

        if(objB.form == "box"){
            if(cs > 0){
                return true;
            }
            // Same size, so cannot support box, pyramid or plank.
            switch(objA.form){
                case "box":
                case "pyramid":
                case "plank":
                    return false;
                default:
                    return true;
            }
        }

        if(objA.form == "box"){
            if(objA.form == "large"){
                // Large boxes cannot be supported by (large) pyramids
                return objB.form != "pyramid";
            } else {
                // Small boxes cannot be supported by small bricks or pyramids
                if(objB.form == "brick" || objB.form == "pyramid"){
                    return objB.size != "small";
                }
            }
        }

        // Otherwise, can support
        return true;
    }

    /**
    * Compares two sizes.
    * returns positive if a > b, 0 if a == b and negative otherwise.
    */
    function compareSize(a : string, b : string) : number{
        if (a == b){
            return 0;
        }
        if( a == "large"){
            return 1;
        }
        return -1;
    }

    function cloneState(s : State) : State{
        var rs = [];
        for(var i in s.stacks){
            rs.push(s.stacks[i].slice());
        }
        return {arm: s.arm, holding: s.holding, stacks: rs};
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
