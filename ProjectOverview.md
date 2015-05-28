Project Overview
================

For our project we implemented the following extensions, which will described in more detail below.
* Two arms
* Handling of 'all' quantifier


We only updated the `SVGWorld` to display two arms. So to run our project compile the TypeScript files with `make html` and open the `shrdlite.html` file after that.

We added examples for each world that show the features of our implementation quite well. Its best to run the examples in order though.


## Implementation details

### Second arm

Adding a second arm to the world poses several problems. First a new action that means nothing has to be implemented. This one is denoted *n*. With that the branching factor of the search tree grows from 3 to 15, which adds a lot possible interesting nodes to the search tree and therefore requires good heuristics. However, the length of the solution path is most likely reduced as well.

The generation of all neighbor states is implemented in the `getNeighbors` method in the `PlannerNode` class.
We implemented the arms so they cannot pass each other.


### Heuristics

We created specialized heuristics for each relation a literal can have. The implementation can be found in the `TwoArmHeuristic` class in `Planner.ts`.

### Interpretation
