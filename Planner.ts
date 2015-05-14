///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="astar.ts"/>

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

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
	
	var goalFunc = makeGoalFunc(intprt);
	var x : string[] = [];
	var initState : State = {stacks: state.stacks, holding:state.holding, armpos:state.arm};
	var bla = AStar.AStarSearch<State>(initState, goalFunc, h, costFunc, adjacent);
	console.log(bla);
	return x;
    }

    interface State {
	stacks: string[][];
	holding: string;
	armpos : number;
    }

    function copyState(st : State) : State {
      var newStacks = [];
      st.stacks.forEach((stack) => {
        newStacks.push(stack.slice(0));
      });

      return {stacks: newStacks, holding: st.holding, armpos:st.armpos };
    }

    function costFunc(a : State, b : State) : number {
	return 1;
    }

    function h(s : State) : number {
	return 0;
    }

    function adjacent(state : State) : State[] {
        
        var st : State[] = [];
        // left

        if(state.armpos > 0) {
            var newState = copyState(state);
            newState.armpos -= 1;
            st.push(newState);
        }   
        //right
        if(state.armpos < state.stacks.length) {
            var newState = copyState(state);
            newState.armpos += 1;
            st.push(newState);
        }

        //drop
        if(state.holding) {
            var newState = copyState(state);
            state.stacks[state.armpos].push(state.holding)
            newState.holding = null;
            st.push(newState)
        }
        //pickup
        if(!state.holding) {
            var newState = copyState(state);
            newState.holding = state.stacks[state.armpos].pop();
            st.push(newState)
        }

        return st;
    }
    
    function makeGoalFunc(intprt : Interpreter.Literal[][]) {
	return (s : State) => {
	    var flag : boolean = false;
	    intprt.forEach((i) => {
		if(compareState(s, i[0])) flag = true;
	    });
	    return flag;
	};
    }

    // TODO Finish for all cases, only holding is working now.
    function compareState(s : State, lit : Interpreter.Literal) : boolean {
	var flag : boolean = false;
	if(lit.rel === "holding") {
	    flag = s.holding === lit.args[0];
	}

	if(lit.pol) return flag;
	else return ! flag;
    }
}
