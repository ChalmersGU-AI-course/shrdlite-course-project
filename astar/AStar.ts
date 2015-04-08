///<reference path="../lib/node.d.ts"/>
///<reference path="../lib/collections.d.ts"/>

import C = require('../lib/collections');

export module AS { // AStar

  export interface Heuristic {
    heuristic(goal: Heuristic): number;    // compare length to goal
    cost(): number;                        // cost of path
    match(goal: Heuristic): boolean;       // see if goal is found
    getNeighbours(): Heuristic[];          // expand state to get next possible states
    hash(): number;
  }

  // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  // Helper function to enable easier toNumber implementation for Heuristic type
  export function hash(s: string): number {
    var hash = 0;
    if (s.length == 0) return hash;
    for (var i = 0; i < s.length; i++) {
      var chr = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /*
   * AStar implementation. Requires an implementation of Heuristic and ANode.
   */
  export function search<T extends Heuristic>(start: T,
                                              goal: T): T[] {

    var startNode = new ASNode(start, null);
    var graph = new ASGraph<T>(startNode);
    var frontier = new C.collections.PriorityQueue<ASNode<T>>(compClosure(goal));
    frontier.enqueue(startNode);

    while(!frontier.isEmpty()) {
      var current : ASNode<T> = frontier.dequeue();
      if(current.state.match(goal)) { // goal is found return path
        return path<T>(current, graph);
      }
      var neighbours = current.state.getNeighbours(); // get neighbour states
      var neighbourNode;
      for(var i=0; i<neighbours.length; i++) {
        neighbourNode = new ASNode(neighbours[i], current);
        // Multiple path pruning:
        // If a new path is cheaper exchange the old path with the new one.
        var h = neighbourNode.state.hash();
        var found = graph.get(h);
        var c = neighbourNode.state.cost();
        if(found === undefined || found.state.cost() > c) {
          graph.set(neighbourNode);
          frontier.enqueue(neighbourNode);
        }
      }
    } // while
  }


  //////////////////////////////////////////////////////////////////////
  // private classes and functions

  class ASNode<T extends Heuristic> {
    state: T;
    prev: number; // (id of node) just one node enables a walk back.
    constructor(state: T, prev: ASNode<T>) {
      this.state = state;
      if(prev)
        this.prev = prev.state.hash();
    }
  }

  interface HashTable<T extends Heuristic> {
    [key: number]: ASNode<T>;
  }

  class ASGraph<T extends Heuristic> {
    table: HashTable<T>;
    set(node: ASNode<T>): ASNode<T> {
      var hash = node.state.hash();
      this.table[hash] = node;
      return node;
    }
    get(k: number): ASNode<T> {
      return this.table[k];
    }
    constructor(node: ASNode<T>) {
      this.table = [];
      this.set(node);
    }
  }

  function compClosure<T extends Heuristic>(goal: T) {
    /*
     * Comparing function
     */
    function compare<T extends Heuristic>(a: ASNode<T>, b: ASNode<T>): number {
      // cost = g + h
      var aCost = a.state.cost() + a.state.heuristic(goal);
      var bCost = b.state.cost() + b.state.heuristic(goal);
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
  function path<T extends Heuristic>(n: ASNode<T>,
                                     graph: ASGraph<T>): T[] {
    var _path: T[] = [];
    var _n: ASNode<T> = n;
    while(_n != null) {
      _path.push(_n.state)
      _n = graph.get(_n.prev);
    }
    return _path.reverse();
  }
}
