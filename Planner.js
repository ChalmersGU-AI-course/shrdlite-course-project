///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
var Planner = {};


Planner.plan = function plan(interpretations, currentState) {
    window.debugstate = currentState.objects;
    var TMP_rules = [["e", "k"], ["l", "floor"]];
    var plans = [];
    for (var inter of interpretations) {
        inter.plan = window.plannerCore(currentState, TMP_rules);
        console.log(inter.plan);
        if (inter.plan == "impossible") {
            throw new Planner.Error("It is not possible to solve the problem");
        } else if (inter.plan === undefined) {
            continue;
        } else if (inter.plan.length === 1) {
            plans.push(["Already satisfied"]);
        } else {
            plans.push(inter);
        }

    }
    // interpretations.forEach(function (intprt) {
    //     var plan = intprt;
    //     plan.plan = planInterpretation(plan.intp, currentState);
    //     plans.push(plan);
    // });
    if (plans.length) {
        return plans;
    }
    else {
        throw new Planner.Error("Found no plans");
    }
};

Planner.planToString = function (res) {
    return res.plan.join(", ");
};


Planner.Error = (function () {
    function Error(message) {
        this.message = message;
        this.name = "Planner.Error";
    }
    Error.prototype.toString = function () { return this.name + ": " + this.message; };
    return Error;
})();
