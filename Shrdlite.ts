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
                        var question = "Do you mean ";
                        var index = world.currentState.ambiguousObjs.length-1;
                        if (index != 0){
                            index = 1; // always refine from head !
                            // since now refinement system doesn't really work on loc;
                            // we want user to refine ent (which happened before loc)
                        }
                        world.currentState.ambiguousObjs[index].forEach((obj) => {
                            question = question + Parser.objToString(obj) + " ? ";
                        });

                        // clear up status or we will always come back here
                        world.currentState.status = [];
                        world.currentState.ambiguousObjs = [[]];
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

    function mergeCmd(world : World, previousCmd : Parser.Result[], utterance : string ) : Parser.Result[] {
        try {
            var parses : Parser.Result[] = Parser.parse(utterance);
        } catch (err) {
                if (err instanceof Parser.Error) {
                    // TODO findout if we should be updating loc or ent?
                   var newInfo = utterance.toLowerCase().replace(/\W/g, "");
                    var newResult : Parser.Result[] = [];
                    var index = previousCmd.length - 1;
                    // if(previousCmd[index].prs.ent){
                    //         world.printSystemOutput(
                    //             Parser.objToString(previousCmd[index].prs.ent.obj));
                    // } // for DEBUG
                    switch (newInfo){
                    case "small":
                    case "tiny" :{
                        if (!previousCmd[index].prs.ent.obj.size){
                            previousCmd[index].prs.ent.obj.size = "small";
                            newResult.push(previousCmd[index]);
                            return newResult;
                        } else {
                            return previousCmd;
                        }
                    }
                    case "large":
                    case "big" :{
                        if (!previousCmd[index].prs.ent.obj.size){
                            previousCmd[index].prs.ent.obj.size = "large";
                            newResult.push(previousCmd[index]);
                            return newResult;
                        } else {
                            return previousCmd;
                        }

                    }
                    case "black" :
                    case "white" :
                    case "green" :
                    case "yellow" :
                    case "red" :
                    case "blue" :{
                        if (!previousCmd[index].prs.ent.obj.color){
                            previousCmd[index].prs.ent.obj.color = newInfo;
                            newResult.push(previousCmd[index]);
                            return newResult;
                        } else {
                            return previousCmd;
                        }
                    }
                    // Experimental
                    case "brick":
                    case "box":
                    case "plank":
                    case "pyramid":
                    case "table":
                    case "ball" :{
                        if ( previousCmd[index].prs.ent.obj.form == "anyform"){
                            previousCmd[index].prs.ent.obj.form = newInfo;
                            newResult.push(previousCmd[index]);
                            return newResult;
                        } else {
                            return previousCmd;
                        }
                    }

                    default:
                        return previousCmd;
                    }
                } else {
                    throw err;
                }
        }
        return parses;
}

    export function parseUtteranceIntoPlan(world : World, utterance : string) : string[] {
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        if (world.currentState.previousCmd !== null) {
            var index = world.currentState.previousCmd.length -1 ;
            world.printSystemOutput("I've remembered you said: "
                                + world.currentState.previousCmd[index].input);
            // since .input never gets updated; now seems bit silly
            var parses = mergeCmd(world, world.currentState.previousCmd, utterance);
        }
        else {
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
                world.printSystemOutput("There are multiple valid interpretation");
                world.printSystemOutput("But I am lazy and only performs minimum plan");
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
