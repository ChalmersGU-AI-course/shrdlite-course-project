How to test the A* algorithm:

The example files is under the "example" directory
1. Compile the "example.ts" using the "build.bat" file
   (or by typing "tsc --out example.js example.ts" in a console)
2. Open example.html

Description of the files:

graph.ts

This file contains a module called "graphmodule", which in turn contains classes
for node, edge, adjacency, path and finally a graph. This module also holds a
compare function for paths. All the classes are parametrised on the data type a
node holds

    GraphNode:
    A node has an ID, some data of generic type and a heuristic map from nodes 
    to a number
    
    Edge:
    An edge has a 'to' and 'from' node and a cost
    
    Adjacency:
    The adjacency class holds a node and a set of all the edges going out from
    that node. These edges can then be used to check both the "other end" by
    getting the edge's "to" node and also the cost of that edge
    
    Path:
    A path is a list of edges. It also has a total cost which is the sum of the
    cost of all edges contained in the path.
    
    Graph:
    A generic graph holding a set of nodes and a set of edges. It also holds a
    map from node ID to the node's corresponding Adjacency class. This map is
    used for fast look-ups.
    
    comparePath:
    This function takes two paths and a goal node and compares them by checking
    both their actual cost, as well as the heuristic from the end node on each
    path to the goal node.
    

astar.ts

This file contains a module called "astar", which in turn contains a function
"compute", which will calculate the shortest path from the given start node to
the given goal node, using the given graph and the A* algorithm.

The algorithm uses a set of "visited nodes" in order to detect loops and not to
visit already visited nodes.

example.ts

This file (under the example directory) contains a tuple class and a grid-graph.
The grid-graph holds a map (represented by 1's and 0's in a matrix) where 1's is
a walk-able node and 0's represent a wall.

The grid-graph allows 8 different ways to walk from a node.

The grid-graph has two different heuristics, Manhattan and Euclidean distance.

The example can be tested by following the instruction in the top of this file

    Manhattan heuristic:
    Uses the Manhattan heuristics and multiplies it by 40 to test an over-estimate
    heuristics.
    
    Euclidean distance heuristic:
    Uses the standard euclidean distance as heuristics.
    
When using the manhattan heuristics (times 40) the resulting path is not the
optimal path, since the heuristic is a big over-estimate one and the searching
will act a lot like "best-first"-search. With the euclidean it is optimal