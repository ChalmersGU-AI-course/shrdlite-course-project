///<reference path="../lib/node.d.ts"/>
///<reference path="collections.d.ts"/>

// external module
import C = require('./collections');

export module AS {

  export class ANode<T extends Heuristic> {
    state: T;
    prev: ANode<T>;   // just one node enables a walk back to start to return the path.
    next: ANode<T>[]; // list of possible nodes to walk to
    cost: number;
    constructor(state: T, prev?: ANode<T>, next?: ANode<T>[], cost=0) {
      this.state = state;
      this.prev = prev;
      this.next = next;
      this.cost = cost;
    }
  }

  export interface Heuristic {
    heuristic(goal: Heuristic): number; // compare length to goal
    match(goal: Heuristic): boolean;    // see if goal is found
  }

  /*
   * AStar simple implementation. Requires an implementation of Heuristic and ANode.
   * TODO: Put a limit on search for termination
   * TODO: Cycle checking: Keep record of visited nodes for termination and dont
   * expand (add to PQ if they are already visited)
   * TODO: Multiple path pruning: Keep redord of paths to visitied nodes and their
   * cost. If a new path is cheaper exchange the old path with the new one.
   * TODO: If h satisfies the monotone restriction (h(m) - h(n) < cost(m, n))
   * then, A* with multiple path pruning always finds the shortest path to a goal.
   */
  export function search<T extends Heuristic>(start: ANode<T>,
                                              goal: T): T[] {
    // var comp = new Compare(goal);
    var frontier = new C.collections.PriorityQueue<ANode<T>>(compClosure(goal));
    frontier.enqueue(start);

    while(!frontier.isEmpty()) {
      var n : ANode<T> = frontier.dequeue();
      if(n) {
        if(n.state.match(goal)) { /// how should this be implemented?
          return path<T>(n);
        }
        var neighbours = n.next;
        for(var i=0; i<neighbours.length; i++) {
          var _neighbour = neighbours[i];
          frontier.enqueue(_neighbour);
        }
      } else {
        throw "Node undefined";
      }
    }
    // return [start.state];
  };


  //////////////////////////////////////////////////////////////////////
  // private classes and functions

  /*
   * Class for wrapping the comparing function used by PQ
   */
  // class Compare<T extends Heuristic> {
  //   goal: T;
  //   constructor(goal: T) {
  //     this.goal = goal;
  //   }
  //   /*
  //    * Comparing function
  //    */
  //   compare(a: Node<T>, b: Node<T>): number {
  //     var aCost = this.fcost(a, this.goal);
  //     var bCost = this.fcost(b, this.goal);
  //     var comp;
  //     if (aCost > bCost)
  //       comp = 1;
  //     else if(aCost === bCost)
  //       comp = 0;
  //     else
  //       comp = -1;
  //     return comp
  //   }
  //   /*
  //    * Adds cost function and heuristic function for PQ to work properly
  //    */
  //   fcost(current: Node<T>, goal: T): number {
  //     return current.cost + current.state.heuristic(goal);
  //   }
  // }

  function compClosure<T extends Heuristic>(goal: T) {
    /*
     * Comparing function
     */
    function compare<T extends Heuristic>(a: ANode<T>, b: ANode<T>): number {
      var aCost = this.fcost(a, null);
      var bCost = this.fcost(b, null);
      var res;
      if (aCost < bCost)
        res = 1;
      else if(aCost > bCost)
        res = -1;
      else
        res = 0;
      return res;
    }
    return compare;
  }

  /*
   * Adds cost function and heuristic function for PQ to work properly
   */
  function fcost<T extends Heuristic>(current: ANode<T>, goal: T): number {
    return current.cost + current.state.heuristic(goal);
  }

  /*
   * extracts the path from the ANode back to start node
   */
  function path<T extends Heuristic>(n: ANode<T>) : T[] {
    var _path: T[] = [];
    var n: ANode<T> = n;
    while(n != null) {
      _path.push(n.state)
      n = n.prev;
    }
    return _path.reverse();
  }


}
