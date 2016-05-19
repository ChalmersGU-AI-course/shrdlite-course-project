// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }


// Create a Javascript object by instantiating children
// Example:
// updateObject({a:2, b:{c:1, d:0}}, ['x', 'y', 'z'])
// ==> {a:'z', b:{c:'y', d:'x'}}

function updateObject(obj, children) {
    if (typeof obj == "object") {
        var result = obj.constructor();
        for (var key in obj) {
            result[key] = updateObject(obj[key], children);
        }
        return result;
    } else if (typeof obj == "number") {
        return children[obj];
    } else {
        return obj;
    }
}

// Wrapper function for updating Nearley parse results

function R(obj) {
    return function(d){return updateObject(obj, d)}
}

var grammar = {
    ParserRules: [
    {"name": "main$ebnf$1", "symbols": ["will_you"], "postprocess": id},
    {"name": "main$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "main$ebnf$2", "symbols": ["please"], "postprocess": id},
    {"name": "main$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "main$ebnf$3", "symbols": ["please"], "postprocess": id},
    {"name": "main$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "main", "symbols": ["main$ebnf$1", "main$ebnf$2", "command", "main$ebnf$3"], "postprocess": R(2)},
    {"name": "command", "symbols": ["take", "entity"], "postprocess": R({command:"take", entity:1})},
    {"name": "command", "symbols": ["move", "it", "location"], "postprocess": R({command:"put", location:2})},
    {"name": "command", "symbols": ["move", "entity", "location"], "postprocess": R({command:"move", entity:1, location:2})},
    {"name": "command", "symbols": ["where_is", "entity"], "postprocess": R({command:"where", entity:1})},
    {"name": "location", "symbols": ["relation", "entity"], "postprocess": R({relation:0, entity:1})},
    {"name": "entity", "symbols": ["quantifierSG", "objectSG"], "postprocess": R({quantifier:0, object:1})},
    {"name": "entity", "symbols": ["quantifierPL", "objectPL"], "postprocess": R({quantifier:0, object:1})},
    {"name": "objectSG$ebnf$1", "symbols": ["that_is"], "postprocess": id},
    {"name": "objectSG$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "objectSG", "symbols": ["objectSG", "objectSG$ebnf$1", "location"], "postprocess": R({object:0, location:2})},
    {"name": "objectPL$ebnf$1", "symbols": ["that_are"], "postprocess": id},
    {"name": "objectPL$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "objectPL", "symbols": ["objectPL", "objectPL$ebnf$1", "location"], "postprocess": R({object:0, location:2})},
    {"name": "objectSG$ebnf$2", "symbols": ["size"], "postprocess": id},
    {"name": "objectSG$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "objectSG$ebnf$3", "symbols": ["color"], "postprocess": id},
    {"name": "objectSG$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "objectSG", "symbols": ["objectSG$ebnf$2", "objectSG$ebnf$3", "formSG"], "postprocess": R({size:0, color:1, form:2})},
    {"name": "objectPL$ebnf$2", "symbols": ["size"], "postprocess": id},
    {"name": "objectPL$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "objectPL$ebnf$3", "symbols": ["color"], "postprocess": id},
    {"name": "objectPL$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "objectPL", "symbols": ["objectPL$ebnf$2", "objectPL$ebnf$3", "formPL"], "postprocess": R({size:0, color:1, form:2})},
    {"name": "quantifierSG$subexpression$1$string$1", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "quantifierSG$subexpression$1", "symbols": ["quantifierSG$subexpression$1$string$1"]},
    {"name": "quantifierSG$subexpression$1$string$2", "symbols": [{"literal":"a"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "quantifierSG$subexpression$1", "symbols": ["quantifierSG$subexpression$1$string$2"]},
    {"name": "quantifierSG$subexpression$1", "symbols": [{"literal":"a"}]},
    {"name": "quantifierSG", "symbols": ["quantifierSG$subexpression$1"], "postprocess": R("any")},
    {"name": "quantifierSG$subexpression$2$string$1", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "quantifierSG$subexpression$2", "symbols": ["quantifierSG$subexpression$2$string$1"]},
    {"name": "quantifierSG", "symbols": ["quantifierSG$subexpression$2"], "postprocess": R("the")},
    {"name": "quantifierSG$subexpression$3$string$1", "symbols": [{"literal":"e"}, {"literal":"v"}, {"literal":"e"}, {"literal":"r"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "quantifierSG$subexpression$3", "symbols": ["quantifierSG$subexpression$3$string$1"]},
    {"name": "quantifierSG", "symbols": ["quantifierSG$subexpression$3"], "postprocess": R("all")},
    {"name": "quantifierPL$subexpression$1$string$1", "symbols": [{"literal":"a"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "quantifierPL$subexpression$1", "symbols": ["quantifierPL$subexpression$1$string$1"]},
    {"name": "quantifierPL", "symbols": ["quantifierPL$subexpression$1"], "postprocess": R("all")},
    {"name": "relation$subexpression$1$string$1", "symbols": [{"literal":"l"}, {"literal":"e"}, {"literal":"f"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$1$string$2", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$1", "symbols": ["relation$subexpression$1$string$1", "relation$subexpression$1$string$2"]},
    {"name": "relation$subexpression$1$string$3", "symbols": [{"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$1$string$4", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$1$string$5", "symbols": [{"literal":"l"}, {"literal":"e"}, {"literal":"f"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$1$string$6", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$1", "symbols": ["relation$subexpression$1$string$3", "relation$subexpression$1$string$4", "relation$subexpression$1$string$5", "relation$subexpression$1$string$6"]},
    {"name": "relation", "symbols": ["relation$subexpression$1"], "postprocess": R("leftof")},
    {"name": "relation$subexpression$2$string$1", "symbols": [{"literal":"r"}, {"literal":"i"}, {"literal":"g"}, {"literal":"h"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$2$string$2", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$2", "symbols": ["relation$subexpression$2$string$1", "relation$subexpression$2$string$2"]},
    {"name": "relation$subexpression$2$string$3", "symbols": [{"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$2$string$4", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$2$string$5", "symbols": [{"literal":"r"}, {"literal":"i"}, {"literal":"g"}, {"literal":"h"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$2$string$6", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$2", "symbols": ["relation$subexpression$2$string$3", "relation$subexpression$2$string$4", "relation$subexpression$2$string$5", "relation$subexpression$2$string$6"]},
    {"name": "relation", "symbols": ["relation$subexpression$2"], "postprocess": R("rightof")},
    {"name": "relation$subexpression$3$string$1", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"s"}, {"literal":"i"}, {"literal":"d"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$3", "symbols": ["relation$subexpression$3$string$1"]},
    {"name": "relation$subexpression$3$string$2", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$3", "symbols": ["relation$subexpression$3$string$2"]},
    {"name": "relation$subexpression$3$string$3", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$3", "symbols": ["relation$subexpression$3$string$3"]},
    {"name": "relation", "symbols": ["relation$subexpression$3"], "postprocess": R("inside")},
    {"name": "relation$subexpression$4$string$1", "symbols": [{"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$4", "symbols": ["relation$subexpression$4$string$1"]},
    {"name": "relation$subexpression$4$string$2", "symbols": [{"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$4$string$3", "symbols": [{"literal":"t"}, {"literal":"o"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$4$string$4", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$4", "symbols": ["relation$subexpression$4$string$2", "relation$subexpression$4$string$3", "relation$subexpression$4$string$4"]},
    {"name": "relation", "symbols": ["relation$subexpression$4"], "postprocess": R("ontop")},
    {"name": "relation$subexpression$5$string$1", "symbols": [{"literal":"u"}, {"literal":"n"}, {"literal":"d"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$5", "symbols": ["relation$subexpression$5$string$1"]},
    {"name": "relation$subexpression$5$string$2", "symbols": [{"literal":"b"}, {"literal":"e"}, {"literal":"l"}, {"literal":"o"}, {"literal":"w"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$5", "symbols": ["relation$subexpression$5$string$2"]},
    {"name": "relation", "symbols": ["relation$subexpression$5"], "postprocess": R("under")},
    {"name": "relation$subexpression$6$string$1", "symbols": [{"literal":"b"}, {"literal":"e"}, {"literal":"s"}, {"literal":"i"}, {"literal":"d"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$6", "symbols": ["relation$subexpression$6$string$1"]},
    {"name": "relation", "symbols": ["relation$subexpression$6"], "postprocess": R("beside")},
    {"name": "relation$subexpression$7$string$1", "symbols": [{"literal":"a"}, {"literal":"b"}, {"literal":"o"}, {"literal":"v"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "relation$subexpression$7", "symbols": ["relation$subexpression$7$string$1"]},
    {"name": "relation", "symbols": ["relation$subexpression$7"], "postprocess": R("above")},
    {"name": "size$subexpression$1$string$1", "symbols": [{"literal":"s"}, {"literal":"m"}, {"literal":"a"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "size$subexpression$1", "symbols": ["size$subexpression$1$string$1"]},
    {"name": "size$subexpression$1$string$2", "symbols": [{"literal":"t"}, {"literal":"i"}, {"literal":"n"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "size$subexpression$1", "symbols": ["size$subexpression$1$string$2"]},
    {"name": "size", "symbols": ["size$subexpression$1"], "postprocess": R("small")},
    {"name": "size$subexpression$2$string$1", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"r"}, {"literal":"g"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "size$subexpression$2", "symbols": ["size$subexpression$2$string$1"]},
    {"name": "size$subexpression$2$string$2", "symbols": [{"literal":"b"}, {"literal":"i"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "size$subexpression$2", "symbols": ["size$subexpression$2$string$2"]},
    {"name": "size", "symbols": ["size$subexpression$2"], "postprocess": R("large")},
    {"name": "color$string$1", "symbols": [{"literal":"b"}, {"literal":"l"}, {"literal":"a"}, {"literal":"c"}, {"literal":"k"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "color", "symbols": ["color$string$1"], "postprocess": R("black")},
    {"name": "color$string$2", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"i"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "color", "symbols": ["color$string$2"], "postprocess": R("white")},
    {"name": "color$string$3", "symbols": [{"literal":"b"}, {"literal":"l"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "color", "symbols": ["color$string$3"], "postprocess": R("blue")},
    {"name": "color$string$4", "symbols": [{"literal":"g"}, {"literal":"r"}, {"literal":"e"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "color", "symbols": ["color$string$4"], "postprocess": R("green")},
    {"name": "color$string$5", "symbols": [{"literal":"y"}, {"literal":"e"}, {"literal":"l"}, {"literal":"l"}, {"literal":"o"}, {"literal":"w"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "color", "symbols": ["color$string$5"], "postprocess": R("yellow")},
    {"name": "color$string$6", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "color", "symbols": ["color$string$6"], "postprocess": R("red")},
    {"name": "formSG", "symbols": ["form"], "postprocess": R(0)},
    {"name": "formPL", "symbols": ["form", {"literal":"s"}], "postprocess": R(0)},
    {"name": "formSG$string$1", "symbols": [{"literal":"b"}, {"literal":"o"}, {"literal":"x"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "formSG", "symbols": ["formSG$string$1"], "postprocess": R("box")},
    {"name": "formPL$string$1", "symbols": [{"literal":"b"}, {"literal":"o"}, {"literal":"x"}, {"literal":"e"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "formPL", "symbols": ["formPL$string$1"], "postprocess": R("box")},
    {"name": "form$subexpression$1$string$1", "symbols": [{"literal":"o"}, {"literal":"b"}, {"literal":"j"}, {"literal":"e"}, {"literal":"c"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form$subexpression$1", "symbols": ["form$subexpression$1$string$1"]},
    {"name": "form$subexpression$1$string$2", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"i"}, {"literal":"n"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form$subexpression$1", "symbols": ["form$subexpression$1$string$2"]},
    {"name": "form$subexpression$1$string$3", "symbols": [{"literal":"f"}, {"literal":"o"}, {"literal":"r"}, {"literal":"m"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form$subexpression$1", "symbols": ["form$subexpression$1$string$3"]},
    {"name": "form", "symbols": ["form$subexpression$1"], "postprocess": R("anyform")},
    {"name": "form$string$1", "symbols": [{"literal":"b"}, {"literal":"r"}, {"literal":"i"}, {"literal":"c"}, {"literal":"k"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form", "symbols": ["form$string$1"], "postprocess": R("brick")},
    {"name": "form$string$2", "symbols": [{"literal":"p"}, {"literal":"l"}, {"literal":"a"}, {"literal":"n"}, {"literal":"k"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form", "symbols": ["form$string$2"], "postprocess": R("plank")},
    {"name": "form$string$3", "symbols": [{"literal":"b"}, {"literal":"a"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form", "symbols": ["form$string$3"], "postprocess": R("ball")},
    {"name": "form$string$4", "symbols": [{"literal":"p"}, {"literal":"y"}, {"literal":"r"}, {"literal":"a"}, {"literal":"m"}, {"literal":"i"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form", "symbols": ["form$string$4"], "postprocess": R("pyramid")},
    {"name": "form$string$5", "symbols": [{"literal":"t"}, {"literal":"a"}, {"literal":"b"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form", "symbols": ["form$string$5"], "postprocess": R("table")},
    {"name": "form$string$6", "symbols": [{"literal":"f"}, {"literal":"l"}, {"literal":"o"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "form", "symbols": ["form$string$6"], "postprocess": R("floor")},
    {"name": "take$string$1", "symbols": [{"literal":"t"}, {"literal":"a"}, {"literal":"k"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "take", "symbols": ["take$string$1"]},
    {"name": "take$string$2", "symbols": [{"literal":"g"}, {"literal":"r"}, {"literal":"a"}, {"literal":"s"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "take", "symbols": ["take$string$2"]},
    {"name": "take$string$3", "symbols": [{"literal":"p"}, {"literal":"i"}, {"literal":"c"}, {"literal":"k"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "take$string$4", "symbols": [{"literal":"u"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "take", "symbols": ["take$string$3", "take$string$4"]},
    {"name": "move$string$1", "symbols": [{"literal":"m"}, {"literal":"o"}, {"literal":"v"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "move", "symbols": ["move$string$1"]},
    {"name": "move$string$2", "symbols": [{"literal":"p"}, {"literal":"u"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "move", "symbols": ["move$string$2"]},
    {"name": "move$string$3", "symbols": [{"literal":"d"}, {"literal":"r"}, {"literal":"o"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "move", "symbols": ["move$string$3"]},
    {"name": "it$string$1", "symbols": [{"literal":"i"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "it", "symbols": ["it$string$1"]},
    {"name": "that_is$string$1", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "that_is$string$2", "symbols": [{"literal":"i"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "that_is", "symbols": ["that_is$string$1", "that_is$string$2"]},
    {"name": "that_are$string$1", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "that_are$string$2", "symbols": [{"literal":"a"}, {"literal":"r"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "that_are", "symbols": ["that_are$string$1", "that_are$string$2"]},
    {"name": "will_you$subexpression$1$string$1", "symbols": [{"literal":"w"}, {"literal":"i"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "will_you$subexpression$1", "symbols": ["will_you$subexpression$1$string$1"]},
    {"name": "will_you$subexpression$1$string$2", "symbols": [{"literal":"c"}, {"literal":"a"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "will_you$subexpression$1", "symbols": ["will_you$subexpression$1$string$2"]},
    {"name": "will_you$subexpression$1$string$3", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"u"}, {"literal":"l"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "will_you$subexpression$1", "symbols": ["will_you$subexpression$1$string$3"]},
    {"name": "will_you$string$1", "symbols": [{"literal":"y"}, {"literal":"o"}, {"literal":"u"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "will_you", "symbols": ["will_you$subexpression$1", "will_you$string$1"]},
    {"name": "please$string$1", "symbols": [{"literal":"p"}, {"literal":"l"}, {"literal":"e"}, {"literal":"a"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "please", "symbols": ["please$string$1"]},
    {"name": "where_is$string$1", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"e"}, {"literal":"r"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "where_is$string$2", "symbols": [{"literal":"i"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "where_is", "symbols": ["where_is$string$1", "where_is$string$2"]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
