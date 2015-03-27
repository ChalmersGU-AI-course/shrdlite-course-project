/// <reference path="collections.ts" />
var canvas = document.getElementById('gridCanvas');
var context = canvas.getContext("2d");
var grid = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1], [1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
drawGrid(grid, 20, context);
function drawGrid(grid, tileSize, context) {
    var h = grid.length;
    var w = grid[1].length;
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            if (grid[y][x] == 0) {
                context.fillStyle = "#999";
            }
            else {
                context.fillStyle = "black";
            }
            context.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
        }
    }
}
var Neighbor = (function () {
    function Neighbor() {
    }
    return Neighbor;
})();
var GridData = (function () {
    function GridData() {
    }
    return GridData;
})();
var QueueElement = (function () {
    function QueueElement(node, cost) {
        this.node = null;
        this.cost = 0;
        this.node = node;
        this.cost = cost;
    }
    return QueueElement;
})();
// class EntryComparer implements ICompareFunction<Entry> {
// 	compare(a: Entry, b: Entry): number {
// 	    if (a.cost < b.cost) {
// 	        return -1;
// 	    } else if (a.cost === b.cost) {
// 	        return 0;
// 	    } else {
// 	        return 1;
// 	    }
// 	}
// }
function entryCompare(a, b) {
    if (a.cost < b.cost) {
        return -1;
    }
    else if (a.cost === b.cost) {
        return 0;
    }
    else {
        return 1;
    }
}
var GridNode = (function () {
    function GridNode(x, y) {
        this.data = new GridData();
        this.data.x = x;
        this.data.y = y;
        this.neighbors = [];
    }
    GridNode.prototype.getData = function () {
        return this.data;
    };
    GridNode.prototype.getHeuristicTo = function (other) {
        var o = other.getData();
        return Math.sqrt(Math.abs(this.data.x - o.x) ^ 2 + Math.abs(this.data.y - o.y) ^ 2);
    };
    return GridNode;
})();
var GridGraph = (function () {
    function GridGraph(grid) {
        var h = grid.length;
        var w = grid[1].length;
        this.nodes = [];
        for (var y = 0; y < h; y++) {
            this.nodes.push([]);
            for (var x = 0; x < w; x++) {
                this.nodes[y].push(null);
                if (grid[y][x] === 0) {
                    this.nodes[y][x] = new GridNode(x, y);
                }
            }
        }
        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                // add neighbors if node exists
                if (this.nodes[y][x] != null) {
                    var current = this.nodes[y][x];
                    // west
                    if (x !== 0) {
                        var n = this.getNeighbor(this.nodes, x - 1, y);
                        if (n) {
                            current.neighbors.push(n);
                        }
                    }
                    // east
                    if (x % w !== 0) {
                        var n = this.getNeighbor(this.nodes, x + 1, y);
                        if (n) {
                            current.neighbors.push(n);
                        }
                    }
                    // north
                    if (y !== 0) {
                        var n = this.getNeighbor(this.nodes, x, y - 1);
                        if (n) {
                            current.neighbors.push(n);
                        }
                    }
                    // south
                    if (y % h !== 0) {
                        var n = this.getNeighbor(this.nodes, x, y + 1);
                        if (n) {
                            current.neighbors.push(n);
                        }
                    }
                    this.nodes[y][x] = current;
                }
            }
        }
    }
    GridGraph.prototype.getNeighbor = function (nodes, x, y) {
        if (nodes[y][x] != null) {
            var n = new Neighbor();
            n.node = nodes[y][x];
            n.distance = 1;
            return n;
        }
    };
    GridGraph.prototype.searchPath = function (start, end) {
        var queue = new collections.PriorityQueue(entryCompare);
        var visited = new collections.Set();
        queue.enqueue(new QueueElement(start, 0));
        while (queue.peek()) {
            var current = queue.dequeue();
            var nNeighbors = current.node.neighbors.length;
            for (var i = 0; i < nNeighbors; i++) {
                console.log(current.node.neighbors[i]);
            }
        }
        return [];
    };
    return GridGraph;
})();
var a = new GridGraph(grid);
a.searchPath(a.nodes[1][1], a.nodes[3][3]);
var b = a.nodes[3][3];
var c = a.nodes[3];
console.log(c.indexOf(b));
