##Search files
The files for the A* search algorithm are inside the *search* folder.
###Search.ts
The search file contains an interface for search functions.

It takes three arguments, a function that gives the neighbours
of a given node, the start node and a function that determines if a given
node is an end node. The result of running a search function is a path.

###Astar.ts
An implementation of the A* algorithm.
The function *aStar* returns, given an optional heuristic, a search function
that implements the *search* interface.

The search function returns a list of nodes if a path between the start and
the end is found, and undefined otherwise.

##Heuristic.ts
Exports an interface to build heuristic functions.
A heuristic function for zero heuristic cost is implemented in the file
and is used by *aStar* as the default heuristic if no other heuristic
is supplied.

##Test files
To run the test run *make all* in the test folder.

### Main tests
We have two test files, one that tests A* on graph properties and one that test the A* heuristics. They are called TestAStarOnGraphProperties and TestGraphAStarHeuristics respectively.

The graph properties test contains a couple of tests for making sure that the algorithm terminates correctly.
First it makes sure that the algorithm halts even if there is no path in the graph. Then it tests for halting of the algorithm when there are loops. The last test makes sure that the algorithm picks the best path if there are multiple paths to the goal.

The heuristics test contains a grid graph with some obstacles and computes the best path
by using three different heuristic functions. The heuristic functions are Manhattan, straight line and zero cost.
