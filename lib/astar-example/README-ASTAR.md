Team Dandilion A*-report
========================
Run instructions
----------------
To run the provided example, `cd shrdlite-course-project/lib/astar-example` and do `make` followed by `node graphTest.js`. For more details on the example and its expected output, see the relevant section below.

Implementation details
----------------------
All relevant files are in the folder `lib/astar-example`. Our implementation of A* is in `astar.ts`, and our representation of graphs is in `graph.ts`. The example (which runs itself) is in `graphTest.ts` and is discussed separately below.

### graph.ts
Graphs consists of nodes on a euclidian plane and weighted directed edges between them, which needn't be related to the corresponding euclidian distance.

#### Graph class
This is a representation of graphs. It contains a set of `GraphNode`s and a set of `Edge`s. Adding of nodes and edges are supported, as well as some simple queries.

#### GraphNode class
This is a representation of a node in a `Graph`. It has a name and coordinates, and provides a simple method for calculating the euclidian distance between itself and another node.

#### Edge class
This is a representation of an edge in a `Graph`. It has two `GraphNode`s, its source and target, as well as a cost.

### astar.ts
Our implementation of A* maintains a frontier of `StarNode`s. These are described briefly, before the algorithm is discussed.

#### StarNode
This is a subclass of `GraphNode`, with the additions that it maintains the path travelled to reach it, as well as its total cost and its heuristic distance to the goal. It also provides methods for retreiving these values. The same `GraphNode` can be used as a basis for multiple `StarNode`s, if the algorithm reaches the same node on different paths.

#### `aStar()`
This is the main algorithm. It takes a graph, a start- and a goal-node and returns a `StarNode` based on the goal-node, containing the shortest path to it. All edges of the graph are treated as undirected.

The frontier is a priority queue of `StarNode`s, sorted on the sum of the path's cost and the heuristic distance to the goal. The heuristic used is euclidian distance, so even though our `Graph` class allows edges that are cheaper than the euclidian distance between their adjacent nodes, such examples should not be constructed if one wants a guarantee of a good result. 

The algorithm runs rougly as follows: To begin with, a `StarNode` based on the start-node is created and added to the frontier. The main loop then ensues:

1. Remove the first node from the frontier and add it to the set of evaluated nodes.
2. If the node is the goal, stop and return it.
3. Create `StarNode`s of all the neighbors and add them to the frontier.

Example
--------
Our example is a (very simplified and somewhat made up) map of Sweden, in which we try to find the shortest path from Malmö to Kiruna. We have designed the map so that A* will evaluate the path along the east coast first, due to the edge between Malmö and Gôteborg being quite long relative to the euclidian distance between them. A* will see it as a bad choice until it discovers that the path along the east coast involves Stockholm (which is quite far eastward) while the west coast-path goes in a straighter line.

The shortest path should be Malmö-Gôteborg-Tänndalen-Kiruna, with a cost of 3.