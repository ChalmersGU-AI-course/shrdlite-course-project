///<reference path="lib/collections.ts"/>
///<reference path="lib/node.d.ts"/>

/** Graph module
*
*  Types for generic A\* implementation.
*
*  *NB.* The only part of this module
*  that you should change is the `aStarSearch` function. Everything
*  else should be used as-is.
*/

import forEach = collections.arrays.forEach;
/** An edge in a graph. */
class Edge<Node> {
    from : Node;
    to   : Node;
    cost : number;
}

/** A directed graph. */
interface Graph<Node> {
    /** Computes the edges that leave from a node. */
    outgoingEdges(node : Node) : Edge<Node>[];
    /** A function that compares nodes. */
    compareNodes : collections.ICompareFunction<Node>;
}

/** Type that reports the result of a search. */
class SearchResult<Node> {
    /** The path (sequence of Nodes) found by the search algorithm. */
    path : Node[];
    /** The total cost of the path. */
    cost : number;
}

/**
* A\* search implementation, parameterised by a `Node` type. The code
* here is just a template; you should rewrite this function
* entirely. In this template, the code produces a dummy search result
* which just picks the first possible neighbour.
*
* Note that you should not change the API (type) of this function,
* only its body.
* @param graph The graph on which to perform A\* search.
* @param start The initial node.
* @param goal A function that returns true when given a goal node. Used to determine if the algorithm has reached the goal.
* @param heuristics The heuristic function. Used to estimate the cost of reaching the goal from a given Node.
* @param timeout Maximum time to spend performing A\* search.
* @returns A search result, which contains the path from `start` to a node satisfying `goal` and the cost of this path.
*/

function aStarSearch<Node> (
    graph : Graph<Node>,
    start : Node,
    goal : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout : number
) : SearchResult<Node> {

    var startTime = Date.now();

    var closedSet = new collections.Set<Node>();
    var openSet = new collections.Set<Node>();
    openSet.add(start);
    var cameFrom : NodeMap<Node>  = {};
    var gScore : NumberMap = {};
    gScore[start.toString()] = 0;
    var fScore: NumberMap = {};
    fScore[start.toString()] = heuristics(start);

    while (openSet.size() > 0){
        var current = findLowestScore(openSet, fScore);

        if(goal(current)){
            return {
                path: reconstructPath(cameFrom, current).reverse(),
                cost: gScore[current.toString()]
            };
        }

        openSet.remove(current);
        closedSet.add(current);

        var outgoing = graph.outgoingEdges(current);

        for (var ei in outgoing){
            var e = outgoing[ei];
            //console.log(e.to.toString() + " " + e.from.toString());
            var neighbor = e.to;
            if(closedSet.contains(neighbor)){
                continue;
            }

            var tentativeScore = lookupWithDefaultInfinity(current.toString(), gScore) + e.cost;
            //console.log("Current: ", current);
            //console.log("Tscore: ", tentativeScore);
            //console.log("e.cost: ", e.cost);
            if (!openSet.contains(neighbor)){
                openSet.add(neighbor);
            } else if (tentativeScore >= lookupWithDefaultInfinity(neighbor.toString(), gScore)){
                continue;
            }

            cameFrom[neighbor.toString()] = current;
            gScore[neighbor.toString()] = tentativeScore;
            fScore[neighbor.toString()] = gScore[neighbor.toString()] + heuristics(neighbor);

        }

        //console.log(gScore);

        var now = Date.now();

        if(now - startTime > timeout){
            throw "Timeout reached";
        }


    }

    throw "No path found";
}



function reconstructPath<Node>(cameFrom: NodeMap<Node>, current: Node) : Node[] {
    var totalPath = [current];
    while(Object.keys(cameFrom).some(key => key == current.toString()) ){
        current = cameFrom[current.toString()];
        totalPath.push(current);
    }
    return totalPath;
}

function findLowestScore<Node>(
    nodes: collections.Set<Node>,
    map: NumberMap
) : Node {

    var startAcc : NodeValueAcc<Node> = {
        value: Infinity,
        node: undefined
    };
    var nodeArray = nodes.toArray();
    var res = nodeArray.reduce(function(acc, curr) {
        var currVal = lookupWithDefaultInfinity(curr.toString(), map);
        if(!acc.node || currVal < acc.value){
            acc.node = curr;
            acc.value = currVal;
        }
        return acc;
    }, startAcc);

    return res.node;

}

function lookupWithDefault(
    key: string,
    map: NumberMap,
    def: number
): number {
    var res = map[key];
    //console.log("Map: ", map, "Key: ", key, "res: ", res);
    if (res !== undefined) {
        return res;
    } else {
        return def;
    }
}

function lookupWithDefaultInfinity(key: string, map: NumberMap) : number {
    return lookupWithDefault(key, map, Infinity)
}

interface NumberMap { [s: string]: number; }
interface NodeMap<Node> { [s: string]: Node }

interface NodeValueAcc<Node> {
    value: number; 
    node: Node;
}

//////////////////////////////////////////////////////////////////////
// here is an example graph

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

/** Example Graph. */
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
                if (! (dx == 0 && dy == 0)) {
                    var next = node.add({x:dx, y:dy});
                    if (! this.walls.contains(next)) {
                        outgoing.push({
                            from: node,
                            to: next,
                            cost: Math.sqrt(dx*dx + dy*dy)
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

    toString() : string {
        var borderRow = "+" + new Array(this.size.x + 1).join("--+");
        var betweenRow = "+" + new Array(this.size.x + 1).join("  +");
        var str = "\n" + borderRow + "\n";
        for (var y = this.size.y-1; y >= 0; y--) {
            str += "|";
            for (var x = 0; x < this.size.x; x++) {
                str += this.walls.contains(new GridNode({x:x,y:y})) ? "## " : "   ";
            }
            str += "|\n";
            if (y > 0) str += betweenRow + "\n";
        }
        str += borderRow + "\n";
        return str;
    }

    drawPath(start : GridNode, goal : GridNode, path : GridNode[]) : string {
    function pathContains(path : GridNode[], n : GridNode) : boolean {
        for (var p of path) {
            if (p.pos.x == n.pos.x && p.pos.y == n.pos.y)
                return true;
        }
        return false;
    }
    var borderRow = "+" + new Array(this.size.x + 1).join("--+");
    var betweenRow = "+" + new Array(this.size.x + 1).join("  +");
    var str = "\n" + borderRow + "\n";
    for (var y = this.size.y-1; y >= 0; y--) {
        str += "|";
        for (var x = 0; x < this.size.x; x++) {
            str += this.walls.contains(new GridNode({x:x,y:y})) ? "## " :
                (x == start.pos.x && y == start.pos.y ? " S " :
                    (x == goal.pos.x && y == goal.pos.y ? " G " :
                        ((pathContains(path, new GridNode({x:x,y:y})) ? ' * ' : "   "))));
        }
        str += "|\n";
        if (y > 0) str += betweenRow + "\n";
    }
    str += borderRow + "\n";
    return str;
}
}
