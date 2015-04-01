///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>
var Shrdlite;
(function (Shrdlite) {
    function interactive(world) {
        function endlessLoop(utterance) {
            if (utterance === void 0) { utterance = ""; }
            var inputPrompt = "What can I do for you today? ";
            var nextInput = function () { return world.readUserInput(inputPrompt, endlessLoop); };
            if (utterance.trim()) {
                var plan = splitStringIntoPlan(utterance);
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
    Shrdlite.interactive = interactive;
    // Generic function that takes an utterance and returns a plan:
    // - first it parses the utterance
    // - then it interprets the parse(s)
    // - then it creates plan(s) for the interpretation(s)
    function parseUtteranceIntoPlan(world, utterance) {
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses = Parser.parse(utterance);
        }
        catch (err) {
            if (err instanceof Parser.Error) {
                world.printError("Parsing error", err.message);
                return;
            }
            else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + parses.length + " parses");
        parses.forEach(function (res, n) {
            world.printDebugInfo("  (" + n + ") " + Parser.parseToString(res));
        });
        try {
            var interpretations = Interpreter.interpret(parses, world.currentState);
        }
        catch (err) {
            if (err instanceof Interpreter.Error) {
                world.printError("Interpretation error", err.message);
                return;
            }
            else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + interpretations.length + " interpretations");
        interpretations.forEach(function (res, n) {
            world.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
        });
        try {
            var plans = Planner.plan(interpretations, world.currentState);
        }
        catch (err) {
            if (err instanceof Planner.Error) {
                world.printError("Planning error", err.message);
                return;
            }
            else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + plans.length + " plans");
        plans.forEach(function (res, n) {
            world.printDebugInfo("  (" + n + ") " + Planner.planToString(res));
        });
        var plan = plans[0].plan;
        world.printDebugInfo("Final plan: " + plan.join(", "));
        return plan;
    }
    Shrdlite.parseUtteranceIntoPlan = parseUtteranceIntoPlan;
    // This is a convenience function that recognizes strings
    // of the form "p r r d l p r d"
    function splitStringIntoPlan(planstring) {
        var plan = planstring.trim().split(/\s+/);
        var actions = { p: "pick", d: "drop", l: "left", r: "right" };
        for (var i = plan.length - 1; i >= 0; i--) {
            if (!actions[plan[i]]) {
                return;
            }
            plan.splice(i, 0, actions[plan[i]]);
        }
        return plan;
    }
    Shrdlite.splitStringIntoPlan = splitStringIntoPlan;
})(Shrdlite || (Shrdlite = {}));
