///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
var Interpreter = {};

Interpreter.interpret = function(parses, currentState) {
    console.log(JSON.stringify(currentState, null, 2));
    var ret = [];
    for (var x of parses) {
        try {
            ret = ret.concat(window.interpreterCore(currentState, x.prs));
        } catch (err) {
            console.log("Interpreter exception: " + err);
        }
    }
    if (ret.length === 0) {
        throw new Interpreter.Error("Ambigious query, please be more precise.");
    }
    return ret;
    // throw new Interpreter.Error("Found no interpretation");
    // return [[{rel: 'ontop', item: 'e', oneof: ['k']}]];
};


Interpreter.interpretationToString = function(res) {
      return res.intp.map(function (lits) {
        return lits.map(function (lit) { return literalToString(lit); }).join(" & ");
    }).join(" | ");
};

Interpreter.literalToString = function(lit) {
    return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
};


Interpreter.Error = (function () {
        function Error(message) {
            this.message = message;
            this.name = "Interpreter.Error";
        }
        Error.prototype.toString = function () { return this.name + ": " + this.message; };
        return Error;
    })();
