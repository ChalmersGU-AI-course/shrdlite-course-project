##Search files
The files for the A* search algorithm are inside the *search* folder.
###Search.ts
The search file contains an interface for search functions.

It takes three arguments, a function that gives the neighbours
of a given node, the start node and a function that determines if a given
node is an end node.

The result of running a search function is a path

###Astar.ts
An implementation of the A* algorithm.
The function *aStar* returns, given an optional heuristic, a search function
that implements the *search* interface.

The search function returns a list of nodes if a path between the start and
the end is found, and undefined otherwise.

##Heuristic.ts
Exports an interface to build heuristic functions.
A heuristic function for zero heuristic cost is implemented in the file as an example function.

##Test files
To run the test run *make all* in the test folder.

### Main test
The main test for the implementation is the Test.ts file. 
This test contains a grid graph with some obstacles and compute the best path
by using three different heuristic functions. 
The heuristic functions are manhattan, linear and zerocost.
We also have a couple of tests for making sure the algorithm terminates correct.
These tests are located in the files TestNoPathToEnd.ts, TestMultipleEnds.ts, TestCircularGraph.ts, and TestCircularNoEnd.ts.

