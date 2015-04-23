var Interpreter = {};
(function(Interpreter) {
	function interpret(parses, currentState) {
	}
	Interpreter.interpret = interpret;

	function interpretationToString(res) {
	}
	Interpreter.interpretationToString = interpretationToString;

	function literalToString(lit) {
	}
	Interpreter.literalToString = literalToString;

	var Error = (function() {
		function Error(message) {
			this.message = message;
			this.name = "Interpreter.Error";
		}
		Error.prototype.toString = function() { return this.name + ": " + this.message; };
		return Error;
	})();
	Interpreter.Error = Error;
})(Interpreter)
window.Interpreter = Interpreter;
