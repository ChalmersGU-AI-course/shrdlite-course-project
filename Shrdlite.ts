///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>
///<reference path="tests/WorldStateTest.ts"/>

module Shrdlite {

    export function interactive(world : World, searchStrategy : string) : void {
        function endlessLoop(utterance : string = "") : void {
            var inputPrompt = "What can I do for you today? ";
            var nextInput = () => world.readUserInput(inputPrompt, endlessLoop);
            if (utterance.trim()) {
                var plan : string[] = splitStringIntoPlan(utterance);
                if (!plan) {
                    plan = parseUtteranceIntoPlan(world, utterance, searchStrategy);
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

    export function parseUtteranceIntoPlan(world : World, utterance : string, searchStrategy : string) : string[] {
        runTests();
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
        /*parses.forEach((res, n) => {
            world.printDebugInfo("  (" + n + ") " + Parser.parseToString(res));
        });*/

        try {
            var interpretations : Interpreter.Result[] = Interpreter.interpret(parses, world.currentState);
        } catch(err) {
            if (err instanceof Interpreter.Error) {
                world.printError("Interpretation error: ", err.message);
                return;
            } else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + interpretations.length + " interpretations");
        interpretations.forEach((res, n) => {
            world.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
        });

        try {
            var plans : Planner.Result[] = Planner.plan(interpretations, world.currentState, searchStrategy);
        } catch(err) {
            if (err instanceof Planner.Error) {
                world.printError("Planning error", err.message);
                return;
            } else {
                throw err;
            }
        }
        
        var finalPlan : string[] = [];
        // Selecting the shortest plan
        if(plans.length>1){
            finalPlan.push("\nThe utterance was ambiguous. There are "+plans.length+" ways possible actions for that query.");
            finalPlan.push("And I will perform the fastest one.");
        } 
        var shortestIndex = 0;
        var shortestPath = 100000;
        var length = 10000000;
        for (var i = 0; i < plans.length; i++) {
            var p : Planner.Step[] = plans[i].plan.filter(p => p.explanation.length>0);
            var newLength = p.length;
            if(newLength<length){
                shortestIndex = i;
                length = newLength;
            }
        }
        
        //Constructing a string array to pass on. 
        var plan : Planner.Step[] = plans[shortestIndex].plan;
        finalPlan.push("\n The plan consists of "+(length-1)+" moves.");
        plan.map(s=> {
            finalPlan.push(s.plan);
            finalPlan.push(s.explanation);
        });
        return finalPlan;
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

    function runTests() {
        var test = new tsUnit.Test(WorldStateTests);

        console.log((test.run().errors.length === 0) ? 'Test Passed' : 'Test Failed')
    }
}
