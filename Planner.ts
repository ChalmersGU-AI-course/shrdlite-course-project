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
        //var plan : string[] = [];
        var plan : string[] = ["r","p"];

        worldDictionary = state.objects;

        // actions r l p d
        //
        // T == WordState

        // performAction("r", {arm: 0, stacks: []});
        // performAction("r", state);
        console.log(neighbours(state));

        return plan;
    }

    interface State{
        arm : number;
        holding: string;
        stacks : string[][];
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
                console.log("ERROR: unknown action "+action);
                return undefined;
        }
        return {state: newState, action: action};
    }

    function canSupport(above: string, below: string) : boolean{
        var objA : ObjectDefinition = worldDictionary[above];
        var objB : ObjectDefinition = worldDictionary[below];

        // TODO implement rules...

        return true;
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
