A* - Python implementation
============================

__The implementation of A* can be found in the `AStar` directory.__

This AStar implementation finds the shortest path in a square grid, where there exists walls and edges with different weights.

# Files
### algorithm.py
Implementation of AStar

### structures.py
Implementation of a priorityQueue.
Square grid with weights.

### test.py
Includes test cases and a main function to run tests.
Also includes two heuristic functions. One trivial, and Manhattan distance.

# Run the code
Run this implementation from the terminal by navigating to the AStar directory and type:

```
  python3 test.py
```

Will give the option of 3 test cases, and a choice of using trivial heuristic or Manhattan distance.

### Testcases
1. Simple case with minimum walls and all edges costs 1.
2. More walls, all edges still costs 1.
3. Medium amount of walls, some edges costs 5.

### Notes
This implementation is influenced by this [tutorial](http://www.redblobgames.com/pathfinding/a-star/implementation.html) given from Red Blob games.

# By
Adam, Anton, Fabian, Johan


