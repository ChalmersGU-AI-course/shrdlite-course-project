/// <reference path="astar.ts" />

module grid_astar {
    
    export class Node implements astar.INode {
        grid: number[][];
        x: number;
        y: number;

        constructor(grid: number[][], x, y) {
            this.grid = grid;
            this.x = x;
            this.y = y;
        }

        getUniqueId(): string {
            return "x: " + this.x + " y: " + this.y;
        }

        getNeighbors(): astar.Neighbor[] {
            var n: astar.Neighbor[] = [];

            var height = grid.length;
            var width = grid[0].length;

            // west
            if (this.x > 0) {
                if (grid[this.y][this.x-1] === 0) {
                    n.push(new astar.Neighbor(new Node(grid,this.x-1,this.y),1));
                }
            }
            // east
            if (this.x < width-1) {
                if (grid[this.y][this.x+1] === 0) {
                    n.push(new astar.Neighbor(new Node(grid,this.x+1,this.y),1));
                }
            }
            // north
            if (this.y > 0) {
                if (grid[this.y-1][this.x] === 0) {
                    n.push(new astar.Neighbor(new Node(grid,this.x,this.y-1),1));
                }
            }
            // south
            if (this.y < height-1) {
                if (grid[this.y+1][this.x] === 0) {
                    n.push(new astar.Neighbor(new Node(grid,this.x,this.y+1),1));
                }
            }

            return n;
        }
    }

    export class MultipleGoals implements astar.IGoal {
        points: number[][];

        constructor(points: number[][]) {
            this.points = points;
        }

        isReached(node: astar.INode): boolean {
            var n = <Node>node;

            for (var i = 0; i < this.points.length; i++) {
                if (n.x === this.points[i][0] && n.y === this.points[i][1]) {
                    return true;
                }
            }

            return false;
        }
    }

    export class DijkstraHeuristic implements astar.IHeuristic {
        get(node: astar.INode,goal: astar.IGoal): number {
            return 0;
        }
    }

    export class EuclidianHeuristic implements astar.IHeuristic {
        get(node: astar.INode,goal: astar.IGoal): number {
            var n = <Node>node;
            var g = <MultipleGoals>goal;
            var minHeuristic = Infinity;
            for (var i = 0; i< g.points.length; i++) {
                var tmpHeuristic = Math.sqrt(
                    Math.pow(n.x - g.points[i][0],2) +
                    Math.pow(n.y - g.points[i][1],2));
                if (tmpHeuristic < minHeuristic) {
                    minHeuristic = tmpHeuristic;
                }
            }
            return minHeuristic;
        }
    }

    export class ManhattanHeuristic implements astar.IHeuristic {
        get(node: astar.INode,goal: astar.IGoal): number {
            var n = <Node>node;
            var g = <MultipleGoals>goal;
            var minHeuristic = Infinity;
            for (var i = 0; i< g.points.length; i++) {
                var tmpHeuristic =  Math.abs(n.x - g.points[i][0]) +
                                    Math.abs(n.y - g.points[i][1]);
                if (tmpHeuristic < minHeuristic) {
                    minHeuristic = tmpHeuristic;
                }
            }
            return minHeuristic;
        }
    }
}