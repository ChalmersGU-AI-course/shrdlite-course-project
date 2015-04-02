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





Examples
---------
`grid_test_manhattan.ts`

A grid that uses the Manhattan distance as heuristics. The neighbors of a given cell are the cells above, below and to both sides. The start node is in (1,1) and the end node in (3,19).


`grid_test_euclidian.ts`

A grid that uses the Euclidean distance as heuristics. The neighbors of a given cell are the cells above, below and to both sides. The start node is in (1,1) and the end node in (3,19).
