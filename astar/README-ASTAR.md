# A* laboration - Artificial Intelligence TIN172
## Contributors
* Niklas Logren
* Jonathan Orrö
* Viktor Anderling
* David Grankvist

## TODO - What should this readme contain? (remove before hand in)
 * [x] The file README-ASTAR should contain information about how to test your implementation on your example(s), 
 * [ ] plus a description of each file that are important for this lab. 
 * [ ] Furthermore, it should contain a description of the example(s) 
 * [ ] and the heuristics that you have used.

## How to build and run
Just compile as normal using the typescript compiler.
```
> tsc AStar.ts
```
You can run the test cases by opening the file *index.html*.
Look in the console for output.

## Description of important files
### AStar.ts
This is the main file of the lab. Notable classes and functions include the following:
##### Classes
 * _Node_ - Represents a node in the graph. Contains a string label, its neighbours, the cost of the path to this node and a possible pointer to the previous node for creating a path. Also contains utility function for creating many nodes quickly.
 * _Edge_ - Represents an edge between nodes. Contains a start node, an end node and the cost between them. Has utility functions for creating many edges and complement/reverse edges.
 * _Heap_ - Used as a priority queue, to reduce the computational complexity of the algorithm. Copied from _collections_ to be able to use our own compare function.

##### Functions
 * astar - Priority queue. Heuristics
 * testcase (+ indexed suffix) - See _Test cases_.
 * test
 * 

### index.html
This 
### collections.js


## Test cases
We currently have 1 test case.

Test case 1 consists of 8 nodes, as seen in *figure 1*. It contains a start node and a goal node
labeled *a* and *d* respectively. This test case has two main purposes. The first is to test that
the heuristic does its job, by luring the algorithm towards the node *f*. If the heuristic works
as intended, the algorithm should choose either node *b* or *e* instead, since they are closer to
the goal node. The second purpose for this test case is to check that the algorithm chooses the
correct/shortest path, which is *(a -> b -> c -> d)*.

![Test case 1](/astar/testCase1.png?raw=true)

*Figure 1: A graph representing test case 1*
