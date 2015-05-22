///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="IDAstar.ts"/>
///<reference path="Astar.ts"/>
///<reference path="Heuristics.ts"/>
///<reference path="Position.ts"/>

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
	    // if plans.length > 1 take the shortest one :)
	    // Dont modify here; instead work on Shrdlite
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
        var heur = Heuristics.computeHeuristicFunction(intprt);
        var start = new State(state.arm, state.holding, state.stacks);

        console.log(" ");
        var search = new Astar.Search(start, neighbours, heur, goal);
        // var plan : string[] = IDAstar.idaSearch(search);
        var plan : string[] = Astar.astarSearch(search);

        var len = plan.length;
        plan.unshift("Completed in " + search.x + " iterations.");
        plan.unshift("This plan has " + len + " actions.");

        return plan;
    }

    /**
    * @return goal function for IDAstar.
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
        var a = atom.args[0];
        var b = atom.args[1]; // Doesnt matter if b is undefined here...
        var result : boolean = isObjectInLocation(s, a, b, atom.rel);
        if(atom.pol){
            return result;
        } else {
            return ! result;
        }
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
                    result.push(performAction("d",s));
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
        return {state: newState, action: action, transitionCost: 1};
    }

    function canSupport(above: string, below: string) : boolean{
        var objA : ObjectDefinition = worldDictionary[above];
        var objB : ObjectDefinition = worldDictionary[below];

        return Interpreter.canSupport(objA, objB);
    }

//////////////////////////////////////////////////////////////////////
// Basic helper functions

    function cloneState(s : State) : State{
        var rs = [];
        for(var i in s.stacks){
            rs.push(s.stacks[i].slice());
        }
        return new State(s.arm, s.holding, rs);
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
