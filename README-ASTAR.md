*Overview

The A* implementation is located in the´Astar/´ folder. The implementation is explained below, after the examples.

Compile the typescript file by running the Makefile.

Start the program by opening up the astar.html file. On start, it will run the A* algorithm on three different examples (see below). While running the algorithm, the browser will likely freeze for about one second before showing a popup stating that it found a solution for the third example.

1. dummy
2. graph
3. 8-puzzle

The first example is very simple. In it, two actions are possible for every state: either adding 0, or adding 1. The goal of the example is to find the shortest way to reach 10. This is of course trivial, add 1 ten times and you have reached 10. The path is then {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}. Even though this first example is simple, it is also infinite (in the case we always add 0).
Which heuristic was used?

The second example is a graph problem???
Which heuristic was used?

The third example is the famous 8-puzzle. Here, the algorithm prints the heuristic of the starting point, runs the algorithm, and finally (assuming it finds a solution) prints the final path length and the actual steps taken in the path.
Which heuristic was used?

**Implementation
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