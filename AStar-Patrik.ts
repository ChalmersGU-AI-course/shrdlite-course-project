///<reference path="lib/node.d.ts"/>
///<reference path="World.ts"/>

var PQ = require('libstl').PriorityQueue;

module AStar {

  export class Node {
    state: any;
    current: Node;
    prev: Node;   // just one node enables a walk back to start to return the path.
    next: Node[]; // list of possible nodes to walk to
    cost: number; // cost until now for the path (+1)
    constructor(state: any, current: Node, prev?: Node, next?: Node[], cost = 0) {
      this.state = state;
      this.current = current;
      this.prev = prev;
      this.next = next;
      this.cost = cost;
    }
  }

  /*
   * Heuristic function for estimating cost to reach end goal.
   */
  export interface heuristic { (n: Node): number; }

  /*
   * Predicate function for wheather AStarSearch has reached the goal state
   *
   * @param World
   * @return true if the state belongs to the set of goal states
   *         false otherwise
   */
  export interface goalIsFound { (n: Node): boolean; }

  /*
   * AStar implementation. Requires an implementation of foundGoal and Node.
   * @param World: start of search
   * @param foundGoal: callback to check if goal is found
   * @param h: callback to estimate the remaining path cost
   */
  export function search(graph: Node,
                         found: goalIsFound,
                         h: heuristic) : any[] {
    var frontier = PQ.new();
    var node = graph.current;
    frontier.enqueue(node, fcost(node, h));
    while(!frontier.isEmpty()) {
      var n = frontier.dequeue();
      if(found(n)) {
        return path(n);
      }
      for(var i=0; i<n.next.length; i++) {
        var _neighbour = n.next[i];
        frontier.enqueue(_neighbour, fcost(_neighbour, h));
      }
    }
  };

  //////////////////////////////////////////////////////////////////////
  // private functions

  /*
   * only adds cost function and heuristic function
   * f = g + h
   */
  function fcost(n: Node, h: heuristic) : number {
    return n.cost + h(n);
  }

  /*
   * extracts the path from the Node back to start node
   */
  function path(n: Node) : any[] {
    var _path = [];
    var n = n;
    while(n != null) {
      _path.push(n)
      n = n.prev;
    }
    return _path.reverse();
  }

}



