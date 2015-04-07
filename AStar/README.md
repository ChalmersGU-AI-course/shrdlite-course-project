A* - Python implementation
============================
This AStar implementation findes the shortest path in a squargrid, where there exists walls and edges with different weightes.

# Files
### algorithm.py
Implementation of AStar

### structures.py
Implementation of a priorityQueue.
Squar grid with weights.

### test.py
Includes testcases and a main function to run tests.
Also includes two heuristicfunctiones. One trivial, and Manhattan distance.

# Run the code
Run this implementation from the terminal by navigating to the AStar directory and type:

```
  python3 test.py
```

Will give the option of 3 testcases, and a choice of using trivial heuristic or Manhattan distance.

### Testcases
1. Simple case with minimum walls and all edges costs 1.
2. More walls, all edges still costs 1.
3. Medium amount of walls, some edges costs 5.

### Notes
This implementation is influenced by this [tutorial](http://www.redblobgames.com/pathfinding/a-star/implementation.html) given from Red Blob games.

# By
Adam, Anton, Fabian, Johan