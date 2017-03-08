
## This is a grammar for Shrdlite, written for the Nearley Javascript chartparser
## To compile into a TypeScript file:  nearleyc Grammar.ne > Grammar.ts
## More information about Nearley:  https://github.com/Hardmath123/nearley

## Note that for simplicity this grammar does not recognise uppcase, whitespace or punctuation.
## This means that it has to be called with a contracted lowercase string, i.e.,
## the string "Take the blue ball!" is not recognised, but instead "taketheblueball"

@preprocessor typescript

@{%
import {
    Command, TakeCommand, DropCommand, MoveCommand, WhereisCommand,
    Location, Entity,
    Object, RelativeObject, SimpleObject,
} from "./Types";
%}

## Grammar rules

main --> will_you:? please:? command please:?  {% (d) => d[2] %}  

command --> take entity           {% (d) => new TakeCommand(d[1]) %}
command --> move  it    location  {% (d) => new DropCommand(d[2]) %}
command --> move entity location  {% (d) => new MoveCommand(d[1], d[2]) %}
# command --> where_is entity       {% (d) => new WhereisCommand(d[1], d[2]) %}

location --> relation entity  {% (d) => new Location(d[0], d[1]) %}

entity --> quantifierSG objectSG  {% (d) => new Entity(d[0], d[1]) %}
entity --> quantifierPL objectPL  {% (d) => new Entity(d[0], d[1]) %}

objectSG --> objectSG that_is:?  location  {% (d) => new RelativeObject(d[0], d[2]) %}
objectPL --> objectPL that_are:? location  {% (d) => new RelativeObject(d[0], d[2]) %}

objectSG --> size:? color:? formSG  {% (d) => new SimpleObject(d[0], d[1], d[2]) %}
objectPL --> size:? color:? formPL  {% (d) => new SimpleObject(d[0], d[1], d[2]) %}


## Lexical rules

quantifierSG --> ("any" | "an" | "a")  {% (d) => "any" %}
quantifierSG --> ("the")               {% (d) => "the" %}
quantifierSG --> ("every")             {% (d) => "all" %}
quantifierPL --> ("all")               {% (d) => "all" %}

relation --> ("left"  "of" | "to" "the" "left"  "of")  {% (d) => "leftof" %}
relation --> ("right" "of" | "to" "the" "right" "of")  {% (d) => "rightof" %}
relation --> ("inside" | "in" | "into")  {% (d) => "inside" %}
relation --> ("on" | "on" "top" "of")    {% (d) => "ontop" %}
relation --> ("under" | "below")         {% (d) => "under" %}
relation --> ("beside")                  {% (d) => "beside" %}
relation --> ("above")                   {% (d) => "above" %}

size --> ("small" | "tiny")  {% (d) => "small" %}
size --> ("large" | "big")   {% (d) => "large" %}

color --> "black"   {% (d) => "black" %}
color --> "white"   {% (d) => "white" %}
color --> "blue"    {% (d) => "blue" %}
color --> "green"   {% (d) => "green" %}
color --> "yellow"  {% (d) => "yellow" %}
color --> "red"     {% (d) => "red" %}

formSG --> form      {% (d) => d[0] %}
formPL --> form "s"  {% (d) => d[0] %}

formSG --> "box"    {% (d) => "box" %}
formPL --> "boxes"  {% (d) => "box" %}

form --> ("object" | "thing" | "form")  {% (d) => "anyform" %}
form --> "brick"    {% (d) => "brick" %}
form --> "plank"    {% (d) => "plank" %}
form --> "ball"     {% (d) => "ball" %}
form --> "pyramid"  {% (d) => "pyramid" %}
form --> "table"    {% (d) => "table" %}
form --> "floor"    {% (d) => "floor" %}


## Lexicon (without semantic content)

take --> "take" | "grasp" | "pick" "up"
move --> "move" | "put" | "drop"
it --> "it"

that_is  --> "that" "is"
that_are --> "that" "are"

will_you --> ("will" | "can" | "could") "you"

please --> "please"
