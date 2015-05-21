///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>

module Shrdlite {

    export function interactive(world : World) : void {
        function endlessLoop(utterance : string = "") : void {
            var inputPrompt = "What can I do for you today? ";
            var nextInput = () => world.readUserInput(inputPrompt, endlessLoop);
            if (utterance.trim()) {
		//world.printSystemOutput(utterance);
		try {
                    var plan : string[] = splitStringIntoPlan(utterance);
                    if (!plan) {
			plan = parseUtteranceIntoPlan(world, utterance);
                    }
                    if (plan) {
			world.printDebugInfo("Plan: " + plan.join(", "));
			world.performPlan(plan, nextInput);
			return;
                    }
		} catch (err){
		    if (err instanceof Interpreter.Ambiguity){
			//world.printError("Found you!", "");
			//world.printError("LISTS: ", world.currentState.ambiguousObjs.toString());
			var question = "Do you mean ";
			world.currentState.ambiguousObjs.forEach((obj) => {
			    question = question + Parser.objToString(obj) + " ? ";
			});
			
			// clear up status or we will always come back here
			world.currentState.status = [];
			world.currentState.ambiguousObjs = [];
			nextInput = () => world.readUserInput(question, endlessLoop);
		    } else {
			throw err;
		    }
		} 
            }
            nextInput();
	}
        world.printWorld(endlessLoop);
    }


    // Generic function that takes an utterance and returns a plan:
    // - first it parses the utterance
    // - then it interprets the parse(s)
    // - then it creates plan(s) for the interpretation(s)

    export function parseUtteranceIntoPlan(world : World, utterance : string) : string[] {
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses : Parser.Result[] = Parser.parse(utterance);
        } catch(err) {
            if (err instanceof Parser.Error) {
                world.printError("Parsing error", err.message);
                return;
            } else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + parses.length + " parses");
        parses.forEach((res, n) => {
            world.printDebugInfo("  (" + n + ") " + Parser.parseToString(res));
        });

        try {
            var interpretations : Interpreter.Result[] = Interpreter.interpret(parses, world.currentState);
        } catch(err) {
            if (err instanceof Interpreter.Error) {
                world.printError("Interpretation error", err.message);
                return;
            } else {
                throw err;
            }
        }
	//world.printDebugInfo(world.currentState.status);
	world.currentState.status.forEach((status) => {
	    if (status === "softambiguity"){
		throw new Interpreter.Ambiguity(); // throw sth-else!
	    }
	    if (status === "multiValidInterpret"){
		world.printSystemOutput("There're multiple valid interpretation");
		world.printSystemOutput("But Im lazy and only performs minimum plan");
		// clean up for multiValidInterpret
		world.currentState.status = [];
	    }
	});


        world.printDebugInfo("Found " + interpretations.length + " interpretations");
        interpretations.forEach((res, n) => {
            world.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
        });

        try {
            var plans : Planner.Result[] = Planner.plan(interpretations, world.currentState);
        } catch(err) {
            if (err instanceof Planner.Error) {
                world.printError("Planning error", err.message);
                return;
            } else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + plans.length + " plans");
	var shortestPlan = plans[0].plan;
        plans.forEach((res, n) => {
	    if (res.plan.length < shortestPlan.length){
	    	shortestPlan = res.plan;
	    };
            world.printDebugInfo("  (" + n + ") " + Planner.planToString(res));
        });

        //var plan : string[] = plans[0].plan;
        //world.printDebugInfo("Final plan: " + plan.join(", "));
        //return plan;
	world.printDebugInfo("Final plan: " + shortestPlan.join(", "));
	return shortestPlan;
    }


    // This is a convenience function that recognizes strings
    // of the form "p r r d l p r d"

    export function splitStringIntoPlan(planstring : string) : string[] {
        var plan : string[] = planstring.trim().split(/\s+/);
        var actions = {p:"pick", d:"drop", l:"left", r:"right"};
        for (var i = plan.length-1; i >= 0; i--) {
            if (!actions[plan[i]]) {
                return;
            }
            plan.splice(i, 0, actions[plan[i]]);
        }
        return plan;
    }



}
