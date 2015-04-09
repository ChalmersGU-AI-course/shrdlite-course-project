files:
./astar/AStar.ts  --  the general implementation of the A* algorithm

./astar/AStar-tryout.ts  --  a previous partial implementation (left it there
in case we need anything for the project)

./test/AStar-puzzle.ts  --  contains the test for an 8-puzzle

./test/AStar-Romania.ts  --  contains the test for the graph example from the
lecture

Testing method:
In order to test the algorithm, use 'make test' in the project root. This will
run both the puzzle and the romania tests. The heuristic in the 8-puzzle is the
Manhattan distance, and the heuristic in the romanian cities example is taken
from the lecture (liniar distance between the cities).
