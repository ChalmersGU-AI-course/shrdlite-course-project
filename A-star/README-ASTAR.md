## To run astar-example.js ##
Requirements: node.js
```
npm install collections
```

Run: `node astar-example.js`

### Description ###
The algorithm finds a shortest path on a square 2D grid from a designated start to goal square.  There are obstacles on the way which cannot be passed. It plots the result to the console.

The algorithm uses the Manhattan distance heuristic function, since the adjacent squares from any given square are the neighboring squares, diagonal not included.

The implementation is in astar.js and uses priority queues and sets. The implementation should be of optimal complexity.