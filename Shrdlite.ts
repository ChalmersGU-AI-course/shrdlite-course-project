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

    /*
    TODO

     var utterance;
     var world;

     async.waterfall([
     function(cb) {
     var parses = Parser.parse(utterance);
     cb(null, parses);
     },
     function(parses, cb) {
     var interpretations = Interpreter.interpret(parses);
     cb(null, interpretations);
     }
     ], function(err, interpretations) {
     async.forever(
     function(next) {
     world.readUserInput("xxx", function(input) {
     if (input) {
     next(input);
     } else {
     next();
     }
     });
     },
     function() {
     // TODO planner here
     }
     )
     })

     */

    //TODO convert the world to a pddl-world before sending it to interpreter and planner!
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

        var extendedState = extendWorldState(world.currentState);

        try {
            var interpretations : PddlLiteral[][][] = Interpreter.interpret(parses, extendedState);
        } catch(err) {
            if (err instanceof Interpreter.Error) {
                world.printError("Interpretation error", err.message);
                return;
            } else {
                throw err;
            }
        }

        /*
        // Ambiguity resolution?
        // TODO
        world.printSystemOutput("Found interpretations, count: "+interpretations.length);
        if (interpretations.length > 1) {
            world.printSystemOutput("Multiple interpretations found:");
            var interpretationStrings = _.map(interpretations, Interpreter.interpretationToString);
            _.each(interpretationStrings, world.printSystemOutput, world);
            // Loop until user has chosen one
            var interpretation = null;
            while (!interpretation) {
                // TODO does this even work? With callback etc?
                world.readUserInput("Which one did you mean?", function (i) {
                    if (i > 0 && i < interpretations.length) {
                        interpretation = interpretations[i];
                    } else {
                        world.printSystemOutput("Unfortunately, I didn't quite grasp that.");
                    }
                });
            }
        }
        */

        world.printDebugInfo("Found " + interpretations.length + " interpretations");
        interpretations.forEach((res, n) => {
            world.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
        });


        try {
            // TODO: use PddlLiteral[][][] as input to Planner.plan()
            var plans : Planner.Result[] = []; // Planner.plan(interpretations, extendedState);
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

        world.printError("Planner not done yet");
        return null;
        // TODO: return plans[0] here, as below
        /*
        var plan : string[] = plans[0].plan;
        world.printDebugInfo("Final plan: " + plan.join(", "));
        return plan;
        */
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
