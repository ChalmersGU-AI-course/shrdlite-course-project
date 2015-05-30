# Readme Final Project Submission ShrdLite

## Introduction

The following document is supposed to explain the final submission of the ShrdLite project for group **void*** in the course **TIN172**.

## General

* To build the project just run "$make all" in the project directory.
* To look at the project in action open _shrdlite.html_ in your browser after building.
* Please do not consider the ANSI or Text World because some features of our project have never been implemented in those.
* You can also visit https://tin172.github.io/ to run the project in your browser without building and installing stuff.

## Interesting examples

* _stack up all blue objects_ 
* _move the ball beside the box under the table left of the box in the box under the box_

## Interpreter

### Basic Functionality

* it processes a meaningful parse tree to a PDDL goal
* it checks whether the mentioned objects exist 
* it checks whether the spatial relations between the mentioned objects hold true
* it checks whether the desired command would result in a physical impossibility
* it returns PDDL goals containing the objects that pass the aforementioned checks
* it returns detailed errors if the utterance does not pass the aforementioned checks
* it detects disambiguities

### Extensions

* when a disambiguity is detected it will ask the user a clarification question and spawn the possibilities in a select table
 * disambiguity check is mainly in the function _Interpreter.ShrdLiteInterpretation.buildLiteral(...)_ in _Interpreter.ts_
 * creating clarification questions is mainly in _Shrdlite.parseUtteranceIntoPlan(...)_ in _Shrdlite.ts_ and _Interpreter.interpretationToUtterance(...)_ in _Interpreter.ts_
 * spawning the select table is in _SVGWorld.printPickList(...)_ in _SWGWorld.ts_
* it can handle the quantifiers **all**, **any/a** and **the** and will create different goals depending on that
 * the logic for that can mainly be found in _Interpreter.ShrdLiteInterpretation.buildLiteral(...)_ in _Interpreter.ts_
* it can process a new command called **stack/stack up** that can be used like e.g. _stack up all blue objects_
 * the logic for that can mainly be found in _Interpreter.ShrdLiteInterpretation.buildLiteral(...)_ and _Interpreter.ShrdliteInterpretation.getInterpretation(...) in _Interpreter.ts_

### Stuff to be aware of

* the ambiguity check in the current form is a bit overambitious and will try to give suggestions solely based on the objects found in the Interpreter without regarding the original quantifiers, a potentially ambiguous example like _move all red objects above a yellow object on the floor_ will therefore spawn choices based on all the objects that fit the pattern without keeping the original **all** quantifier intact
* the Interpreter will check the spatial relations for both the origin and the destination based on the current state, it will therefore disregard utterances like _move the white ball in the red box on the floor_ if there is no red box on the floor, although a human might interpret the goal in a way that one could first put the red box on the floor and then the white ball into it
* Beside an object is, as explicity stated in the project page, left or right of an object.
