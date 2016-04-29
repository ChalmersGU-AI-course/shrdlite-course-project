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
    // A dummy search result: it just picks the first possible neighbour
    var result : SearchResult<Node> = {
        path: [start],
        cost: 0
    };

    var start_nwp: NodeWithPath<Node> = new NodeWithPath(start);

    // The nodes already evaluated
    var closedSet:NodeWithPath<Node>[] = [];

    // Discovered node still not evaluated
    var openSet:NodeWithPath<Node>[] = [];
    openSet.push(start_nwp);

    var cameFrom:NodeWithPath<Node>[] = [];

    start_nwp.gScore = 0;
    //console.log(heuristics);
    start_nwp.fScore = heuristics(start_nwp.my_node);
    //console.log(nwp.fScore);
    var x = 0;
    while (openSet.length > 0 && x < 4) {
      //openSet
      var current = getOpenSetLowestfScore(openSet);
      if (goal(current.my_node)) {
        console.log("We found shortest way!");
        break;
      }
      // remove nodewitpath from openSet
      var index = openSet.indexOf(current, 0);
      if (index > -1) {
        openSet.splice(index, 1);
      }
      closedSet.push(current);
      console.log(current.my_node);
      console.log(closedSet.length);

      var neigboors: Edge<Node>[] = graph.outgoingEdges(current.my_node);
      for (let neighbor_edge of neigboors) {
        var neighboor_nwp: NodeWithPath<Node> = new NodeWithPath(neighbor_edge.to);
        console.log("Looking in closed list");
        if (isNodeInList(graph, closedSet, neighbor_edge.to)) {
          console.log("Node was already visited");
          continue;
        }
        var tentative_gScore:number = current.gScore + neighbor_edge.cost; // only one step to neighbor
        console.log("Looking in open list");
        if (!isNodeInList(graph, openSet, neighbor_edge.to)) {
          openSet.push(new NodeWithPath(neighbor_edge.to));
        } else if (tentative_gScore >= getGScoreForNode(openSet, neighbor_edge.to)) {
          continue;
        }
        neighboor_nwp.my_parent_node = current;
        neighboor_nwp.gScore = tentative_gScore;
        neighboor_nwp.fScore = tentative_gScore + heuristics(neighboor_nwp.my_node);
      }
      console.log("sa");
      x++;
    }

    return result;
}


class NodeWithPath<Node> {
  //public my_node: Node;
  public my_parent_node: NodeWithPath<Node>;
  public gScore: number = 10000000;
  public fScore: number = 10000000;

  constructor(public my_node : Node) {

  }
}
function getGScoreForNode<Node>(list: NodeWithPath<Node>[], element: Node) {
  for(let nwp of list) {
    if(nwp.my_node  == element) {
        return nwp.gScore;
    }
  }
  return -1;
}

function isNodeInList<Node>(graph: Graph<Node>, list: NodeWithPath<Node>[], element: Node) {
  for(let nwp of list) {
    //if (nwp.my_node.pos.x  == element.pos.x &&
    //nwp.my_node.pos.y  == element.pos.y) {
    if (nwp.my_node == element) {
      console.log("Was in list");
      return true;
    }
  }
  console.log("Was not in list");
  return false;
}

function getOpenSetLowestfScore<Node>(openSet: NodeWithPath<Node>[]): NodeWithPath<Node> {
  var lowest_nwp: NodeWithPath<Node> = null;
  for(let nwp of openSet) {
    if (lowest_nwp == null) {
      lowest_nwp = nwp;
      continue;
    }
    if (lowest_nwp.fScore > nwp.fScore) {
      lowest_nwp = nwp;
    }
  }
  return lowest_nwp;
}

function changeNode<Node>(camefrom: NodeWithPath<Node>[], _key: Node, _value: NodeWithPath<Node>) {
  for(let nwp of camefrom) {
    if (nwp.my_node == _key) {
      nwp.my_parent_node = _value;
      break;
    }
  }
}
/*
function changeNode(camefrom: Edge<Node>[], key: Node, value: Node) {
  for(var edge in camefrom) {
  //  if (edge.from === _key) {
      console.log(edge);
      //edge.to = _value;
      break;
    //}
  }

}
*/
