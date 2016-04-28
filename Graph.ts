///<reference path="lib/collections.ts"/>
///<reference path="lib/node.d.ts"/>

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
    // Print detailed script behaviour only if desired
    var VERBOSE = 0;
    var verbosePrint = function (s : string) {
        if (VERBOSE) {
            console.log(s);
        }
    }
    
    // Null value for initializing node variables
    var nullNode = function() : Node { return undefined; }();

    // "Hashing" function to identify nodes based on their toString() function
    var pseudoHashingFn = function (key : Node) : string {
        return key.toString();
    };

    // Initialize data structures
    var frontier = new Dictionary<Node, number>(pseudoHashingFn);
    frontier.setValue(start, heuristics(start));
    var closed = new Dictionary<Node, Node>();
    closed.setValue(start, start);
    var gCosts = new Dictionary<Node, number>(pseudoHashingFn);
    gCosts.setValue(start, 0);

    // Sneakily start time keeping here to not track set up time ;)
    var startTime = new Date();
    var timeoutHasNotPassed = function (currentTime : Date) : boolean {
        return currentTime.getSeconds() - startTime.getSeconds() < timeout;
    }

    // Initialize empty goal state
    var goalState = nullNode;

    while (!frontier.isEmpty() && timeoutHasNotPassed(new Date())) {
        // Retrieve node with lowest fCost and remove from frontier
        var currentNode = nullNode;
        frontier.forEach(function (n) {
            if (!currentNode || frontier.getValue(n) < frontier.getValue(currentNode)) {
                currentNode = n;
            }
        });
        frontier.remove(currentNode);
        verbosePrint('Currently exploring: ' + currentNode.toString() + ' from ' + closed.getValue(currentNode));

        // Break when goal node is reached
        if (goal(currentNode)) {
            goalState = currentNode;
            break;
        }

        // Add potential neighbours to queue
        graph.outgoingEdges(currentNode).forEach(function (edge) {
            // Calculate fCost of neighbour node as traveling cost so far plus ?
            var newCost = gCosts.getValue(edge.from) + edge.cost;
            
            // Only consider new node of it has not been explored or its cost has lowered
            if (!closed.containsKey(edge.to) || newCost < gCosts.getValue(edge.to)) {
                verbosePrint('\tExpanding ' + edge.to.toString() + ' with cost ' + newCost + '. Earlier cost: ' + gCosts.getValue(edge.to));
                
                // Set or update traveling cost so far to the current node
                gCosts.setValue(edge.to, newCost)

                // Add node to frontier with fCost (cost so far + heuristic) as priority
                frontier.setValue(edge.to, newCost + heuristics(edge.to));

                // Add to closed nodes with currentNode as origin
                closed.setValue(edge.to, edge.from)
            }
        });
    }


    // Reconstruct path and cost
    currentNode = goalState;
    var visitedPath = new LinkedList<Node>();
    while (currentNode != start) {
        visitedPath.add(currentNode);
        currentNode = closed.getValue(currentNode);
    }
    visitedPath.add(currentNode);
    visitedPath.reverse();

    // Pack into specified SearchResult data structure and return
    var result : SearchResult<Node> = {
        path: visitedPath.toArray(),
        cost: gCosts.getValue(goalState)
    };
    return result;
}
