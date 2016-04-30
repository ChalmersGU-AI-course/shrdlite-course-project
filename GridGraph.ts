///<reference path="Graph.ts"/>

// This is an example graph
// consisting of a 2-dimensional grid
// where neighbors are vertical and horisontal


interface Coordinate {
    x : number;
    y : number;
}


class GridNode {
    constructor(
        public pos : Coordinate
    ) {}

    add(delta : Coordinate) : GridNode {
        return new GridNode({
            x: this.pos.x + delta.x,
            y: this.pos.y + delta.y
        });
    }

    compareTo(other : GridNode) : number {
        return (this.pos.x - other.pos.x) || (this.pos.y - other.pos.y);
    }

    toString() : string {
        return "(" + this.pos.x + "," + this.pos.y + ")";
    }
}


class GridGraph implements Graph<GridNode> {
    private walls : collections.Set<GridNode>;

    constructor(
        public size : Coordinate,
        obstacles : Coordinate[]
    ) {
        this.walls = new collections.Set<GridNode>();
        for (var pos of obstacles) {
            this.walls.add(new GridNode(pos));
        }
        for (var x = -1; x <= size.x; x++) {
            this.walls.add(new GridNode({x:x, y:-1}));
            this.walls.add(new GridNode({x:x, y:size.y}));
        }
        for (var y = -1; y <= size.y; y++) {
            this.walls.add(new GridNode({x:-1, y:y}));
            this.walls.add(new GridNode({x:size.x, y:y}));
        }
    }

    outgoingEdges(node : GridNode) : Edge<GridNode>[] {
        var outgoing : Edge<GridNode>[] = [];
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (! (dx*dx == dy*dy)) {
                    var next = node.add({x:dx, y:dy});
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
                if (p.pos.x == n.pos.x && p.pos.y == n.pos.y)
                    return true;
            }
            return false;
        }
        var str = "";
        for (var y = this.size.y-1; y >= 0; y--) {
            // row of borders
            for (var x = 0; x < this.size.x; x++) {
                if (y == this.size.y || 
                    this.walls.contains(new GridNode({x:x,y:y})) ||
                    this.walls.contains(new GridNode({x:x,y:y+1}))
                   ) str += "+---"
                else str += "+   ";
            }
            str += "+\n";
            // row of cells
            for (var x = 0; x < this.size.x; x++) {
                var xynode = new GridNode({x:x,y:y});
                // the wall between cells
                if (x == 0 || this.walls.contains(xynode) ||
                    this.walls.contains(new GridNode({x:x-1,y:y}))
                   ) str += "|"
                else str += " ";
                // the cell
                if (start && x == start.pos.x && y == start.pos.y) str += " S "
                else if (goal && goal(xynode)) str += " G "
                else if (path && pathContains(path, xynode)) str += " O "
                else if (this.walls.contains(xynode)) str += "###"
                else str += "   ";
            }
            str += "|\n";
        }
        str += new Array(this.size.x + 1).join("+---") + "+\n";
        return str;
    }    
}

