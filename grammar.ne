
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

command --> take entity           {% R({command:"take", entity:1}) %}
command --> move  it    location  {% R({command:"put", location:2}) %}
command --> move entity location  {% R({command:"move", entity:1, location:2}) %}
command --> where_is entity       {% R({command:"where", entity:1}) %}

location --> relation entity  {% R({relation:0, entity:1}) %}

entity --> quantifierSG objectSG  {% R({quantifier:0, object:1}) %}
entity --> quantifierPL objectPL  {% R({quantifier:0, object:1}) %}

objectSG --> objectSG that_is:?  location  {% R({object:0, location:2}) %}
objectPL --> objectPL that_are:? location  {% R({object:0, location:2}) %}

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
relation --> ("under" | "below")         {% R("under") %}
relation --> ("beside")                  {% R("beside") %}
relation --> ("above")                   {% R("above") %}

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

where_is --> "where" "is"
