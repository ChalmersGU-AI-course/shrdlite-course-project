///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
var Planner = {};


Planner.plan = function plan(interpretations, currentState) {
    window.debugstate = currentState.objects;
    // var TMP_rules = [{rel: "ontop", args: ["e", "k"]},
    //                 {rel: "ontop", args: ["l", "floor"]}];
    // var TMP_rules = [{rel: 'ontop', item:'e', oneof:['k']},
    //                  {rel: 'floor', item:'l'}
    //                 ];
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
