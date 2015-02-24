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
    {"name": "main", "symbols": [" ebnf$1", " ebnf$2", "command", " ebnf$3"], "postprocess":  R(2) },
    {"name": "command", "symbols": ["take", "entity"], "postprocess":  R({cmd:"take", ent:1}) },
    {"name": "command", "symbols": ["move", "it", "location"], "postprocess":  R({cmd:"put", loc:2}) },
    {"name": "command", "symbols": ["move", "entity", "location"], "postprocess":  R({cmd:"move", ent:1, loc:2}) },
    {"name": "location", "symbols": ["relation", "entity"], "postprocess":  R({rel:0, ent:1}) },
    {"name": "entity", "symbols": ["quantifierSG", "objectSG"], "postprocess":  R({quant:0, obj:1}) },
    {"name": "entity", "symbols": ["quantifierPL", "objectPL"], "postprocess":  R({quant:0, obj:1}) },
    {"name": "objectSG", "symbols": ["objectSG", " ebnf$4", "location"], "postprocess":  R({obj:0, loc:2}) },
    {"name": "objectPL", "symbols": ["objectPL", " ebnf$5", "location"], "postprocess":  R({obj:0, loc:2}) },
    {"name": "objectSG", "symbols": [" ebnf$6", " ebnf$7", "formSG"], "postprocess":  R({size:0, color:1, form:2}) },
    {"name": "objectPL", "symbols": [" ebnf$8", " ebnf$9", "formPL"], "postprocess":  R({size:0, color:1, form:2}) },
    {"name": "quantifierSG", "symbols": [" subexpression$10"], "postprocess":  R("any") },
    {"name": "quantifierSG", "symbols": [" subexpression$11"], "postprocess":  R("the") },
    {"name": "quantifierSG", "symbols": [" subexpression$12"], "postprocess":  R("all") },
    {"name": "quantifierPL", "symbols": [" subexpression$13"], "postprocess":  R("all") },
    {"name": "relation", "symbols": [" subexpression$14"], "postprocess":  R("leftof") },
    {"name": "relation", "symbols": [" subexpression$15"], "postprocess":  R("rightof") },
    {"name": "relation", "symbols": [" subexpression$16"], "postprocess":  R("inside") },
    {"name": "relation", "symbols": [" subexpression$17"], "postprocess":  R("ontop") },
    {"name": "relation", "symbols": [" subexpression$18"], "postprocess":  R("under") },
    {"name": "relation", "symbols": [" subexpression$19"], "postprocess":  R("beside") },
    {"name": "relation", "symbols": [" subexpression$20"], "postprocess":  R("above") },
    {"name": "size", "symbols": [" subexpression$21"], "postprocess":  R("small") },
    {"name": "size", "symbols": [" subexpression$22"], "postprocess":  R("large") },
    {"name": " string$23", "symbols": [{"literal":"b"}, {"literal":"l"}, {"literal":"a"}, {"literal":"c"}, {"literal":"k"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "color", "symbols": [" string$23"], "postprocess":  R("black") },
    {"name": " string$24", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"i"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "color", "symbols": [" string$24"], "postprocess":  R("white") },
    {"name": " string$25", "symbols": [{"literal":"b"}, {"literal":"l"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "color", "symbols": [" string$25"], "postprocess":  R("blue") },
    {"name": " string$26", "symbols": [{"literal":"g"}, {"literal":"r"}, {"literal":"e"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "color", "symbols": [" string$26"], "postprocess":  R("green") },
    {"name": " string$27", "symbols": [{"literal":"y"}, {"literal":"e"}, {"literal":"l"}, {"literal":"l"}, {"literal":"o"}, {"literal":"w"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "color", "symbols": [" string$27"], "postprocess":  R("yellow") },
    {"name": " string$28", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"d"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "color", "symbols": [" string$28"], "postprocess":  R("red") },
    {"name": "formSG", "symbols": ["form"], "postprocess":  R(0) },
    {"name": "formPL", "symbols": ["form", {"literal":"s"}], "postprocess":  R(0) },
    {"name": " string$29", "symbols": [{"literal":"b"}, {"literal":"o"}, {"literal":"x"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "formSG", "symbols": [" string$29"], "postprocess":  R("box") },
    {"name": " string$30", "symbols": [{"literal":"b"}, {"literal":"o"}, {"literal":"x"}, {"literal":"e"}, {"literal":"s"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "formPL", "symbols": [" string$30"], "postprocess":  R("box") },
    {"name": "form", "symbols": [" subexpression$31"], "postprocess":  R("anyform") },
    {"name": " string$32", "symbols": [{"literal":"b"}, {"literal":"r"}, {"literal":"i"}, {"literal":"c"}, {"literal":"k"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "form", "symbols": [" string$32"], "postprocess":  R("brick") },
    {"name": " string$33", "symbols": [{"literal":"p"}, {"literal":"l"}, {"literal":"a"}, {"literal":"n"}, {"literal":"k"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "form", "symbols": [" string$33"], "postprocess":  R("plank") },
    {"name": " string$34", "symbols": [{"literal":"b"}, {"literal":"a"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "form", "symbols": [" string$34"], "postprocess":  R("ball") },
    {"name": " string$35", "symbols": [{"literal":"p"}, {"literal":"y"}, {"literal":"r"}, {"literal":"a"}, {"literal":"m"}, {"literal":"i"}, {"literal":"d"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "form", "symbols": [" string$35"], "postprocess":  R("pyramid") },
    {"name": " string$36", "symbols": [{"literal":"t"}, {"literal":"a"}, {"literal":"b"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "form", "symbols": [" string$36"], "postprocess":  R("table") },
    {"name": " string$37", "symbols": [{"literal":"f"}, {"literal":"l"}, {"literal":"o"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "form", "symbols": [" string$37"], "postprocess":  R("floor") },
    {"name": " string$38", "symbols": [{"literal":"t"}, {"literal":"a"}, {"literal":"k"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "take", "symbols": [" string$38"]},
    {"name": " string$39", "symbols": [{"literal":"g"}, {"literal":"r"}, {"literal":"a"}, {"literal":"s"}, {"literal":"p"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "take", "symbols": [" string$39"]},
    {"name": " string$40", "symbols": [{"literal":"p"}, {"literal":"i"}, {"literal":"c"}, {"literal":"k"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$41", "symbols": [{"literal":"u"}, {"literal":"p"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "take", "symbols": [" string$40", " string$41"]},
    {"name": " string$42", "symbols": [{"literal":"m"}, {"literal":"o"}, {"literal":"v"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "move", "symbols": [" string$42"]},
    {"name": " string$43", "symbols": [{"literal":"p"}, {"literal":"u"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "move", "symbols": [" string$43"]},
    {"name": " string$44", "symbols": [{"literal":"d"}, {"literal":"r"}, {"literal":"o"}, {"literal":"p"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "move", "symbols": [" string$44"]},
    {"name": " string$45", "symbols": [{"literal":"i"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "it", "symbols": [" string$45"]},
    {"name": " string$46", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$47", "symbols": [{"literal":"i"}, {"literal":"s"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "that_is", "symbols": [" string$46", " string$47"]},
    {"name": " string$48", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$49", "symbols": [{"literal":"a"}, {"literal":"r"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "that_are", "symbols": [" string$48", " string$49"]},
    {"name": " string$51", "symbols": [{"literal":"y"}, {"literal":"o"}, {"literal":"u"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "will_you", "symbols": [" subexpression$50", " string$51"]},
    {"name": " string$52", "symbols": [{"literal":"p"}, {"literal":"l"}, {"literal":"e"}, {"literal":"a"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": "please", "symbols": [" string$52"]},
    {"name": " ebnf$1", "symbols": ["will_you"], "postprocess": id},
    {"name": " ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$2", "symbols": ["please"], "postprocess": id},
    {"name": " ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$3", "symbols": ["please"], "postprocess": id},
    {"name": " ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$4", "symbols": ["that_is"], "postprocess": id},
    {"name": " ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$5", "symbols": ["that_are"], "postprocess": id},
    {"name": " ebnf$5", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$6", "symbols": ["size"], "postprocess": id},
    {"name": " ebnf$6", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$7", "symbols": ["color"], "postprocess": id},
    {"name": " ebnf$7", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$8", "symbols": ["size"], "postprocess": id},
    {"name": " ebnf$8", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " ebnf$9", "symbols": ["color"], "postprocess": id},
    {"name": " ebnf$9", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": " string$53", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"y"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$10", "symbols": [" string$53"]},
    {"name": " string$54", "symbols": [{"literal":"a"}, {"literal":"n"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$10", "symbols": [" string$54"]},
    {"name": " subexpression$10", "symbols": [{"literal":"a"}]},
    {"name": " string$55", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$11", "symbols": [" string$55"]},
    {"name": " string$56", "symbols": [{"literal":"e"}, {"literal":"v"}, {"literal":"e"}, {"literal":"r"}, {"literal":"y"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$12", "symbols": [" string$56"]},
    {"name": " string$57", "symbols": [{"literal":"a"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$13", "symbols": [" string$57"]},
    {"name": " string$58", "symbols": [{"literal":"l"}, {"literal":"e"}, {"literal":"f"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$59", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$14", "symbols": [" string$58", " string$59"]},
    {"name": " string$60", "symbols": [{"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$61", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$62", "symbols": [{"literal":"l"}, {"literal":"e"}, {"literal":"f"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$63", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$14", "symbols": [" string$60", " string$61", " string$62", " string$63"]},
    {"name": " string$64", "symbols": [{"literal":"r"}, {"literal":"i"}, {"literal":"g"}, {"literal":"h"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$65", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$15", "symbols": [" string$64", " string$65"]},
    {"name": " string$66", "symbols": [{"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$67", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$68", "symbols": [{"literal":"r"}, {"literal":"i"}, {"literal":"g"}, {"literal":"h"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$69", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$15", "symbols": [" string$66", " string$67", " string$68", " string$69"]},
    {"name": " string$70", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"s"}, {"literal":"i"}, {"literal":"d"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$16", "symbols": [" string$70"]},
    {"name": " string$71", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$16", "symbols": [" string$71"]},
    {"name": " string$72", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"t"}, {"literal":"o"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$16", "symbols": [" string$72"]},
    {"name": " string$73", "symbols": [{"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$17", "symbols": [" string$73"]},
    {"name": " string$74", "symbols": [{"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$75", "symbols": [{"literal":"t"}, {"literal":"o"}, {"literal":"p"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " string$76", "symbols": [{"literal":"o"}, {"literal":"f"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$17", "symbols": [" string$74", " string$75", " string$76"]},
    {"name": " string$77", "symbols": [{"literal":"u"}, {"literal":"n"}, {"literal":"d"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$18", "symbols": [" string$77"]},
    {"name": " string$78", "symbols": [{"literal":"b"}, {"literal":"e"}, {"literal":"l"}, {"literal":"o"}, {"literal":"w"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$18", "symbols": [" string$78"]},
    {"name": " string$79", "symbols": [{"literal":"b"}, {"literal":"e"}, {"literal":"s"}, {"literal":"i"}, {"literal":"d"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$19", "symbols": [" string$79"]},
    {"name": " string$80", "symbols": [{"literal":"a"}, {"literal":"b"}, {"literal":"o"}, {"literal":"v"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$20", "symbols": [" string$80"]},
    {"name": " string$81", "symbols": [{"literal":"s"}, {"literal":"m"}, {"literal":"a"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$21", "symbols": [" string$81"]},
    {"name": " string$82", "symbols": [{"literal":"t"}, {"literal":"i"}, {"literal":"n"}, {"literal":"y"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$21", "symbols": [" string$82"]},
    {"name": " string$83", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"r"}, {"literal":"g"}, {"literal":"e"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$22", "symbols": [" string$83"]},
    {"name": " string$84", "symbols": [{"literal":"b"}, {"literal":"i"}, {"literal":"g"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$22", "symbols": [" string$84"]},
    {"name": " string$85", "symbols": [{"literal":"o"}, {"literal":"b"}, {"literal":"j"}, {"literal":"e"}, {"literal":"c"}, {"literal":"t"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$31", "symbols": [" string$85"]},
    {"name": " string$86", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"i"}, {"literal":"n"}, {"literal":"g"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$31", "symbols": [" string$86"]},
    {"name": " string$87", "symbols": [{"literal":"f"}, {"literal":"o"}, {"literal":"r"}, {"literal":"m"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$31", "symbols": [" string$87"]},
    {"name": " string$88", "symbols": [{"literal":"w"}, {"literal":"i"}, {"literal":"l"}, {"literal":"l"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$50", "symbols": [" string$88"]},
    {"name": " string$89", "symbols": [{"literal":"c"}, {"literal":"a"}, {"literal":"n"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$50", "symbols": [" string$89"]},
    {"name": " string$90", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"u"}, {"literal":"l"}, {"literal":"d"}], "postprocess": function joiner(d) {
        return d.join('');
    }},
    {"name": " subexpression$50", "symbols": [" string$90"]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
