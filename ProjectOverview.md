Project Overview
================

For our project we implemented the following extensions:
* Two arms
* Handling of all quantifiers
* Simple clarification messages when there are ambiguities in the user input
* Extended the grammar to be able to describe which objects the arms should pick up or put down, since robot can now hold 2 objects simultaneously

We only updated the `SVGWorld` to display two arms. So to run our project compile the TypeScript files with `make html` and open the `shrdlite.html` file after that.

We added examples for each world that show the features of our implementation quite well. Its best to run the examples in order though.

## Implementation details

### Second arm

Adding a second arm to the world poses several problems. First a new action that means nothing has to be implemented. This one is denoted *n*. With that the branching factor of the search tree grows from 3 to 15, which adds a lot possible interesting nodes to the search tree and therefore requires good heuristics. However, the length of the solution path is most likely reduced as well.

The generation of all neighbor states is implemented in the `getNeighbors` method in the `PlannerNode` class.
We implemented the arms so they cannot pass each other.

### Interpretation (Interpreter.ts)

The interpreter has a function for each type of node in the abstract syntax tree that it needs to be able to parse. The interpretCommand function handles the top command node, which can be any of the `take`, `put` and `move` types. The abstract syntax tree is parsed recursively using the corresponding parse function for each type of node it encounters. Parsing is stopped when the leaf-nodes are reached.

To be able to handle all of the quantifiers, we represent the result of the parse functions as a list of lists. The outer list denotes OR-statements and each inner element (list) denotes an AND statement. For example, if the user requests any blue object we might get the result `[[a],[b],[c]]`. If the user instead asks for all of the blue objects we would return `[[a,b,c]]`.

### Literal helpers (LiteralHelpers.ts)

The literal helpers class contains methods for determining whether a literal is fulfilled or not, given a world state.

### World rules (WorldRules.ts)

The world rules class handles all of the static rules that need to be enforced. For example, it will report that placing any object on top of a ball is impossible.

### Heuristics (Planner.ts)

We created specialized heuristics for each relation a literal can have. The implementation can be found in the `TwoArmHeuristic` class in `Planner.ts`.

The basic idea is to estimate the number of steps both arms would need to fulfill a literal in the optimal case and then use that as the heuristic.

Then for every literal in the target an estimate is calculated and and the minimum of all estimates taken. This certainly produces worse estimates but is necessary in order to produce an underestimate and be able to find the best path.

### Planner (Planner.ts)

The planner contains the node and heuristic implementations but beyond that basically just calls our astar implementation.

### Astar (astar.ts)

The astar implementation is similar to our previous submission. The main difference between the current version and the previous one is that we now generate neighboring node instances procedurally, because we cannot pre-compute the neighbors of all nodes in this application.