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
	
	worldObjs = state.objects;

	var goalFunc = makeGoalFunc(intprt);
	var actions : string[] = [];
	var initState : State = new State(state.stacks, state.holding, state.arm, "");
	var plan : State[] = AStar.AStarSearch<State>(initState.copy(), goalFunc, h, costFunc, adjacent);
	console.log(plan);
	plan.forEach((elem) => {
	    actions.push(elem.action);
	});
	return actions.reverse();
    }

    //objectDefinitions of the world.
    var worldObjs;

    // state of the world
    // action: action taken to get to the state
    class State {
	constructor(public stacks: string[][], public holding: string, public armpos : number, public action : string) {
	}
	toString() {
	    return collections.makeString(this);
	}

	copy() : State {
	    return new State(this.stacks.map((stack) => {return stack.slice();}).slice(), this.holding, this.armpos, this.action);
	}
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
	    var newState = state.copy();
            newState.armpos -= 1;
	    newState.action = "l";
            st.push(newState);
        }   
        //right
        if(state.armpos < state.stacks.length-1) {
	    var newState = state.copy();
            newState.armpos += 1;
	    newState.action = "r";
            st.push(newState);
        }

        //drop
        if(state.holding) {
	    if(state.stacks[state.armpos].length > 0) {
		if(validatePhysics(state.holding, state.stacks[state.armpos][state.stacks[state.armpos].length-1])) {
		    // here we can drop
	    	    var newState = state.copy();
	            newState.stacks[newState.armpos].push(newState.holding);
        	    newState.holding = null;
		    newState.action = "d";
        	    st.push(newState);
		}
	    }
	    else {
		   // here we can also drop since the supporting object is the floor
		    var newState = state.copy();
        	    newState.stacks[newState.armpos].push(newState.holding);
        	    newState.holding = null;
		    newState.action = "d";
        	    st.push(newState);
	    }
        }
        //pickup
        if(!state.holding && state.stacks[state.armpos].length > 0) {
	    var newState = state.copy();
            newState.holding = newState.stacks[newState.armpos].pop();
	    newState.action = "p";
            st.push(newState);
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

	//holding
	if(lit.rel === "holding") {
	    flag = s.holding === lit.args[0];
	}
	// leftof
	if(lit.rel === "leftof") {
	    var stackIndex : number;
	    s.stacks.forEach( (stack) => {
		if(stack.indexOf(lit.args[1]) >= 0)
		    stackIndex = s.stacks.indexOf(stack);
	    });

	    for(var i = 0; i < stackIndex; i++) {
		if(s.stacks[i].indexOf(lit.args[0]) >= 0)
		    flag = true;
	    }
	}
	// rightof
	if(lit.rel === "rightof") {
	    var stackIndex : number;
	    s.stacks.forEach( (stack) => {
		if(stack.indexOf(lit.args[1]) >= 0)
  		    stackIndex = s.stacks.indexOf(stack);
	    });

	    for(var i = stackIndex+1; i < s.stacks.length; i++) {
		if(s.stacks[i].indexOf(lit.args[0]) >= 0)
		    flag = true;
	    } 
	}
	// inside
	if(lit.rel === "inside") {
	    s.stacks.forEach( (stack) => {
	    	if(stack.indexOf(lit.args[1]) >= 0 && stack.indexOf(lit.args[0]) >= 0 &&
		    stack.indexOf(lit.args[0]) > stack.indexOf(lit.args[1]) && stack.indexOf(lit.args[0]) - stack.indexOf(lit.args[1]) == 1)
			flag = true;
	    });
	}
	// ontop
	if(lit.rel === "ontop") {
            s.stacks.forEach( (stack) => {
		if(lit.args[1] === "floor" && stack.indexOf(lit.args[0]) == 0) flag = true;
	   	else if(stack.indexOf(lit.args[0]) >= 0 && stack.indexOf(lit.args[1]) >= 0 && 
			stack.indexOf(lit.args[0]) - stack.indexOf(lit.args[1]) == 1) flag = true;
            });
    	}
	//under
	if(lit.rel === "under") {
	    s.stacks.forEach( (stack) => {
	    	if(stack.indexOf(lit.args[1]) >= 0 && stack.indexOf(lit.args[0]) >= 0 && 
		   stack.indexOf(lit.args[0]) < stack.indexOf(lit.args[1]))
		    flag = true;
	    });
	}
	//beside
	if(lit.rel === "beside") {
	    var stackIndex : number;
	    s.stacks.forEach((stack) => {
	    	if(stack.indexOf(lit.args[1]) >= 0)
		    stackIndex = s.stacks.indexOf(stack);
	    });

	    if(s.stacks[stackIndex+1].indexOf(lit.args[0]) >= 0)
	    	flag = true;
	    if(s.stacks[stackIndex-1].indexOf(lit.args[0]) >= 0)
	    	flag = true;
	}
	//above
	if(lit.rel === "above") {
	    s.stacks.forEach( (stack) => {
	    	if(stack.indexOf(lit.args[1]) >= 0 && stack.indexOf(lit.args[0]) >= 0 && 
		   stack.indexOf(lit.args[0]) > stack.indexOf(lit.args[1]))
		    flag = true;
	    });
	}
	
        console.log(flag);
	if(lit.pol) return flag;
	else return ! flag;
    }

    function validatePhysics(holding: string, support: string) : boolean {
	var objHolding : ObjectDefinition = worldObjs[holding];
	var objSupport : ObjectDefinition = worldObjs[support];
	
	if(objHolding.form === "ball" && objSupport.form !== "box") return false;
	if(objSupport.form === "ball") return false;
	if(objHolding.size === "large" && objSupport.size === "small") return false;
	if(objSupport.form === "box") {
		if(objHolding.size == objSupport.size && (objHolding.form === "pyramid" || 
							  objHolding.form === "plank" || 
							  objHolding.form === "box"))
			return false;
	}
	if(objSupport.form === "pyramid" && objHolding.form === "box") return false;
	if(objHolding.form === "box" && objHolding.size === "small" && objSupport.form === "brick") return false;

	return true;

    }
}
