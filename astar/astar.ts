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

interface INode<T> {
	neighbors: Neighbor<T>[];

	getData(): T;

	getHeuristicTo(other: INode<T>): number;
}

class Neighbor<T> {
	node: INode<T>;
	distance: number;
}

class GridData {
	x: number;
	y: number;
}

class GridNode implements INode<GridData> {
	data: GridData;

	neighbors: Neighbor<GridData>[];

	constructor(x: number, y: number) {
		this.data = new GridData();
		this.data.x = x;
		this.data.y = y;
		this.neighbors = [];
	}

	getData() : GridData {
		return this.data;
	}

	getHeuristicTo(other: INode<GridData>) : number{
		var o: GridData = other.getData();
		return //Math.sqrt(
			Math.abs(this.data.x - o.x) +
			Math.abs(this.data.y - o.y));
	}
}

interface Graph<T> {
	//nodes: Node[];

	searchPath(start: INode<T>, end: INode<T>): INode<T>[];
	//distanceFn: (a: Node, b: Node) => number;
	//heuristicFn: (a: Node, b: Node) => number;
}

class GridGraph implements Graph<GridData> {
	nodes: GridNode[][];

	private getNeighbor(nodes, x, y) {
		if (nodes[y][x] != null) {
			var n = new Neighbor<GridData>();
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
		var queue = new collections.PriorityQueue<GridNode>();
		var visited = new collections.Set<GridNode>();

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
a.searchPath(a.nodes[1][1], a.nodes[3][3]);

var b = a.nodes[3][3];
var c = a.nodes[3];
console.log(c.indexOf(b));