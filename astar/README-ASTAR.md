# A* laboration - Artificial Intelligence TIN172
## Contributors
* Niklas Logren
* Jonathan Orrö
* Viktor Anderling
* David Grankvist

## How to build and run
Just compile as normal using the typescript compiler.
```
> tsc AStar.ts
```
You can run the test cases by opening the file *index.html*.
Look in the console for output.

## Implementation
 * Priority queue.
 * Heuristics
 * ...

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
