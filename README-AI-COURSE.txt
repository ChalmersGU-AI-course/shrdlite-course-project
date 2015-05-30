Building
========
To run the project first you need to build it.

There are two steps to this, building the project and building the astar.

	1. Use the make-file to build the project
	2. Build AStar.ts using tsc, it is located inside the astar folder

Extensions
==========
We have completed two extensions
	1. We can handle all quantifiers (any, the, all)
	2. We handle ambiguities by asking the user to clarify

Quantifiers
-----------
The code that handles all the quantifier is not something localised that is easy to point to. It is a
consequence on how we structured the intepreter.

Ambiguities
-----------
We handle two different types of ambiguities: parsing ambiguities and interpretation ambiguities.

Parsing ambiguities is handled in the interpret function in Interpreter.ts.

Interpretation ambiguities is handled in the function interpretCommand in Interpreter.ts.

Heuristics
==========
We have five different heuristics depending on what the relation in the goal state is.
The heuristics have made our planner considerably faster, so that it handles most of the examples in all worlds. For sufficiently complex queries, however, it times out.

Our heuristics are as follows:

ontop/inside
------------
We take the "Manhattan" distance between the objects. That is, we count how many objects are on top of both subjects, the distance between them and sum it. We also multiply the number of objects with 4, since it takes 4 moves to move an object from a stack.

above/under
-----------
We take the distance between the subjects. Then we count the number of objects on top of the subjects, take the minimum value of these to and add it to the distance. We also multiply the number of objects by 4. We return 0 if the relation is already true.

left/right
----------
We take the distance between the subjects and add 1 to it. We return 0 if the relation is already true.

beside
------
We take the distance between the subjects and subtract 1 to it.

The code that generates the heuristics can be found in the createHeuristicFunction in Planners.ts.
