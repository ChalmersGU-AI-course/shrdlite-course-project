A* submission
============================
To see some examples, either go to tin172.github.io
or compile by running "$make astar" and opening astar.html

Graph.ts
--------
The Graph class contains a array of GraphNodes (these can be just x, y coordinates) and a list of edges (which nodes have a connection between them).

The class then has a function "findPath" that takes a start node and a goal node, then it uses the A* algorithm to find the path from the start to the goal.

findPath uses a pre-defined heuristic function to approximate the cost to get from some node to the goal node.

astar.ts
--------
Creates two example graphs to evaluate the Graph class. The data for these two examples are in europe.ts and Maze.ts.

The way to implement a search problem is to implement GraphNode with suitable data (x and y coordinates in the example) and function to approximate the cost to get from one node
to another. In the example we have implemented the heuristic is just the Euclidean distance.



