module.exports = {
	interpret: function(parses, currentState) {
	},

	interpretationToString: function(res) {
	},

	literalToString: function(lit) {
	},

	Error: function() {
		function(message) {
			this.message = message;
			this.name = "Interpreter.Error";
		}
		Error.prototype.toString = function() { return this.name + ": " + this.message; };
		return Error;
	}
}
