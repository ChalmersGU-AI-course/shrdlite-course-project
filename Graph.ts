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
    var result : SearchResult<Node> = {
        path: [],
        cost: 0
    };

    //Compares priority of 2 nodes; highest prio is the one with lowest cost.
    //Gives <0 if b has prio, >0 if a has prio, =0 if they're equal
    function nodePriorityComparer( a : Node, b : Node){
      var aCost : number = toNodeCost.getValue(a) + nodeToGoalEstCost.getValue(a);
      var bCost : number = toNodeCost.getValue(b) + nodeToGoalEstCost.getValue(b);
      return bCost - aCost
    }
    function nodeEquals(a:Node , b:Node){
      return a.toString()===b.toString();
    }
    var startTime = new Date().getTime();
    //PriorityQueue that holds nodes with lowest cost as highest prio
    var pQueue = new collections.PriorityQueue<Node>(nodePriorityComparer);
    //Maps a node to it's calculated travel cost. Will eventually be lowest travel cost to that node
    var toNodeCost = new collections.Dictionary<Node,number>();
    //Maps a node to it's calculated travel cost + estimated cost to goal (according to heuristic)
    var nodeToGoalEstCost = new collections.Dictionary<Node,number>();
    //Maps a node to the previously visited node. Eventually according to the cheapest path. Used
    //at the end to find best path recursivly from the goal node.
    var previousNode = new collections.Dictionary<Node,Node>();
    //List of visited/evaluated nodes
    var visitedNodes = new collections.LinkedList<Node>();
    //List of discovered nodes
    var discoveredNodes = new collections.LinkedList<Node>();

    //initialising stuff
    toNodeCost.setValue(start,0);
    nodeToGoalEstCost.setValue(start,heuristics(start));
    pQueue.add(start);
    discoveredNodes.add(start);

    while(!pQueue.isEmpty()){
      if(new Date().getTime() - startTime > 1000*timeout){
        //Stop if we go over the given timeout(seconds), Date().getTime() is in milliseconds
        return null
      }
      //take highest priority node to expand
      var currentNode : Node = pQueue.dequeue();
      visitedNodes.add(currentNode);
      if(goal(currentNode)){
        //goal in fronteir
        break
      }
      //neighbours of highest prio node
      var currentNeighbourEdges : Edge<Node>[] = graph.outgoingEdges(currentNode);
      for(var i=0 ; i < currentNeighbourEdges.length ; i++){
        var iNeighbour : Node = currentNeighbourEdges[i].to;
        if(visitedNodes.contains(iNeighbour,nodeEquals)){
          //console.log("already VISITED " + iNeighbour.toString())
          //this neighbour is already in the frontier and evaluated
          continue
        }
        var thisPathCost : number = toNodeCost.getValue(currentNode) + currentNeighbourEdges[i].cost;
        if(discoveredNodes.contains(iNeighbour,nodeEquals)){
          //Previously discovered node, only update stuff if this is a better path
          //console.log("already DISCOVERED " + iNeighbour.toString())
          var oldPathCost : number = toNodeCost.getValue(iNeighbour);
          if(thisPathCost < oldPathCost){
            toNodeCost.setValue(iNeighbour,thisPathCost);
            previousNode.setValue(iNeighbour,currentNode);
          }
          continue
        }
        //console.log("NEW NODE:" + iNeighbour.toString());
        //this neighbour is a previously undiscovered node, update stuff
        toNodeCost.setValue(iNeighbour,thisPathCost);
        nodeToGoalEstCost.setValue(iNeighbour,heuristics(iNeighbour));
        previousNode.setValue(iNeighbour,currentNode);
        pQueue.add(iNeighbour)
        discoveredNodes.add(iNeighbour);
      }
    }
    // If all went well currentNode should be the goal node, and we can recursivly
    // rebuild the best path using previousNode
    result.cost = toNodeCost.getValue(currentNode);
    var recursiveNode : Node = currentNode;
    while(recursiveNode!=start){
      result.path.push(recursiveNode);
      recursiveNode = previousNode.getValue(recursiveNode);
    }
    result.path = result.path.reverse();
    return result;
}
