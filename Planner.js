///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
var Planner = {};


Planner.plan = function plan(interpretations, currentState) {
    window.debugstate = currentState.objects;
    var plans = [];
    for (var inter of interpretations) {
        inter.plan = window.plannerCore(currentState, inter);
        console.log(inter.plan);
        if (inter.plan === undefined) {
            continue;
        } else if (inter.plan.length === 0) {
            throw new Planner.Error("It is already satisfied");
            // plans.push(["Already satisfied"]);
        } else {
            plans.push(inter);
        }
        break;

    }
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
