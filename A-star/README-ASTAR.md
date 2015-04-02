## To run astar.js ##
Requirements: node.js

Run: `node astar.js`

### Description ###
The algorithm finds a shortest path on a square 2D grid from a designated start to goal square.  There are obstacles on the way which cannot be passed. It plots the result to the console.

The algorithm uses the Manhattan distance heuristic function, since the adjacent squares from any given square are the neighboring squares, diagonal not included.




## To run daniel.js ##
Requirements: node.js
```
npm install collections
```

Run `node daniel.js`


### Description ###
This example finds the shortest path between two nodes on an euclidean plane, with edge costs at least as large as the euclidean distance The euclidean distance is naturally used as the heuristic function.

It returns the list of the edges of a shortest path.