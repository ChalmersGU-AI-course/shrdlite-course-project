///<reference path="../lib/node.d.ts"/>
///<reference path="../lib/collections.ts"/>

module Astar {

  /*
   * Necessary Interface for usage of the astar search function.
   * OBSERVE: Use memoization in actual implementation of (heuristic, hash)
   */
  export interface State {
    heuristic(solution: any): number;  // compare length to goal
    match(solution: any): boolean;     // see if goal is found
    expand(): Transition[];            // expand to next possible states
    toString(): string;
  }

  /*
   * Represents a transition in a problem graph.
   */
  export interface Transition {
    cost: number;
    state: State;
  }

  /*
   * Represents solution by a path, and a graph that was created during the
   * search for eventually further investigation.
   */
  export interface Solution<T extends State> {
    path?: T[];
    graph: ASGraph<T>;
    stats: {
      expansions: number;
      visits: number;
    }
  }

  /*
   * AStar search implementation. Requires an implementation of State.
   */
  export function search<T extends State>(start: T, g: ASGraph<T>, goal: any): Solution<T> {

    var startNode = new ASNode<T>(start, 0, null, null);
    var expansions = 0, visited = 0;              // count the nr of expansions and visits
    var graph = g? g : new ASGraph<T>(startNode); // if graph not given create one
    var frontier = new collections.PriorityQueue<ASNode<T>>(comparator(goal));

    frontier.enqueue(startNode);

    // work through the priority queue until a solution is found
    while(!frontier.isEmpty()) {
      var current : ASNode<T> = frontier.dequeue();
      visited++;
      if(current.state.match(goal)) {             // goal is found return path, graph and stats
        return {
          path: path<T>(current, graph),
          graph: graph,
          stats: {
            expansions: expansions,
            visits: visited
          }
        };
      }
      var transitions = current.state.expand();   // get neighbour transitions
      var neighbour, trans;
      if(transitions && transitions.length > 0) {
        expansions++;
        // for all transitions add a new node to the graph, and if not added already enqueue
        for(var i=0; i<transitions.length; i++) {
          trans = transitions[i];
          neighbour = new ASNode<T>(<T>trans.state, trans.cost, current, null);
          if(graph.set(neighbour)) {
            frontier.enqueue(neighbour);
          }
        }
      }
    } // while
    return {                                      // no solution found
      graph: graph,
      stats: {
        expansions: expansions,
        visits: visited
      }
    };
  }

  // Helper function to explore Graph
  export function printGraph<T extends State>(graph: ASGraph<T>, maxDepth: number) {
    var start = graph.start;
    function prettyPrint(node: ASNode<T>, indent: number, level: number) {
      if(level >= maxDepth) {
        return;
      } else {
        var space = Array(indent).join(" ")
        console.log(space + node.state.toString()); // print
        var next = node.next;
        for(var i=0; i<next.length; i++) {
          var n = next[i];
          prettyPrint(n, indent+3, level+1);        // recursive printing
        }
      }
    }
    prettyPrint(start, 0, 0);
  }

  //////////////////////////////////////////////////////////////////////
  // private classes and functions

  /*
   * A-Star Node: represents a node in the problem graph.
   */
  class ASNode<T extends State> {
    state: T;
    prev: ASNode<T>; // (id of node) just one node enables a walk back.
    next: ASNode<T>[] = [];
    totalCost: number = 0;
    constructor(state: T, cost: number, prev: ASNode<T>, next: [ASNode<T>]) {
      this.state = state;
      this.totalCost = cost;
      if(prev) {
        this.prev = prev;
        this.totalCost += prev.totalCost;
      }
      if(next)
        this.next = next;
    }
    toString() {
      return this.state.toString();
    }
  }

  /*
   * A-Star graph: represents problem graph.
   * TODO: another implementation could maybe be faster? Right now the search is
   * quite slow, which is likeluy due to the ASGraph implementation
   */
  class ASGraph<T extends State> {
    start: ASNode<T>;
    table: collections.Dictionary<ASNode<T>, ASNode<T>>;             // ASGraph stores nodes in Hashtable to save space
    set(node: ASNode<T>): boolean {
      var similarNode = this.table.getValue(node);
      // set node only if not already set or the current node is cheaper
      if(!similarNode|| node.totalCost < similarNode.totalCost) {
        this.table.setValue(node, node);
        if(node.prev) {
          var prev = this.table.getValue(node.prev);
          // only add node to previous next if not already added
          if(prev && !(prev.next.indexOf(node) > -1)) // not sure about the second condition
            prev.next.push(node);
        }
        return true;
      } else {
        return false;
      }
    }
    get(k: number): ASNode<T>{
      return this.table[k];
    }
    constructor(node: ASNode<T>) {
      this.start = node;
      this.table = new collections.Dictionary<ASNode<T>, ASNode<T>>();
      this.set(node);
    }
  }

  /*
   * Used for determining what node to expore next in the astar search function.
   */
  function comparator<T extends State>(goal: any) {
    /*
     * Comparing function
     */
    return function compare(a: ASNode<T>, b: ASNode<T>): number {
      // cost = g + h
      var aCost = a.totalCost + a.state.heuristic(goal);
      var bCost = b.totalCost + b.state.heuristic(goal);
      if (aCost < bCost)
	return 1;
      else if(aCost > bCost)
	return -1;
      else
	return 0;
    }
  }

  /*
   * extracts the path from the ANode back to start node
   */
  function path<T extends State>(n: ASNode<T>, graph: ASGraph<T>): T[] {
    var _path: T[] = [];
    var _n = n;
    while(_n != null) {
      _path.push(_n.state)
      _n = _n.prev;
    }
    return _path.reverse();
  }

}
