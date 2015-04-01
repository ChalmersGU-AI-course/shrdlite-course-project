The A* implementation is located in the´Astar/´ folder.

Compile the typescript file by running the Makefile.

Start the program by opening up the astar.html file. On start, it will run the A* algorithm on three different examples (see below). While running the algorithm, the browser will likely freeze for about one second before showing a popup stating that it found a solution for the third example.

1. dummy
2. graph
3. 8-puzzle

The first example is very simple. In it, two actions are possible for every state: either adding 0, or adding 1. The goal of the example is to find the shortest way to reach 10. This is of course trivial, add 1 ten times and you have reached 10. The path is then {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}. Even though this first example is simple, it is also infinite (in the case we always add 0).

The second example is a graph problem???

The third example is the famous 8-puzzle. 