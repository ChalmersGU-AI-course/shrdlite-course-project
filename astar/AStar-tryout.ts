///<reference path="../lib/node.d.ts"/>
///<reference path="collections.d.ts"/>

import C = require('./collections');

export module AS { // AStar

  export class ANodeDict<T extends Heuristic> {
    dict: C.collections.Dictionary<string, ANode<T>>;
    set(name: string, node: ANode<T>): ANode<T> {
      return this.dict.setValue(name, node);
    }
    get(name: string): ANode<T> {
      return this.dict.getValue(name);
    }
    constructor() {
      this.dict = new C.collections.Dictionary<string, ANode<T>>();
    }
  }

  export class ANode<T extends Heuristic> {
    state: T;
    prev: string;   // just one node enables a walk back to start to return the path.
    next: string[]; // list of possible nodes to walk to
    cost: number;
    constructor(state: T, prev: string, next: string[], cost=0) {
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
   * TODO: Cycle checking: Keep record of visited nodes for termination and dont
   * expand (add to PQ if they are already visited)
   * TODO: Multiple path pruning: Keep redord of paths to visitied nodes and their
   * cost. If a new path is cheaper exchange the old path with the new one.
   * TODO: If h satisfies the monotone restriction (h(m) - h(n) < cost(m, n))
   * then, A* with multiple path pruning always finds the shortest path to a goal.
   */
  export function search<T extends Heuristic>(start: ANode<T>,
                                              goal: T,
                                              dict: ANodeDict<T>): T[] {
    var frontier = new C.collections.PriorityQueue<ANode<T>>(compClosure(goal));
    frontier.enqueue(start);

    while(!frontier.isEmpty()) {
      var n : ANode<T> = frontier.dequeue();
      if(n) {                     // check if node is undefined
        if(n.state.match(goal)) {
          return path<T>(n, dict);
        }
        for(var i=0; i<n.next.length; i++) { // for all neighbours
          var _neighbour = dict.get(n.next[i]);
          frontier.enqueue(_neighbour);
        }
      } else {
        throw "Node undefined";
      }
    }
  };


  //////////////////////////////////////////////////////////////////////
  // private classes and functions

  function compClosure<T extends Heuristic>(goal: T) {
    /*
     * Comparing function
     */
    function compare<T extends Heuristic>(a: ANode<T>, b: ANode<T>): number {
      var aCost = a.cost + a.state.heuristic(goal);
      var bCost = b.cost + b.state.heuristic(goal);
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
   * extracts the path from the ANode back to start node
   */
  function path<T extends Heuristic>(n: ANode<T>,
                                     dict: ANodeDict<T>): T[] {
    var _path: T[] = [];
    var _n: ANode<T> = n;
    while(_n != null) {
      _path.push(_n.state)
      _n = dict.get(_n.prev);
    }
    return _path.reverse();
  }


}
