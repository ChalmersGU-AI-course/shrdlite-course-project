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
* @param timeout Maximum time (in seconds) to spend performing A\* search.
* @returns A search result, which contains the path from `start` to a node satisfying `goal` and the cost of this path.
*/
function aStarSearch<Node> (
    graph : Graph<Node>,
    start : Node,
    goal : (n:Node) => boolean,
    heuristics : (n:Node) => number,
    timeout : number
) : SearchResult<Node> {
    var hasTimedOut = false;

    var timer = setTimeout(function() {
        hasTimedOut = true;
    }, timeout);

    var openSet = new collections.Set<Node>();
    var closedSet = new collections.Set<Node>();

    openSet.add(start);

    var gScore = new collections.Dictionary<Node, number>();
    gScore.setValue(start, 0);

    var fScore = new collections.Dictionary<Node, number>();
    fScore.setValue(start, heuristics(start));

    var parent = new collections.Dictionary<Node, Node>();

    while (!openSet.isEmpty()) {
        if (hasTimedOut) {
          clearTimeout(timer);
          break;
        }

        var minFScore = Infinity;
        var current : Node;

        openSet.forEach(function(node) {
            if (fScore.getValue(node) < minFScore) {
                minFScore = fScore.getValue(node);
                current = node;
            }
        });

        if (goal(current)) {
            clearTimeout(timer);

            var result : SearchResult<Node> = {
                path: [current],
                cost: gScore.getValue(current)
            };

            while (parent.containsKey(current)) {
                current = parent.getValue(current);
                result.path.push(current);
            }

            result.path.reverse();
            return result;
        }

        openSet.remove(current);
        closedSet.add(current);

        var currentGScore = gScore.getValue(current);

        for (var edge of graph.outgoingEdges(current)) {
            var neighbor = edge.to;

            if (closedSet.contains(neighbor)) {
                continue;
            }

            var _gScore = currentGScore + edge.cost;

            if (!openSet.contains(neighbor)) {
                openSet.add(neighbor);
            } else if (_gScore >= gScore.getValue(neighbor)) {
                continue;
            }

            parent.setValue(neighbor, current);
            gScore.setValue(neighbor, _gScore);
            fScore.setValue(neighbor, _gScore + heuristics(neighbor));
        }
    }

    var result : SearchResult<Node> = {
        path: [],
        cost: Infinity
    };

    return result;
}
