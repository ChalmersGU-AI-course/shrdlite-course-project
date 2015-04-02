Overview
------------------------------------------------

The A* implementation is located in the `Astar/` folder. The implementation is explained below.

Compile the typescript file by running `make` in the `Astar` directory.

Start the program by opening the file `astar.html` in any web browser. When opened, it will run the A* algorithm on three different examples (see below). While running the algorithm, the browser will likely freeze for about one second before showing an alert stating that it found a solution for the third example but after quite a few iterations.

1. Dummy
2. Graph
3. 8-puzzle

The first example is very simple, the state is just a number. There are three possible transitions in each state: adding -1, 0 or 1. The goal of the example is to find the shortest path from 0 to 10. This is of course trivial: just add 1 ten times. The path then becomes {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}.
Even though this first example is simple, the search space is infinite and contains many cycles. The used heuristic is simply the distance left to the goal minus one, that is `goal - x - 1` where x is the current state.

The second example is a shortest-path problem in a weighted undirected graph, where each node is also a point in a 2-d space. Some of these nodes are connected with each other and they basically form a map. The heuristic used in this problem is the euclidean distance to the goal. Since the weights are larger than the euclidean distance, the heuristic is not only admissible but monotone.

The third example is the famous 8-puzzle. Here, the algorithm prints the heuristic value of the starting point, runs the algorithm, and finally (assuming it finds a solution) prints the final path length as well as the path of states. Here the heuristic function is the sum of the Manhattan distance for each tile (except the empty tile represented by zero), as suggested on the lecture.


Implementation
------------------------------------------------
The following files are used in this implementation:

BSD Makefile for automatically creating `.js` files from `.ts` files:
- `Makefile`

Main browser file:
- `astar.html`

Main TypeScript module where the algorithm starts:
- `Main.ts`

The implementation of A* and some similar algorithms such as best-first search:
- `Astar.ts`

Files containing the functions and parameters for the three different examples:
- `Dummy.ts`
- `Graph.ts`
- `Puzzle.ts`

The A* implementation uses the standard collections library from [basarat](https://github.com/basarat/typescript-collections):
- `lib/collections.ts`

The implementation uses vertices that contains a state, the cost so far and from which vertex it got there. These vertices are inserted in a priority queue sorted by a comparison function; in the case of A* it is `f = cost + heuristic`. The algorithm starts with an initial state that is inserted in the queue.

Whenever a new vertex is removed from the priority queue, it is examined if it contains an accepting state or not, ie the goal function returns true. If not, the neighbouring states as returned by the supplied neighbour function and inserted as vertices in the queue.

There is an option of multi-path pruning which simply keeps track of the visited states in a Set. For this to work properly, the state-class must implement a toString() method that is used by the collections library for Hashing and comparison.

The algorithm terminates if the goal is reached or if the number of search iterations exceeds a certain number. If the goal has been found, backtracking is used to find the path leading to it, and then that path is returned.
