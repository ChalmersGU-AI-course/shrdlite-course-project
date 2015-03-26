/// <reference path="collections.ts" />

var canvas = <HTMLCanvasElement>document.getElementById('gridCanvas');
var context = canvas.getContext("2d");


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

drawGrid(grid, 20, context);

function drawGrid(grid, tileSize, context) {
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
}

class Neighbor {
	node: Node;
	distance: number;
}

interface Node {
	neighbors: Neighbor[];

	getHeuristicTo(other: Node): number;
}

class GridNode implements Node {
	x: number;
	y: number;
	neighbors: Neighbor[];

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.neighbors = [];
	}

	getHeuristicTo(other: Node) {
		return Math.sqrt(
			Math.abs(this.x - other.x) +
			Math.abs(this.y - other.y));
	}
}

interface Graph {
	//nodes: Node[];

	searchPath(start: Node, end: Node): Node[];
	//distanceFn: (a: Node, b: Node) => number;
	//heuristicFn: (a: Node, b: Node) => number;
}

class GridGraph implements Graph {
	nodes: GridNode[][];

	private getNeighbor(nodes, x, y) {
		if (nodes[y][x] != null) {
			var n = new Neighbor();
			n.node = nodes[y][x];
			n.distance = 1;
			return n;
		}
	}

	constructor(grid) {
		var h = grid.length;
		var w = grid[1].length;

		this.nodes = [];

		// create nodes based on given grid
		for (var y = 0; y < h; y++) {
			this.nodes.push([]);
			for (var x = 0; x < w; x++) {
				this.nodes[y].push(null);
				if (grid[y][x] === 0) {
					this.nodes[y][x] = new GridNode(x, y);
				}
			}
		}

		// set neighbors
		for (var x = 0; x < w; x++) {
			for (var y = 0; y < h; y++) {
				// add neighbors if node exists
				if (this.nodes[y][x] != null) {
					var current = this.nodes[y][x];
					// west
					if (x !== 0) {
						var n = this.getNeighbor(this.nodes, x-1, y);
						if (n) {
							current.neighbors.push(n);
						}
					}
					// east
					if (x % w !== 0) {
						var n = this.getNeighbor(this.nodes, x+1, y);
						if (n) {
							current.neighbors.push(n);
						}
					}
					// north
					if (y !== 0) {
						var n = this.getNeighbor(this.nodes, x, y-1);
						if (n) {
							current.neighbors.push(n);
						}
					}
					// south
					if (y % h !== 0) {
						var n = this.getNeighbor(this.nodes, x, y+1);
						if (n) {
							current.neighbors.push(n);
						}
					}
					this.nodes[y][x] = current;
				}
			}
		}
	}

	searchPath(start, end) {
		var queue = new collections.PriorityQueue<Node>();
		var visited = new collections.Set<Node>();

		queue.enqueue(start);

		while (queue.peek()) {
			var current = queue.dequeue();

			var nNeighbors = current.neighbors.length;
			for (var i = 0; i < nNeighbors; i++) {
				console.log(current.neighbors[i]);
			}
		}

		return [];
	}
}

var a: GridGraph = new GridGraph(grid);

var b = a.nodes[3][3];
var c = a.nodes[3];
console.log(c.indexOf(b));