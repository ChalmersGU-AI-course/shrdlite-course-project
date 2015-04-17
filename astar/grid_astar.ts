/// <reference path="astar.ts" />

module grid_astar {
    
    export class NodeData implements astar.INodeData {
        x: number;
        y: number;

        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    export class DijkstraHeuristic implements astar.IHeuristic {
        
        get(a: astar.Node, b: astar.Node[]): number {
            return 0;
        }
    }

    export class EuclidianHeuristic implements astar.IHeuristic {

        get(a: astar.Node, b: astar.Node[]): number {

            var dataA = <NodeData>a.getData();
            var minHeuristic = Infinity;
            for (var i=0; i<b.length ; i++){
                var dataB = <NodeData>b[i].getData();
                var tmpHeuristic = Math.sqrt(
                    Math.pow(dataA.x - dataB.x,2) +
                    Math.pow(dataA.y - dataB.y,2));
                if(tmpHeuristic<minHeuristic){
                    minHeuristic = tmpHeuristic;
                }
            }
            return minHeuristic;
        }
    }

    export class ManhattanHeuristic implements astar.IHeuristic {

        get(a: astar.Node, b: astar.Node[]): number {
            var dataA = <NodeData>a.getData();
            var minHeuristic = Infinity;
            for (var i=0; i<b.length ; i++){
                var dataB = <NodeData>b[i].getData();
                var tmpHeuristic = Math.abs(dataA.x - dataB.x) +
                                Math.abs(dataA.y - dataB.y);
                if(tmpHeuristic<minHeuristic){
                    minHeuristic = tmpHeuristic;
                }
            }
            return  minHeuristic;
        }
    }

    export function createGraphFromGrid(grid, heuristics) {
        var height = grid.length;
        var width = grid[1].length;

        // create nodes based on given grid
        var a = new astar.Graph(heuristics);
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
                    if (x > 0) {
                        var n = gridNodes[y][x-1];
                        if (n) {
                            current.addNeighborNode(n, 1);
                        }
                    }
                    // east
                    if (x < width-1) {
                        var n = gridNodes[y][x+1];
                        if (n) {
                            current.addNeighborNode(n, 1);
                        }
                    }
                    // north
                    if (y > 0) {
                        var n = gridNodes[y-1][x];
                        if (n) {
                            current.addNeighborNode(n, 1);
                        }
                    }
                    // south
                    if (y < height-1) {
                        var n = gridNodes[y+1][x];
                        if (n) {
                            current.addNeighborNode(n, 1);
                        }
                    }
                }
            }
        }

        return { graph: a, nodes: gridNodes };
    }
}