///<reference path="lib/node.d.ts"/>
///<reference path="lib/collections.ts"/>
import collections = require('./lib/collections.collections')
var Dictionary = collections.Dictionary;
var LinkedList = collections.LinkedList;

/** Graph module
 *
 *  Types for generic A\* implementation.
 *
 *  *NB.* The only part of this module
 *  that you should change is the `aStarSearch` function. Everything
 *  else should be used as-is.
 */

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

    var frontier = new Dictionary<Node, number>();
    frontier.setValue(start, heuristics(start));
    var closed = new Dictionary<Node, Node>();
    var gCosts = new Dictionary<Node, number>();
    var numIterations = 0;

    var goalState = undefined;

    while (!frontier.isEmpty() && numIterations <= timeout) {
        // Retrieve node with lowest fCost
        var currentNode = undefined;
        frontier.forEach(function (node) {
            if (!currentNode) {
                currentNode = node;
            } else {
                if (frontier.getValue(node) < frontier.getValue(currentNode)) {
                    currentNode = node;
                }
            }
        });

        // Break when goal node is reached
        if (goal(currentNode)) {
            goalState = currentNode;
            break;
        }

        // Add potential neighbours to queue
        graph.outgoingEdges(currentNode).forEach(function (edge) {
            // Only consider new node of it has not been explored or its cost has lowered
            if (!closed.containsKey(edge.to) || gCosts.getValue(edge.from) + edge.cost < gCosts.getValue(edge.to)) {
                gCosts.setValue(edge.to, gCosts.getValue(edge.from) + edge.cost)

                // fCost = gCost + hCost
                var fCost = gCosts.getValue(edge.to) + heuristics(edge.to);
                frontier.setValue(edge.to, fCost);

                closed.setValue(edge.to, edge.from)
            }
        });

        numIterations += 1;
    }

    // Reconstruct path and cost
    currentNode = closed.getValue(goalState);
    var visitedPath = new LinkedList<Node>();
    while (currentNode !== start) {
        visitedPath.add(currentNode);
        currentNode = closed.getValue(currentNode);
    }
    visitedPath.add(currentNode);
    visitedPath.reverse();

    var result : SearchResult<Node> = {
        path: visitedPath.toArray(),
        cost: gCosts.getValue(goalState)
    };
    return result;
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
}
