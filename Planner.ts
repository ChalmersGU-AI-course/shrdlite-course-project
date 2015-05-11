///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

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
    function stackToPddl(state :WorldState) : Interpreter.Literal[] {
	var pddl :Interpreter.Literal[] = [];
	if(state.holding != null) {
	    pddl.push({pol:true, rel: "holding", args: [state.holding]});
	} 

	for(var x = 0; x < state.stacks.length; x++) {
	    //Create on top of floor
	    var col : string[] = [];
	    for(var y = 0; y < state.stacks[x].length; y++) {
		var o : string = state.stacks[x][y];
		if(y == 0) { // Add floors
		    pddl.push({pol:true, rel: "ontop", args: [o, "f_" + x]});
		} else {
		    pddl.push({pol:true, rel: "ontop", args: [o, state.stacks[x][y-1]]});
		}
		
		col.forEach(function(c) {
		    pddl.push({pol:true, rel: "above", args: [o, c]});
		});
		col.push(o);

		pddl.push({pol:true, rel: "column", args: [o, "" + x]});

	    }
	}
	

	return pddl;
    }


    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
	var newState : Interpreter.Literal[] = stackToPddl(state);

	// This function returns a dummy plan involving a random stack
        do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan : string[] = [];

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        plan.push("Picking up the " + state.objects[obj].form,
                  "p");

        if (pickstack < state.stacks.length-1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length-1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length-1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
                  "d");

        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
