
import {Edge, Graph} from "./Graph";
import Set from "./lib/typescript-collections/src/lib/Set";

/********************************************************************************
** GridGraph

This is an example implementation of a Graph, consisting of a 2-dimensional grid.
Neighbours are vertical and horisontal, so you can move in 4 different direction.
This file is only used by 'test-astar.ts', and not by the Shrdlite system.

You should not edit this file.
********************************************************************************/

export type Coordinate = [number, number];  // [x,y] coordinate


// An implementation of a Graph node.

export class GridNode {
    constructor(
        public x : number,
        public y : number
    ) {}

    add(dx : number, dy : number) : GridNode {
        return new GridNode(this.x + dx, this.y + dy);
    }

    compareTo(other : GridNode) : number {
        return (this.x - other.x) || (this.y - other.y);
    }

    toString() : string {
        return "(" + this.x + "," + this.y + ")";
    }
}


// An implementation of a 2d grid graph.

export class GridGraph implements Graph<GridNode> {
    private walls : Set<GridNode>;

    constructor(
        public xsize : number,
        public ysize : number,
        obstacles : Coordinate[]
    ) {
        this.walls = new Set<GridNode>();
        for (var [x,y] of obstacles) {
            this.walls.add(new GridNode(x, y));
        }
        for (var x = -1; x <= xsize; x++) {
            this.walls.add(new GridNode(x, -1));
            this.walls.add(new GridNode(x, ysize));
        }
        for (var y = -1; y <= ysize; y++) {
            this.walls.add(new GridNode(-1, y));
            this.walls.add(new GridNode(xsize, y));
        }
    }

    outgoingEdges(node : GridNode) : Edge<GridNode>[] {
        var outgoing : Edge<GridNode>[] = [];
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (! (dx*dx == dy*dy)) {
                    var next = node.add(dx,dy);
                    if (! this.walls.contains(next)) {
                        outgoing.push({
                            from: node,
                            to: next,
                            cost: 1 
                        });
                    }
                }
            }
        }
        return outgoing;
    }

    compareNodes(a : GridNode, b : GridNode) : number {
        return a.compareTo(b);
    }

    toString(start? : GridNode, goal? : (n:GridNode) => boolean, path? : GridNode[]) : string {
        function pathContains(path : GridNode[], n : GridNode) : boolean {
            for (var p of path) {
                if (p.x == n.x && p.y == n.y)
                    return true;
            }
            return false;
        }
        var str = "";
        for (var y = this.ysize-1; y >= 0; y--) {
            // row of borders
            for (var x = 0; x < this.xsize; x++) {
                if (y == this.ysize || 
                    this.walls.contains(new GridNode(x, y)) ||
                    this.walls.contains(new GridNode(x, y+1))
                   ) str += "+---"
                else str += "+   ";
            }
            str += "+\n";
            // row of cells
            for (var x = 0; x < this.xsize; x++) {
                var xynode = new GridNode(x, y);
                // the wall between cells
                if (x == 0 || this.walls.contains(xynode) ||
                    this.walls.contains(new GridNode(x-1, y))
                   ) str += "|"
                else str += " ";
                // the cell
                if (start && x == start.x && y == start.y) str += " S "
                else if (goal && goal(xynode)) str += " G "
                else if (path && pathContains(path, xynode)) str += " O "
                else if (this.walls.contains(xynode)) str += "###"
                else str += "   ";
            }
            str += "|\n";
        }
        str += new Array(this.xsize + 1).join("+---") + "+\n";
        return str;
    }    
}

