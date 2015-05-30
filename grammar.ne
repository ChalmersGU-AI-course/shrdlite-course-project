
## This is a grammar for Shrdlite, written for the Nearley Javascript chartparser
## To compile into a Javascript file:  nearleyc grammar.ne > grammar.js
## For more information:  https://github.com/Hardmath123/nearley

@{%

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

%}


## Grammar rules

main --> will_you:? please:? command please:?  {% R(2) %}  

command --> take entity           {% R({cmd:"take", ent:1}) %}
command --> move  it    location  {% R({cmd:"put", loc:2}) %}
command --> move entity location  {% R({cmd:"move", ent:1, loc:2}) %}

location --> relation entity  {% R({rel:0, ent:1}) %}

entity --> quantifierSG objectSG  {% R({quant:0, obj:1}) %}
entity --> quantifierPL objectPL  {% R({quant:0, obj:1}) %}

objectSG --> objectSG that_is:?  location  {% R({obj:0, loc:2}) %}
objectPL --> objectPL that_are:? location  {% R({obj:0, loc:2}) %}

objectSG --> size:? color:? formSG  {% R({size:0, color:1, form:2}) %}
objectPL --> size:? color:? formPL  {% R({size:0, color:1, form:2}) %}


## Lexical rules

quantifierSG --> ("any" | "an" | "a")  {% R("any") %}
quantifierSG --> ("the")               {% R("the") %}
quantifierSG --> ("every")             {% R("all") %}
quantifierPL --> ("all")               {% R("all") %}

relation --> ("left"  "of" | "to" "the" "left"  "of")  {% R("leftof") %}
relation --> ("right" "of" | "to" "the" "right" "of")  {% R("rightof") %}
relation --> ("inside" | "in" | "into")  {% R("inside") %}
relation --> ("on" | "on" "top" "of")    {% R("ontop") %}
relation --> ("under")                   {% R("under") %}
relation --> ("below")                   {% R("below") %}
relation --> ("beside")                  {% R("beside") %}
relation --> ("above")                   {% R("above") %}
relation --> ("containing")              {% R("containing") %}

size --> ("small" | "tiny")  {% R("small") %}
size --> ("large" | "big")   {% R("large") %}

color --> "black"   {% R("black") %}
color --> "white"   {% R("white") %}
color --> "blue"    {% R("blue") %}
color --> "green"   {% R("green") %}
color --> "yellow"  {% R("yellow") %}
color --> "red"     {% R("red") %}

formSG --> form      {% R(0) %}
formPL --> form "s"  {% R(0) %}

formSG --> "box"    {% R("box") %}
formPL --> "boxes"  {% R("box") %}

form --> ("object" | "thing" | "form")  {% R("anyform") %}
form --> "brick"    {% R("brick") %}
form --> "plank"    {% R("plank") %}
form --> "ball"     {% R("ball") %}
form --> "pyramid"  {% R("pyramid") %}
form --> "table"    {% R("table") %}
form --> "floor"    {% R("floor") %}


## Lexicon (without semantic content)

take --> "take" | "grasp" | "pick" "up"
move --> "move" | "put" | "drop"
it --> "it"

that_is  --> "that" "is"
that_are --> "that" "are"

will_you --> ("will" | "can" | "could") "you"

please --> "please"
