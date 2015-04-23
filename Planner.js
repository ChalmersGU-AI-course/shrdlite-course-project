///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
var Planner;
(function (Planner) {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    function plan(interpretations, currentState) {
        var plans = [];
        interpretations.forEach(function (intprt) {
            var plan = intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        }
        else {
            throw new Planner.Error("Found no plans");
        }
    }
    Planner.plan = plan;
    function planToString(res) {
        return res.plan.join(", ");
    }
    Planner.planToString = planToString;
    var Error = (function () {
        function Error(message) {
            this.message = message;
            this.name = "Planner.Error";
        }
        Error.prototype.toString = function () { return this.name + ": " + this.message; };
        return Error;
    })();
    Planner.Error = Error;
    //////////////////////////////////////////////////////////////////////
    // private functions
    function planInterpretation(intprt, state) {
        // This function returns a dummy plan involving a random stack
        do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan = [];
        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        }
        else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }
        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length - 1];
        plan.push("Picking up the " + state.objects[obj].form, "p");
        if (pickstack < state.stacks.length - 1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length - 1; i++) {
                plan.push("r");
            }
            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length - 1; i > pickstack; i--) {
                plan.push("l");
            }
        }
        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form, "d");
        return plan;
    }
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
})(Planner || (Planner = {}));
