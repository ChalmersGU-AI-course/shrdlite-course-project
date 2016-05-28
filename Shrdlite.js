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
    function parseUtteranceIntoPlan(world, utterance) {
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses = Parser.parse(utterance);
            world.printDebugInfo("Found " + parses.length + " parses");
            parses.forEach(function (result, n) {
                world.printDebugInfo("  (" + n + ") " + Parser.stringify(result));
            });
        }
        catch (err) {
            world.printError("Parsing error", err);
            return;
        }
        try {
            if (parses[0].parse.command.substring(0, 2) === "Q_") {
                return [interpretQuestion(parses[0].parse)];
            }
            var interpretations = Interpreter.interpret(parses, world.currentState);
            world.printDebugInfo("Found " + interpretations.length + " interpretations");
            interpretations.forEach(function (result, n) {
                world.printDebugInfo("  (" + n + ") " + Interpreter.stringify(result));
            });
            if ((interpretations.length > 1) || (interpretations[0].interpretation.length > 1)) {
            }
        }
        catch (err) {
            world.printError("Interpretation error", err);
            return;
        }
        try {
            var plans = Planner.plan(interpretations, world.currentState);
            world.printDebugInfo("Found " + plans.length + " plans");
            plans.forEach(function (result, n) {
                world.printDebugInfo("  (" + n + ") " + Planner.stringify(result));
            });
            if (plans.length > 1) {
            }
        }
        catch (err) {
            world.printError("Planning error", err);
            return;
        }
        var finalPlan = plans[0].plan;
        world.printDebugInfo("Final plan: " + finalPlan.join(", "));
        return finalPlan;
    }
    Shrdlite.parseUtteranceIntoPlan = parseUtteranceIntoPlan;
    function splitStringIntoPlan(planstring) {
        var plan = planstring.trim().split(/\s+/);
        var actions = { p: "Picking", d: "Dropping", l: "Going left", r: "Going right" };
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
function Questions(world, interpretations) {
    world.printSystemOutput("Do you mean...");
    var iLiteral = 0;
    var literals;
    var interpretation;
    var nParses = interpretations.length;
    for (var iParse = 0; iParse < nParses; iParse++) {
        var nInterpretations = interpretations[iParse].interpretation.length;
        for (var iInterp = 0; iInterp < nInterpretations; iInterp++) {
            var nConj = interpretations[iParse].interpretation[iInterp].length;
            for (var iConj = 0; iConj < nConj; iConj++) {
                var thisLiteral;
                var rel = interpretations[iParse].interpretation[iInterp][iConj].relation;
                world.printSystemOutput(rel);
                var nArgs = interpretations[iParse].interpretation[iInterp][iConj].args.length;
                var arg;
                arg = interpretations[iParse].interpretation[iInterp][iConj].args;
                world.printSystemOutput("args:" + nArgs);
                world.printSystemOutput("left");
                for (var iArg = 0; iArg < nArgs; iArg++) {
                    arg[iArg] = interpretations[iParse].interpretation[iInterp][iConj].args[iArg];
                    world.printSystemOutput(arg[iArg]);
                    if (iArg == 0) {
                        thisLiteral = thisLiteral + arg[iArg] + rel;
                    }
                }
            }
            literals[iLiteral] = thisLiteral;
            world.printSystemOutput(thisLiteral);
        }
    }
    return interpretation = interpretations;
}
