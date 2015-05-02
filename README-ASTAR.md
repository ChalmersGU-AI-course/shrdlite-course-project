A* submission
============================
To see some examples, either go to tin172.github.io
or compile by running "$make astar" and opening astar.html

Graph.ts
--------
The Graph class takes an array of nodes (which is a subclass of GraphNode) and a list of edges (directed). The edge list is a list tuples for every node. The GraphClass takes an generic type parameter which must be a subclass of GraphNode.

The class has a function "findPath" that takes a start node and a goal node and finds the shortest path from start to goal with the A* algorithm. findPath uses the GraphNodes heuristic function to approximate the cost to get from some node to the goal node. If you want another heuristic function just ineherit GraphNode and override that function.

PointNode is an already predefnied subclass of GraphNode which utilies x,y coordinates and the distance between the points as the heristic function.

astar.ts
--------
Creates two example graphs to evaluate the Graph class and the PointNode. The data for these two examples are in europe.ts and Maze.ts.
