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
	var heurFunc = makeHeurFunc(intprt);
	var actions : string[] = [];
	var initState : State = new State(state.stacks, state.holding, state.arm, "");
	var plan : State[] = AStar.AStarSearch<State>(initState.copy(), goalFunc, heurFunc, costFunc, adjacent);
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

    function makeHeurFunc(intprt : Interpreter.Literal[][]) {
	return (s : State) => {
	    var hVal : number = 123123123123;
	    intprt.forEach((i) => {
		var hi : number = h(s, i[0]);
		if(hi < hVal)
			hVal = hi;
	    });
	    return hVal;
//	    return 0;
	};
    }

    function h(s : State, lit : Interpreter.Literal) : number {	

	if(lit.rel === "holding") {
		var goalObj = lit.args[0];
		var stackIndex;
		var hval = 0;
		//findObjinStacks(goalObj);
		// best case for picking up object is 'p l|r d r|l', 4 actions per object ontop of goal object
		// assuming arm is on correct stackpos.
		// s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(goalObj) * 4

		// if we are already holding, we need atleast 1 move to drop it.
		// TODO: generalize to something better.
		if(s.holding && s.holding !== lit.args[0])
			hval += 1;

		// Also remove all objects above goalObj (each remove takes at best 4 actions)
		// finds relevant stack and calculate distance from armpos to stack.
		s.stacks.forEach((stack) => {
			if(stack.indexOf(lit.args[0]) >= 0){
				stackIndex = s.stacks.indexOf(stack);
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(goalObj)+1 ) * 4;
				hval += Math.abs(stackIndex - s.armpos) ;
			}
		});

		// +1 for taking the object
		hval+=1;		

		return hval;
	}
	else if(lit.rel === "above") {
		var above = lit.args[0];
		var below = lit.args[1];
		var hval = 0;
		// if we are already holding, we need atleast 1 move to drop it.
		// TODO: generalize to something better.
		if(s.holding && s.holding !== lit.args[0] )
			hval += 1;

		s.stacks.forEach((stack) => {
			if(stack.indexOf(above) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval +=Math.abs(stackIndex - s.armpos);
				//remove overlaying objects
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(above)+1) * 4;
				// pick it up
				hval += 1;
			}
			if(stack.indexOf(below) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval += Math.abs(stackIndex - s.armpos);
				// drop it
				hval += 1;

			}
		});
		return hval;
//		return 0;
	}
	else if(lit.rel === "ontop" || lit.rel === "inside") {
		var ontop = lit.args[0];
		var under = lit.args[1];
		var hval = 0;

		if(s.holding && s.holding !== lit.args[0] )
			hval += 1;

		s.stacks.forEach((stack) => {
			if(stack.indexOf(ontop) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval +=Math.abs(stackIndex - s.armpos);
				//remove overlaying objects
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(ontop)+1) * 4;
				// pick it up
				hval += 1;
			}
			if(stack.indexOf(under) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval += Math.abs(stackIndex - s.armpos);
				//remove overlaying objects
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(under)+1) * 4;
				// drop it
				hval += 1;

			}
		});
		return hval;
//		return 0;
	}
	else if(lit.rel === "under") {
		var under = lit.args[0];
		var above = lit.args[1];
		var hval = 0;

		if(s.holding && s.holding !== lit.args[1] )
			hval += 1;
		
		s.stacks.forEach((stack) => {
			if(stack.indexOf(above) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval +=Math.abs(stackIndex - s.armpos);
				//remove overlaying objects
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(above)+1) * 4;
				// pick it up
				hval += 1;
			}
			if(stack.indexOf(under) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval += Math.abs(stackIndex - s.armpos);
				// drop it
				hval += 1;
			}
		});
		return hval;
//		return 0;
	}
	else if(lit.rel === "rightof") {
		var rightofThis = lit.args[1];
		var obj = lit.args[0];

		if(s.holding && s.holding !== lit.args[0] )
			hval += 1;
		
		s.stacks.forEach((stack) => {
			if(stack.indexOf(obj) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval +=Math.abs(stackIndex - s.armpos);
				//remove overlaying objects
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(obj)+1) * 4;
				// pick it up
				hval += 1;
			}
			if(stack.indexOf(rightofThis) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to closest stack to the right
				hval += Math.abs(stackIndex+1 - s.armpos);
				// drop it
				hval += 1;
			}
		});
		return hval;
//		return 0;
	}
	else if(lit.rel === "leftof") {
		var leftofThis = lit.args[1];
		var obj = lit.args[0];

		if(s.holding && s.holding !== lit.args[0] )
			hval += 1;
		
		s.stacks.forEach((stack) => {
			if(stack.indexOf(obj) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval +=Math.abs(stackIndex - s.armpos);
				//remove overlaying objects
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(obj)+1) * 4;
				// pick it up
				hval += 1;
			}
			if(stack.indexOf(leftofThis) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to closest stack to the left
				hval += Math.abs(stackIndex-1 - s.armpos);
				// drop it
				hval += 1;
			}
		});
		return hval;
//		return 0;
	}
	else if(lit.rel === "beside") {
		var besideThis = lit.args[1];
		var obj = lit.args[0];

		if(s.holding && s.holding !== lit.args[0] )
			hval += 1;
		
		s.stacks.forEach((stack) => {
			if(stack.indexOf(obj) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to stack
				hval +=Math.abs(stackIndex - s.armpos);
				//remove overlaying objects
				hval += (s.stacks[stackIndex].length - s.stacks[stackIndex].indexOf(obj)+1) * 4;
				// pick it up
				hval += 1;
			}
			if(stack.indexOf(besideThis) >= 0) {
				var stackIndex = s.stacks.indexOf(stack);
				// distance to closest stack to the left
				var leftDist = Math.abs(stackIndex-1 - s.armpos);
				var rightDist = Math.abs(stackIndex+1 - s.armpos);
				hval += Math.min(leftDist, rightDist);
				// drop it
				hval += 1;
			}
		});
		return hval;
//		return 0;	
	}
    }

    function dummyH(s : State, lit : Interpreter.Literal) : number {
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
