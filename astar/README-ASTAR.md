Readme A-star
==============



Testing
--------
Different tests can be found in the following files
- `grid_test_manhattan.ts`
- `grid_test_euclidean.ts`

In order to compile it, run
`tsc --out all.js <testFile.ts>`

To view the results, open `index.html`.




Files
------

- `astar.ts` contains the implementation of A*
- `grid_test.ts` contains a grid-based implementation for A*
- `collections.ts` contains an implementation of PriorityQueue, and other types used in this project
- `all.js` is a combined javascript compilation for the grid example
- `index.html` is a basic html file which demonstrates the example from `all.js`.




Examples
---------
`grid_test_manhattan.ts`

A grid that uses the Manhattan distance as heuristics. The neighbors of a given cell are the cells above, below and to both sides. The start node is in (1,1) and the end node in (3,19).


`grid_test_euclidian.ts`

A grid that uses the Euclidean distance as heuristics. The neighbors of a given cell are the cells above, below and to both sides. The start node is in (1,1) and the end node in (3,19).
