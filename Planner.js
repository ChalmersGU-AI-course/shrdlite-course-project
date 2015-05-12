///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
var Planner = {};

Planner.plan = function plan(interpretations, currentState) {
    var plans = [];
    for (var inter of interpretations) {
        inter.plan = ["r", "r", "l"];
        plans.push(inter);
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
