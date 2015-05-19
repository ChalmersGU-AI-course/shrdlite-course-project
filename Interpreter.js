// Interface definitions for worlds
///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>
var Parser;
(function (Parser) {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    function parse(input) {
        var nearleyParser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
        var parsestr = input.toLowerCase().replace(/\W/g, "");
        try {
            var results = nearleyParser.feed(parsestr).results;
        }
        catch (err) {
            if ('offset' in err) {
                throw new Parser.Error('Parsing failed after ' + err.offset + ' characters', err.offset);
            }
            else {
                throw err;
            }
        }
        if (!results.length) {
            throw new Parser.Error('Incomplete input', parsestr.length);
        }
        return results.map(function (c) {
            return { input: input, prs: clone(c) };
        });
    }
    Parser.parse = parse;
    function parseToString(res) {
        return JSON.stringify(res.prs);
    }
    Parser.parseToString = parseToString;
    var Error = (function () {
        function Error(message, offset) {
            this.message = message;
            this.offset = offset;
            this.name = "Parser.Error";
        }
        Error.prototype.toString = function () {
            return this.name + ": " + this.message;
        };
        return Error;
    })();
    Parser.Error = Error;
    //////////////////////////////////////////////////////////////////////
    // Utilities
    function clone(obj) {
        if (obj != null && typeof obj == "object") {
            var result = obj.constructor();
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = clone(obj[key]);
                }
            }
            return result;
        }
        else {
            return obj;
        }
    }
})(Parser || (Parser = {}));
if (typeof require !== 'undefined') {
    // Node.JS way of importing external modules
    // In a browser, they must be included from the HTML file
    var nearley = require('./lib/nearley.js');
    var grammar = require('./grammar.js');
}
///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
var Interpreter;
(function (Interpreter) {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    function interpret(parses, currentState) {
        var interpretations = [];
        parses.forEach(function (parseresult) {
            var intprt = parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp.length > 0)
                interpretations.push(intprt);
        });
        if (interpretations.length == 1) {
            return interpretations;
        }
        else if (interpretations.length > 1) {
            console.log(interpretationToString(interpretations[0]));
            console.log(interpretationToString(interpretations[1]));
            throw new Interpreter.Error("Ambigous interpretation");
        }
        else {
            throw new Interpreter.Error("Found no interpretation");
        }
    }
    Interpreter.interpret = interpret;
    function interpretationToString(res) {
        return res.intp.map(function (lits) {
            return lits.map(function (lit) { return literalToString(lit); }).join(" & ");
        }).join(" | ");
    }
    Interpreter.interpretationToString = interpretationToString;
    function literalToString(lit) {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }
    Interpreter.literalToString = literalToString;
    var Error = (function () {
        function Error(message) {
            this.message = message;
            this.name = "Interpreter.Error";
        }
        Error.prototype.toString = function () {
            return this.name + ": " + this.message;
        };
        return Error;
    })();
    Interpreter.Error = Error;
    //////////////////////////////////////////////////////////////////////
    // private functions
    function interpretCommand(cmd, state) {
        var intprt = [];
        if (cmd.cmd === "take") {
            var entities = interpretEntity(cmd.ent, state);
            entities.forEach(function (ent) {
                if (ent === "floor")
                    throw new Error("I cannot pickup the floor");
                intprt.push([{ pol: true, rel: "holding", args: [ent] }]);
            });
        }
        else if (cmd.cmd === "move") {
            var entity = interpretEntity(cmd.ent, state);
            var locati = interpretLocation(cmd.loc, state);
            var tmp = [];
            for (var i = 0; i < entity.length; i++) {
                for (var j = 0; j < locati.length; j++) {
                    if (entity[i] === "floor")
                        throw new Error("I cannot pickup the floor");
                    else
                        tmp.push([entity[i], locati[j]]);
                }
            }
            tmp.forEach(function (elem) {
                intprt.push([{ pol: true, rel: cmd.loc.rel, args: elem }]);
            });
        }
        else if (cmd.cmd === "put") {
            var locati = interpretLocation(cmd.loc, state);
            if (state.holding) {
                locati.forEach(function (locElem) {
                    intprt.push([{ pol: true, rel: cmd.loc.rel, args: [state.holding, locElem] }]);
                });
            }
            else
                throw new Error("Cannot put down something I am not holding");
        }
        return intprt;
    }
    function interpretEntity(ent, state) {
        var objs = interpretObject(ent.obj, state);
        var intprt = [];
        console.log(objs);
        if (ent.quant === "any") {
            objs.forEach(function (elem) {
                intprt.push(elem);
            });
        }
        else if (ent.quant === "the") {
            if (objs.length == 1)
                intprt.push(objs[0]);
        }
        else if (ent.quant == "all") {
            throw new Error("Not Implemented Yet: all quantifier");
        }
        else
            throw new Error("unknown quantifier");
        return intprt;
    }
    /*
    assuming we only get the structures {obj, loc} or {size?, color?, form}
    from parameter obj.(This should be the case according to the website)
    */
    function interpretObject(obj, state) {
        if (obj.obj && obj.loc) {
            return interpretComplexObject(obj, state);
        }
        else {
            return interpretSimpleObject(obj, state);
        }
    }
    function interpretLocation(loc, state) {
        var entity = interpretEntity(loc.ent, state);
        switch (loc.rel) {
            case "leftof":
                return entity.filter(function (e) {
                    return validLeftof(e, state);
                });
                break;
            case "rightof":
                return entity.filter(function (e) {
                    return validRightof(e, state);
                });
                break;
            case "inside":
                return entity.filter(function (e) {
                    return validInside(e, state);
                });
                break;
            case "ontop":
                return entity.filter(function (e) {
                    return validOntop(e, state);
                });
                break;
            case "under":
                return entity.filter(function (e) {
                    return validUnder(e, state);
                });
                break;
            case "beside":
                return entity.filter(function (e) {
                    return validBeside(e, state);
                });
                break;
            case "above":
                return entity.filter(function (e) {
                    return validAbove(e, state);
                });
                break;
            default:
                throw new Error("Unknown location");
        }
    }
    // obj = {size?, color?, form}
    // returns all matching objects from the stack
    // could probably be optimized
    function interpretSimpleObject(obj, state) {
        var valid = [];
        var objs = Array.prototype.concat.apply([], state.stacks);
        // do we really need to check the whole state if the given object is floor?
        if (obj.form === "floor") {
            valid.push("floor");
            return valid;
        }
        // if the form is of any form we dont check if the form match
        // otherwise we do check if the form match
        if (obj.form === "anyform") {
            // if size an color are given we use them
            if (obj.size && obj.color) {
                objs.forEach(function (o) {
                    if (checkSize(obj, state.objects[o]) && checkColor(obj, state.objects[o])) {
                        valid.push(o);
                    }
                });
            }
            else if (obj.size) {
                objs.forEach(function (o) {
                    if (checkSize(obj, state.objects[o])) {
                        valid.push(o);
                    }
                });
            }
            else if (obj.color) {
                objs.forEach(function (o) {
                    if (checkColor(obj, state.objects[o])) {
                        valid.push(o);
                    }
                });
            }
            else {
                objs.forEach(function (o) {
                    valid.push(o);
                });
            }
        }
        else {
            // if size an color are given we use them
            if (obj.size && obj.color) {
                objs.forEach(function (o) {
                    if (checkSize(obj, state.objects[o]) && checkColor(obj, state.objects[o]) && checkForm(obj, state.objects[o])) {
                        valid.push(o);
                    }
                });
            }
            else if (obj.size) {
                objs.forEach(function (o) {
                    if (checkSize(obj, state.objects[o]) && checkForm(obj, state.objects[o])) {
                        valid.push(o);
                    }
                });
            }
            else if (obj.color) {
                objs.forEach(function (o) {
                    if (checkColor(obj, state.objects[o]) && checkForm(obj, state.objects[o])) {
                        valid.push(o);
                    }
                });
            }
            else {
                objs.forEach(function (o) {
                    if (checkForm(obj, state.objects[o])) {
                        valid.push(o);
                    }
                });
            }
        }
        return valid;
    }
    // obj =  {obj , loc}
    // TODO: this is where I stopped last time, quite a mess.
    function interpretComplexObject(obj, state) {
        var immObjs = interpretObject(obj.obj, state);
        var posObjs = interpretLocation(obj.loc, state);
        var intprt = [];
        // posObjs should give us a list of all object where the location is possible 
        // now we should check with immObjs and see if they match up in the state.stacks
        if (obj.loc.rel === "leftof") {
            immObjs.forEach(function (o) {
                posObjs.forEach(function (e) {
                    if (isLeftof(o, e, state))
                        intprt.push(o);
                });
            });
        }
        else if (obj.loc.rel === "rightof") {
            immObjs.forEach(function (o) {
                posObjs.forEach(function (e) {
                    if (isRightof(o, e, state))
                        intprt.push(o);
                });
            });
        }
        else if (obj.loc.rel === "inside") {
            immObjs.forEach(function (o) {
                posObjs.forEach(function (e) {
                    if (isInside(o, e, state))
                        intprt.push(o);
                });
            });
        }
        else if (obj.loc.rel === "ontop") {
            immObjs.forEach(function (o) {
                posObjs.forEach(function (e) {
                    if (isOntop(o, e, state))
                        intprt.push(o);
                });
            });
        }
        else if (obj.loc.rel === "under") {
            immObjs.forEach(function (o) {
                posObjs.forEach(function (e) {
                    if (isUnder(o, e, state))
                        intprt.push(o);
                });
            });
        }
        else if (obj.loc.rel === "beside") {
            immObjs.forEach(function (o) {
                posObjs.forEach(function (e) {
                    if (isBeside(o, e, state))
                        intprt.push(o);
                });
            });
        }
        else if (obj.loc.rel === "above") {
            immObjs.forEach(function (o) {
                posObjs.forEach(function (e) {
                    if (isAbove(o, e, state))
                        intprt.push(o);
                });
            });
        }
        return intprt;
    }
    function checkColor(a, b) {
        if (a.color === b.color)
            return true;
        else
            return false;
    }
    function checkSize(a, b) {
        if (a.size === b.size)
            return true;
        else
            return false;
    }
    function checkForm(a, b) {
        if (a.form === b.form)
            return true;
        else
            return false;
    }
    function validLeftof(obj, state) {
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) < state.stacks.length - 1) {
                flag = true;
            }
        });
        return flag;
    }
    function validRightof(obj, state) {
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) >= 0) {
                flag = true;
            }
        });
        return flag;
    }
    function validInside(obj, state) {
        if (state.objects[obj].form === "box")
            return true;
        else
            return false;
    }
    function validOntop(obj, state) {
        if (obj === "floor")
            return true;
        else if (state.objects[obj].form === "box" || state.objects[obj].form === "ball")
            return false;
        else
            return true;
    }
    function validUnder(obj, state) {
        if (obj === "floor")
            return false;
        else
            return true;
    }
    function validBeside(obj, state) {
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(obj) >= 0 && state.stacks.indexOf(stack) + 1 <= state.stacks.length && state.stacks.indexOf(stack) - 1 >= 0) {
                flag = true;
            }
        });
        return flag;
    }
    function validAbove(obj, state) {
        if (obj === "ball")
            return false;
        else
            return true;
    }
    function isLeftof(a, b, state) {
        var stackIndex;
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(b) >= 0)
                stackIndex = state.stacks.indexOf(stack);
        });
        for (var i = 0; i < stackIndex; i++) {
            if (state.stacks[i].indexOf(a) >= 0)
                flag = true;
        }
        return flag;
    }
    function isRightof(a, b, state) {
        var stackIndex;
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(b) >= 0)
                stackIndex = state.stacks.indexOf(stack);
        });
        for (var i = stackIndex + 1; i < state.stacks.length; i++) {
            if (state.stacks[i].indexOf(a) >= 0)
                flag = true;
        }
        return flag;
    }
    function isInside(a, b, state) {
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 && stack.indexOf(a) > stack.indexOf(b) && stack.indexOf(a) - stack.indexOf(b) == 1)
                flag = true;
        });
        return flag;
    }
    function isOntop(a, b, state) {
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (b === "floor" && stack.indexOf(a) == 0)
                flag = true;
            else if (stack.indexOf(a) >= 0 && stack.indexOf(b) >= 0 && stack.indexOf(a) - stack.indexOf(b) == 1)
                flag = true;
        });
        return flag;
    }
    function isUnder(a, b, state) {
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 && stack.indexOf(a) < stack.indexOf(b))
                flag = true;
        });
        return flag;
    }
    function isBeside(a, b, state) {
        var stackIndex;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(b) >= 0)
                stackIndex = state.stacks.indexOf(stack);
        });
        if (state.stacks[stackIndex + 1].indexOf(a) >= 0)
            return true;
        if (state.stacks[stackIndex - 1].indexOf(a) >= 0)
            return true;
        return false;
    }
    function isAbove(a, b, state) {
        var flag = false;
        state.stacks.forEach(function (stack) {
            if (stack.indexOf(b) >= 0 && stack.indexOf(a) >= 0 && stack.indexOf(a) > stack.indexOf(b))
                flag = true;
        });
        return flag;
    }
})(Interpreter || (Interpreter = {}));
