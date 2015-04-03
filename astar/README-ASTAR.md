Readme A-star
==============



Testing
--------
In order to compile, run
`tsc --out all.js grid_test.ts`

To view the results, open `index.html`.




Files
------

- `astar.ts` contains the general interface for A*. 
	- `Node` is the graph node. It contains a list of `Neighbors` and the property needed for the heuristic function.
	- `Neighbor` of a given `Node` contains a `Node` connected to it in the graph and the distance between them.
	- `IHeuristic` is an abstract interface that takes in two `Nodes` and returns their heuristic value.
	- `Graph` contains an `IHeuristic` and a list of `Nodes`. 
- `grid_astar.ts` contains a grid-based implementation for A*. It has three different `IHeuristic` implementations, Euclidean distance, Manhattan distance and a zero heuristic. The nodes are represented with x and y coordinates. It also has a function `createGraphFromGrid` which takes a grid matrix and creates a `Graph`. A cell in the grid matrix is 0 if it is accessible and 1 if it is blocked.
- `grid_test.ts` contains three instances of the grid-based implementation, one for each heuristic defined in `grid_astar.ts`
- `all.js` is a combined javascript compilation for the grid example
- `index.html` is a basic html file which demonstrates the example from `all.js`.
- `collections.ts` contains an implementation of PriorityQueue, and other types used in this project



Examples
---------

A grid that allows three choices of heuristics, the Euclidean distance, the Manhattan distance and the zero heuristic (Dijkstra). The choice is done by clicking on the corresponding button. The neighbors of a given cell are the cells above, below and to both sides. The start node is in yellow and the end node is red. The grid can be changed by clicking on the cells.