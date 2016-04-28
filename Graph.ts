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
    from: Node;
    to: Node;
    cost: number;
}

/** A directed graph. */
interface Graph<Node> {
    /** Computes the edges that leave from a node. */
    outgoingEdges(node: Node): Edge<Node>[];
    /** A function that compares nodes. */
    compareNodes: collections.ICompareFunction<Node>;
}

/** Type that reports the result of a search. */
class SearchResult<Node> {
    /** The path (sequence of Nodes) found by the search algorithm. */
    path: Node[];
    /** The total cost of the path. */
    cost: number;
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
function aStarSearch<Node>(
    graph: Graph<Node>,
    start: Node,
    goal: (n: Node) => boolean,
    heuristics: (n: Node) => number,
    timeout: number
): SearchResult<Node> {
    var result: SearchResult<Node> = {
        path: [],
        cost: 0
    };
    // The set containing nodes that have been evaluated (i.e dequeued from the priority queue)
    var closedNodesSet: collections.Set<Node> = new collections.Set<Node>();
    // Set up a dictionary keeping track of minimum gScore for each node discovered
    var gScoreDict: collections.Dictionary<Node, number> = new collections.Dictionary<Node, number>();
    gScoreDict.setValue(start, 0);
    // A dictionary keeping track of the parent/predecessor node yielding the best (minimum) score for each (possible) node
    var parentDict: collections.Dictionary<Node, Node> = new collections.Dictionary<Node, Node>();
    // Compare function used by the PriorityQueue to determine the priority for each node in the queue,
    // the lesser the score the higher the priority
    function compareNodes(a: Node, b: Node): number {
        // Using the fScore (total score) for comparison
        var aScore: number = gScoreDict.getValue(a) + heuristics(a);
        var bScore: number = gScoreDict.getValue(b) + heuristics(b);
        if (aScore < bScore) {
            return 1;
        } if (aScore > bScore) {
            return -1;
        }
        return 0;
    }
    // A priority queue containing discovered Nodes still to be evaluated
    var openNodesPQ: collections.PriorityQueue<Node> = new collections.PriorityQueue<Node>(compareNodes);
    openNodesPQ.enqueue(start);
    var currentNode: Node = start;

    while (!openNodesPQ.isEmpty()) {
        currentNode = openNodesPQ.dequeue();
        if (goal(currentNode)) {
            break;
        }
        closedNodesSet.add(currentNode);
        var edges: Edge<Node>[] = graph.outgoingEdges(currentNode);

        // Discover/look at all the neighbor nodes
        for (var j = 0; j < edges.length; j++) {
            // The neighbor node
            var toNode = edges[j].to;
            // Only continue to calculate the gScore for the neighbor node if the neighbor node hasn't been evaluated (dequeued from the PQ)
            if (!closedNodesSet.contains(toNode)) {
                // Distance from start node to current neighbor node
                var gScore: number = gScoreDict.getValue(currentNode) + edges[j].cost;
                // Record/Store the gScore from start to the neighbor node if it hasn't been recorded in the dictionary,
                // or if the current gScore is better (less) than the already recorded gScore
                if (collections.isUndefined(gScoreDict.getValue(toNode)) || gScore < gScoreDict.getValue(toNode)) {
                    gScoreDict.setValue(toNode, gScore);
                    parentDict.setValue(toNode, currentNode);
                    openNodesPQ.enqueue(toNode);
                }
            }
        }

    }

    // Get the optimal score from start to goal node
    result.cost = gScoreDict.getValue(currentNode);
    // Construct the path (from goal, back to start and reverse it)
    while (parentDict.containsKey(currentNode)) {
        result.path.push(currentNode);
        currentNode = parentDict.getValue(currentNode);
    }
    result.path.reverse();
    return result;
}

