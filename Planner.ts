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
	var actions : string[] = [];
	var initState : State = new State(state.stacks, state.holding, state.arm, "");
	var plan : State[] = AStar.AStarSearch<State>(initState.copy(), goalFunc, h, costFunc, adjacent);
	console.log(plan);
	plan.forEach((elem) => {
	    actions.push(elem.action);
	});
	return actions.reverse();
    }


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
	    var newState = state.copy();
            newState.stacks[newState.armpos].push(newState.holding);
            newState.holding = null;
	    newState.action = "d";
            st.push(newState);
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

    /*// moveLeft
    function moveLeft (st: State, lastA: string) : State {
        
        if (st.armpos == 0 || lastA == "r") {
            return null;
        }

        var ns : State = copyState(st);
        ns.armpos -= 1;

        return ns;
    }

    // moveRight        
    function moveRight (st: State, lastA: string) : State {
        
        if (st.armpos == st.stacks.length - 1 || lastA == "l") {
            return null;
        }

        var ns : State = copyState(st);
        ns.armpos += 1;

        return ns;
    } 

    //function pickup
    function pickup(state: State, lastA: string): State {
        if(state.holding != null || lastA == "d" || lastA == "p" || state.stacks[state.armpos].length == 0) {
            return null;
        } 
        
        var ns: State = copyState(state);
        ns.holding = ns.stacks[ns.armpos].pop();

        return ns;

    }

    //drop function
    function drop(state: State, lastA: string): State {
       /* if(state.holding != null || lastA == "d" || lastA == "p" 
            || (state.stacks[state.armpos].length != 0 
            && !Interpreter.checkSize(state.objects[state.holding]
            ,state.objects[state.stacks[state.armpos][state.stacks[state.armpos].length - 1]]))) {
            return null;
        } 

        var ns : State = copyState(state);
        ns.stacks[ns.armpos].push(ns.holding);
        ns.holding = null;

        return ns;
    }


*/
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
    // ontop
    if(lit.rel === "ontop") {
        /* is 
         if 
            yes
         then  
            checks if  ontopof(a,b), where a = lit.args[0], b = lit.args[1]
    see http://ai-course-tin172-dit410.github.io/shrdlite-grammar.html#semantic-interpretation
        */
        s.stacks.forEach( (stack) => {
            if(stack.indexOf(lit.args[1]) != -1 && stack.indexOf(lit.args[0]) != -1) {
                if(stack.indexOf(lit.args[1])-stack.indexOf(lit.args[0]) == 1) 
                flag = true;    
            }
	    else if (lit.args[1] === "floor" && stack.indexOf(lit.args[0]) == 0) flag = true;
        });
    }
    // leftof
    if(lit.rel === "leftof") {
        var stackofa = -1;
        var stackofb = -1;
        /*
        checks the stacks of objects.
        when objects are found compare stack index
        to find if leftof(a,b)
        */
        for(var i = 0; i < s.stacks.length; i++){
            var stack = s.stacks[i];
            for(var j = 0; j < stack.length; j++) {
                if(stack[j] === lit.args[0])
                    stackofa = i;
                if(stack[j] === lit.args[1])
                    stackofb = i;
            }
        }
        if(stackofb - stackofa > 0)
            flag = true;
    }
    // rightof
    // same as for leftof only we change the condition
    // to stackofb - stackofa < 0
    if(lit.rel === "rightof") {
        var stackOfa = -1;
        var stackOfb = -1;
        for(var i = 0; i < s.stacks.length; i++){
            var stack = s.stacks[i];
            for(var j = 0; j < stack.length; j++) {
                if(stack[j] === lit.args[0])
                    stackofa = i;
                if(stack[j] === lit.args[1])
                    stackofb = i;
            }
        }
        if(stackofb - stackofa < 0)
            flag = true;
    }
    
	if(lit.pol) return flag;
	else return ! flag;
    }
}
