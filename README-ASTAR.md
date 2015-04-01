Overview
============================

The A* implementation is located in the `Astar/` folder. The implementation is explained below, after the examples.

Compile the typescript file by running `Astar/Makefile`.

Start the program by opening up the astar.html file. On start, it will run the A* algorithm on three different examples (see below). While running the algorithm, the browser will likely freeze for about one second before showing a popup stating that it found a solution for the third example.

1. Dummy
2. Graph
3. 8-puzzle

The first example is very simple. In it, two actions are possible for every state: either adding 0, or adding 1. The goal of the example is to find the shortest way to reach 10. This is of course trivial, add 1 ten times and you have reached 10. The path is then {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}. Even though this first example is simple, it is also infinite (in the case we always add 0). The used heuristic is simply the distance left to the goal minus one, that is `goal - x - 1` where x is the current state.

The second example is a graph problem, where each node is a point in a 2-d space. Some of these nodes are connected with each other and are basically forming a map. The heuristic used in this problem is the euclidean distance to the goal.

The third example is the famous 8-puzzle. Here, the algorithm prints the heuristic of the starting point, runs the algorithm, and finally (assuming it finds a solution) prints the final path length and the actual steps taken in the path. The sum of the Manhattan distance for each tile is used as a heuristic.


Implementation
------------------------------------------------
The files used in this implementation are the following:

BSD Makefile for automatically creating `.js` files from `.ts` files:
- `Makefile`

Main browser file:
- `astar.html`

Main TypeScript module where the algorithm starts:
- `Test.ts`

The actual A* implementation:
- `Astar.ts`

Files containing the three different examples:
- `Dummy.ts`
- `Graph.ts`
- `Puzzle.ts`

The libraries that the A* implementation uses:
- `lib/collections.ts`

The A* implementation is called with problem-specific functions (for cost, heuristic, and so on) as parameters. The algorithm keeps track of a priority queue of all the nodes/states that are to be evaluated. This queue sorts the nodes by their value `f = cost + heuristic`. The starting state is added to this queue before the main loop begins.

Each iteration of the loop, a node is picked from the priority queue to be evaluated. If multi-path pruning is used, the algorithm discards any node that has already been visited. It checks if the picked node is the goal, and if it is not, adds all of the node's neighbours to the priority queue.

The algorithm terminates if the goal is reached or if the number of search iterations exceeds a certain number. If the goal has been found, backtracking is used to find the path leading to it, and then that path is returned.