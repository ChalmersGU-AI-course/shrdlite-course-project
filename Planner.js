module.exports = 
    plan: function(interpretations, currentState) {
    },

	planToString: function(res) {
    },

	Error: function () {
        function Error(message) {
            this.message = message;
            this.name = "Planner.Error";
        }
        Error.prototype.toString = function () { return this.name + ": " + this.message; };
        return Error;
    }
}
