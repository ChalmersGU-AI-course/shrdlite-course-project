##Search files
The files for the A* search algorithm are inside the *search* folder.
###Search.ts
The search file contains an interface for expressing searches.
It takes a function for returning the neighbours of a given node,
a start node, and
a function to determine if a given node is the end node.
An implementation of the interface should return a Path for a given graph.

###Astar.ts
This file contains the actual implementation of the A* search algorithm.
The implementation exports a function called aStar
which returns a function that is used to do searches.
The *aStar* function setup the heuristic function to be used in the search
while the returned function takes the input necessary to compute a path.

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

