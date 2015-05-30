///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>

module Shrdlite {

    export function interactive(world: World, glworld: World): void {
        function endlessLoop(utterance: string = ""): void {
            var inputPrompt = "What can I do for you today? ";
            var nextInput = () => world.readUserInput(inputPrompt, endlessLoop);
            if (utterance.trim()) {
                var plan: string[] = splitStringIntoPlan(utterance);
                if (!plan) {
                    plan = parseUtteranceIntoPlan(world, utterance);
                }
								if (plan) {
									if (plan[0] == "Please select ...") {
										var askQuestion = () => world.printPickList(plan, endlessLoop); 
										askQuestion();
										return;
									}
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

    export function parseUtteranceIntoPlan(world: World, utterance: string): string[] {
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses: Parser.Result[] = Parser.parse(utterance);
        } catch (err) {
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
            var interpretations: Interpreter.Result[] = Interpreter.interpret(parses, world.currentState);
        } catch (err) {
            if (err instanceof Interpreter.Error) {
                world.printError("Interpretation error", err.message);
                return;
            } else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + interpretations.length + " interpretations");
        interpretations.forEach((res, n) => {
            world.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
        });

				//check if the utterance was ambiguous
        if (interpretations.length > 1) {
            world.printSystemOutput("The utterance is ambiguous.\nCan you please clarify ...");
            var s: string[] = [];
            interpretations.forEach((res, n) => {
                s = s.concat(Interpreter.interpretationToUtterance(res, world.currentState));
            });
						return ["Please select ..."].concat(s);
        }

        try {
            var plans: Planner.Result[] = Planner.plan(interpretations, world.currentState);
        } catch (err) {
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

        var plan: string[] = plans[0].plan;
        world.printDebugInfo("Final plan: " + plan.join(", "));
        return plan;
    }


    // This is a convenience function that recognizes strings
    // of the form "p r r d l p r d"

    export function splitStringIntoPlan(planstring: string): string[] {
        var plan: string[] = planstring.trim().split(/\s+/);
        var actions = { p: "pick", d: "drop", l: "left", r: "right" };
        for (var i = plan.length - 1; i >= 0; i--) {
            if (!actions[plan[i]]) {
                return;
            }
            plan.splice(i, 0, actions[plan[i]]);
        }
        return plan;
    }

}
