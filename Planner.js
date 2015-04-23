var Planner = {};
(function (Planner) {
    function plan(interpretations, currentState) {
    }
	Planner.plan = plan;

	function planToString(res) {
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
})(Planner)
window.Planner = Planner;
