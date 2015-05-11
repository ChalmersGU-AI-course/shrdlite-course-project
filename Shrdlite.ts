///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>

module Shrdlite {
	var ambigious = false;
	var inputPrompt = "";
	var orgparses : Parser.Result[];
	var standardinpromt = "What can I do for you today? ";
	
    export function interactive(world : World) : void {
        function endlessLoop(utterance : string = "") : void {
            //var inputPrompt = "What can I do for you today? ";
           	if(!ambigious){
        		inputPrompt = standardinpromt;
        		orgparses = [];
        	}
            var nextInput = () => world.readUserInput(inputPrompt, endlessLoop);
            if (utterance.trim()) {
                var plan : string[] = splitStringIntoPlan(utterance);
                if (!plan) {
                    plan = parseUtteranceIntoPlan(world, utterance);
                }
                if (plan) {
                    world.printDebugInfo("Plan: " + plan.join(", "));
                    world.performPlan(plan, nextInput);
                    return;
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

    export function parseUtteranceIntoPlan(world : World, utter : string) : string[] {
    	var plan = questionLoop(utter);
    	
    	function questionLoop(utterance : string = "") : string[] {
	        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
	        try {
	        	var parses = Parser.parse(utterance, ambigious);
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
	        var clairifyingparse;
	        if(ambigious){
	        	clairifyingparse = parses;
	       		parses = orgparses;
	        }
	        
	        try {
	            var interpretations : Interpreter.Result[] = Interpreter.interpret(parses, clairifyingparse, world.currentState);
	        } catch(err) {
	            if (err instanceof Interpreter.Error) {
	            	if(!ambigious){
		            	ambigious = true;
		            	orgparses = parses;
	            	} 
	            	inputPrompt = err.message;
	            	//world.readUserInput(err.message, questionLoop);
	                //world.printError("Interpretation error", err.message);
	                return;
	            } else if(err instanceof Interpreter.ErrorInput){
	            	world.printError("Interpretation error", err.message);
	            	return;
	            } else {
	                throw err;
	            }
	        }
	        ambigious = false;
	        inputPrompt = standardinpromt;
	        world.printDebugInfo("Ambigious " + ambigious );
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
	        plans.forEach((res, n) => {
	            world.printDebugInfo("  (" + n + ") " + Planner.planToString(res));
	        });
		
	        var planq : string[] = plans[0].plan;
	        world.printDebugInfo("Final plan: " + planq.join(", "));
	        return planq;
        }
        
        return plan;
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
