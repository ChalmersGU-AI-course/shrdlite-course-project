///<reference path="Puzzle.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Planner.ts"/>

module Astar {

    export function interactive(puzzle : Puzzle) : void {
        function endlessLoop(utterance : string = "") : void {
            var inputPrompt = "What can I do for you today? ";
            var nextInput = () => puzzle.readUserInput(inputPrompt, endlessLoop);
            if (utterance.trim()) {
                var plan : string[] = splitStringIntoPlan(utterance);
                if (!plan) {
                    plan = parseUtteranceIntoPlan(puzzle, utterance);
                }
                if (plan) {
                    puzzle.printDebugInfo("Plan: " + plan.join(", "));
                    puzzle.performPlan(plan, nextInput);
                    return;
                }
            }
            nextInput();
        }
        puzzle.printPuzzle(endlessLoop);
    }


    // Generic function that takes an utterance and returns a plan:
    // - first it parses the utterance
    // - then it interprets the parse(s)
    // - then it creates plan(s) for the interpretation(s)

    export function parseUtteranceIntoPlan(puzzle : Puzzle, utterance : string) : string[] {
        puzzle.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses : Parser.Result[] = Parser.parse(utterance);
        } catch(err) {
            if (err instanceof Parser.Error) {
                puzzle.printError("Parsing error", err.message);
                return;
            } else {
                throw err;
            }
        }
        puzzle.printDebugInfo("Found " + parses.length + " parses");
        parses.forEach((res, n) => {
            puzzle.printDebugInfo("  (" + n + ") " + Parser.parseToString(res));
        });

        try {
            var interpretations : Interpreter.Result[] = Interpreter.interpret(parses, puzzle.currentState);
        } catch(err) {
            if (err instanceof Interpreter.Error) {
                puzzle.printError("Interpretation error", err.message);
                return;
            } else {
                throw err;
            }
        }
        puzzle.printDebugInfo("Found " + interpretations.length + " interpretations");
        interpretations.forEach((res, n) => {
            puzzle.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
        });

        try {
            var plans : Planner.Result[] = Planner.plan(interpretations, puzzle.currentState);
        } catch(err) {
            if (err instanceof Planner.Error) {
                puzzle.printError("Planning error", err.message);
                return;
            } else {
                throw err;
            }
        }
        puzzle.printDebugInfo("Found " + plans.length + " plans");
        plans.forEach((res, n) => {
            puzzle.printDebugInfo("  (" + n + ") " + Planner.planToString(res));
        });

        var plan : string[] = plans[0].plan;
        puzzle.printDebugInfo("Final plan: " + plan.join(", "));
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
