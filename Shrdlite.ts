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

    export function parseUtteranceIntoPlan(world : World, utterance : string) : string[] {
        // Parsing
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses : Parser.Result[] = Parser.parse(utterance);
            world.printDebugInfo("Found " + parses.length + " parses");
            parses.forEach((result, n) => {
                world.printDebugInfo("  (" + n + ") " + Parser.stringify(result));
            });
        }
        catch(err) {
            world.printError("Parsing error", err);
            return;
        }

        // Interpretation
        try {
            var interpretations : Interpreter.Result[] = Interpreter.interpret(parses, world.currentState);
            world.printDebugInfo("Found " + interpretations.length + " interpretations");
            interpretations.forEach((result, n) => {
                world.printDebugInfo("  (" + n + ") " + Interpreter.stringify(result));
            });

            if (interpretations.length > 1) {
                // several interpretations were found -- how should this be handled?
                // should we throw an ambiguity error?
                // ... throw new Error("Ambiguous utterance");
                // or should we let the planner decide?
            }
        }
        catch(err) {
            world.printError("Interpretation error", err);
            return;
        }

        // Planning
        try {
            var plans : Planner.Result[] = Planner.plan(interpretations, world.currentState);
            world.printDebugInfo("Found " + plans.length + " plans");
            plans.forEach((result, n) => {
                world.printDebugInfo("  (" + n + ") " + Planner.stringify(result));
            });

            if (plans.length > 1) {
                // several plans were found -- how should this be handled?
                // this means that we have several interpretations,
                // should we throw an ambiguity error?
                // ... throw new Error("Ambiguous utterance");
                // or should we select the interpretation with the shortest plan?
                // ... plans.sort((a, b) => {return a.length - b.length});
            }
        }
        catch(err) {
            world.printError("Planning error", err);
            return;
        }

        var finalPlan : string[] = plans[0].plan;
        world.printDebugInfo("Final plan: " + finalPlan.join(", "));
        return finalPlan;
    }


    // This is a convenience function that recognizes strings
    // of the form "p r r d l p r d"

    export function splitStringIntoPlan(planstring : string) : string[] {
        var plan : string[] = planstring.trim().split(/\s+/);
        var actions : {[act:string] : string}
            = {p:"Picking", d:"Dropping", l:"Going left", r:"Going right"};
        for (var i = plan.length-1; i >= 0; i--) {
            if (!actions[plan[i]]) {
                return;
            }
            plan.splice(i, 0, actions[plan[i]]);
        }
        return plan;
    }

}
