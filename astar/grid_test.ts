/// <reference path="astar.ts" />

var canvas = <HTMLCanvasElement>document.getElementById('gridCanvas');
var context = canvas.getContext("2d");


// create abstract grid representation (no nodes here)
var grid = 
[[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1],
 [1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
 [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];

var height = grid.length;
var width = grid[1].length;

function drawGrid(grid, tileSize, context, path) {
	var h = grid.length;
	var w = grid[1].length;

	for (var x = 0; x < w; x++) {
		for (var y = 0; y < h; y++) {
			if (grid[y][x] == 0) {
				context.fillStyle = "#999";
			} else {
				context.fillStyle = "black";
			}

			context.fillRect(x*tileSize, y*tileSize, tileSize-1, tileSize-1);
		}
	}

	for (var i = 0; i < path.length; i++) {
		var current = path[i];
		context.fillStyle = "red";

		context.fillRect(current.data.x*tileSize, current.data.y*tileSize, tileSize-1, tileSize-1)
	}
}

// create graph to be used for path finding
class NodeData implements astar.INodeData {
    x: number;
    y: number;

    constructor(x, y) {
    	this.x = x;
    	this.y = y;
    }
}

class Heuristic implements astar.IHeuristic {

	get(a: astar.Node, b: astar.Node): number {
		var dataA = <NodeData>a.getData();
		var dataB = <NodeData>b.getData();

        return Math.sqrt(
            Math.abs(dataA.x - dataB.x)^2 +
            Math.abs(dataA.y - dataB.y)^2);
	}
}

var a = new astar.Graph(new Heuristic());

// create nodes based on given grid
var gridNodes = [];

for (var y = 0; y < height; y++) {
	gridNodes.push([]);

	for (var x = 0; x < width; x++) {
		gridNodes[y].push(null);

		if (grid[y][x] === 0) {
			// Walkable cell, create node at this coordinate
			var node = new astar.Node(new NodeData(x,y));
			gridNodes[y][x] = node;
			a.addNode(node);
		}
	}
}

// set neighbors
for (var x = 0; x < width; x++) {
	for (var y = 0; y < height; y++) {
		// add neighbors if node exists
		var current = gridNodes[y][x];

		if (current !== null) {

			// west
			if (x !== 0) {
				var n = gridNodes[y][x-1];
				if (n) {
					current.addNeighborNode(n, 1);
				}
			}
			// east
			if (x % width !== 0) {
				var n = gridNodes[y][x+1];
				if (n) {
					current.addNeighborNode(n, 1);
				}
			}
			// north
			if (y !== 0) {
				var n = gridNodes[y-1][x];
				if (n) {
					current.addNeighborNode(n, 1);
				}
			}
			// south
			if (y % height !== 0) {
				var n = gridNodes[y+1][x];
				if (n) {
					current.addNeighborNode(n, 1);
				}
			}
		}
	}
}

var path = a.searchPath(gridNodes[1][1], gridNodes[3][3]);

drawGrid(grid, 20, context, path);