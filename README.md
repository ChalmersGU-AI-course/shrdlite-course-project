# Team Dandelions Shrdlite course project

Shrdlite is a programming project in Artificial Intelligence, a course given at the University of Gothenburg and Chalmers University of Technology. 

This is an implementation of the project developed by Team Dandelion (#2) consisting of:
 
 - Gabriel Andersson 
 - Gustav Mörtberg
 - Jack Petterson
 - Niklas Wärvik 

## Running the project
### HTML version
To run the HTML version, the user simply compiles it and launches the web application. It behaves in a similar way to the original version with the addition of controls for selecting search strategy.

### Console version
Our console version takes the following arguments:
 
 - `world`: small, medium, complex, impossible
 - `utterance`: either example number or full utterance in quotations
 - `search strategy`: DFS, BSF, star, BestFS (case-sensitive)

Example: `node shrdlite-offline small 0 star`
## Interesting example utterances
### Complex world
"Put all tables beside all boxes"

In order:

 - "Put all yellow objects above a red object"
 - "Put all red objects above a yellow object"

### Medium world
"put the object that is left of a red box that is above a brick that is left of a pyramid that is left of a ball that is inside a box into a box that is above a brick that is left of a pyramid"

## Implemented extension
The project implements a few different additions to the original project description.

### Quantifiers
The Interpreter handles quantifiers `any`, `all` and `the. `All` is interpreted as exactly that, all of the objects which fit the description. We have made the choice not the fallback on any other interpretation, such as `any.

The code is in `Interpreter.ts` in the function `interpretEntity()`. The disjunctions is made in the function `buildAllDisjunctions()`.

### Verbose planner
The planner describes what it's doing in an intelligent fashion during execution. Depending on the current world it describes the objects it is handling with just enough detail to ambiguity. For example, if there is only one ball it simply says "Moving the ball...", but if there would be two balls it could say "Moving the black ball..." instead.

While the planner is describing its actions, it also reasons about what it is going to do with the objects. For example, one thing it could say would be "Moving the black ball on top of the small red box".

All of this is handled in the function `explainMove(Path, MoveIndex)` in the Planner, and it should be self-explanatory.

### Different search strategies
Since our search implementation is modular, it was easy to modify the search algorithm to use different search strategies. The ones we have implemented are listed below, but adding more is quite simple - this could perhaps be an area of further development.

 - A\*
 - Depth first search
 - Breadth first search
 - Best first search

The search algorithm can also take parameters on whether to cycle check during searching, which is set to `true` as default.

## A\* and its heuristic 
Our implementation of the search is a version of the generic search algorithm, which takes a function as one of its parameters. The frontier is represented as a PriorityQueue which is ordered using the supplied function, this way we can "model" different data structures (such as a stack for DFS) using a priority queue.

As it should, for A\* the comparison function passed to the priority queue compares two paths based on the sum of their costs and their heuristics to the goal state.

### Heuristics
All of our heuristics are based on the question "What is the minimum amount of work needed to achieve the goals?". For each new state added to the frontier, we calculate the heuristic for each of the conjunctive goals and choose the one which has the lowest combined heuristic.

## Strange or half-finished behaviour
Our interpreter is stupid. It is a risk when we make permutations that we create too many before filtering some out, depending on physical rules and the actual relation. This means that it would take too long to compute, so we throw an error instead. This can be seen around line 264 in Interpreter.ts

The program have mainly been tested using the HTML and console versions, ANSI is supported but it hasn't been tested thoroughly.
