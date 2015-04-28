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

    var worldDictionary : {[s:string] : ObjectDefinition};

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {

        var goal = computeGoalFunction(intprt);

        // console.log("DEBUG - is start goal: " + goal(state));
        //
        // var ns = neighbours(state);
        // for(var ix in ns){
        //     console.log("DEBUG - neighbour: " + ns[ix].action);
        // }

        var plan : string[] = Astar.astar(neighbours, cost, heuristic, state, goal, false);

        //var plan : string[] = [];
        // var plan : string[] = ["r","p"];

        worldDictionary = state.objects;

        // actions r l p d
        //
        // T == WordState

        // performAction("r", {arm: 0, stacks: []});
        // performAction("r", state);
        // console.log(neighbours(state));

        return plan;
    }

    // Ducktyping subtype of WorldState :)
    // should be sufficient.
    interface State{
        arm : number;
        holding: string;
        stacks : string[][];
    }

    export function printState(s : State){

    }

    function cost(a : State, b : State) : number{
        return 1;
    }

    // Dummy heuristic function
    function heuristic(s : State) : number{
        return 0;
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
        var result : boolean;

        switch(atom.rel){
            case "holding":
                result = s.holding === atom.args[0];
                break;
            default:
                console.log("!!! Unimplemented relation in testAtom: "+atom.rel);
                return true;
        }
        if(atom.pol){
            return result;
        }
        return ! result;
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
            var head : string = currStack[currStack.length-1];
            if(canSupport(s.holding, head)){

                // Can drop here
                // console.log(s.holding + " can support " + head);
                result.push(performAction("d",s));
            } else {
                // console.log(s.holding + " can't support " + head);
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
                console.log("ERROR: unknown action "+action);
                return undefined;
        }
        return {state: newState, action: action};
    }

    function canSupport(above: string, below: string) : boolean{
        var objA : ObjectDefinition = worldDictionary[above];
        var objB : ObjectDefinition = worldDictionary[below];

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
