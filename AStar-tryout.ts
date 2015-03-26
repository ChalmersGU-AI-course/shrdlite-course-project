///<reference path="lib/node.d.ts"/>
///<reference path="World.ts"/>

var PQ = require('libstl').PriorityQueue;

export class Node<T extends Heuristic> {
  state: T;
  prev: Node<T>;   // just one node enables a walk back to start to return the path.
  next: Node<T>[];       // list of possible nodes to walk to
  cost: number;
  constructor(state: T, prev?: Node<T>, next?: Node<T>[], cost=0) {
    this.state = state;
    this.prev = prev;
    this.next = next;
    this.cost = cost;
  }
}

export interface Heuristic {
  heuristic(goal: Heuristic): number; // compare length to goal
}

/*
 * AStar implementation. Requires an implementation of foundGoal and Node.
 * @param World: start of search
 * @param foundGoal: callback to check if goal is found
 * @param h: callback to estimate the remaining path cost
 */
export function search<T extends Heuristic>(start: Node<T>,
                                            goal: Node<T>): T[] {
  var frontier = PQ.new();
  var node = start;
  frontier.enqueue(node, fcost(node, goal));
  while(!frontier.isEmpty()) {
    var n = frontier.dequeue();
    if(n.match(goal)) {
      return path<T>(n);
    }
    var neighbours = n.next();
    for(var i=0; i<neighbours.length; i++) {
      var _neighbour = neighbours[i];
      frontier.enqueue(_neighbour, fcost(_neighbour, goal));
    }
  }
};

//////////////////////////////////////////////////////////////////////
// private functions

/*
 * Adds cost function and heuristic function and negates this value for
 * PriorityQueue to work properly
 */
function fcost<T extends Heuristic>(current: Node<T>, goal: Node<T>) : number {
  return -(current.cost + current.state.heuristic(goal.state));
}

/*
 * extracts the path from the Node back to start node
 */
function path<T extends Heuristic>(n: Node<T>) : T[] {
  var _path: T[] = [];
  var n: Node<T> = n;
  while(n != null) {
    _path.push(n.state)
    n = n.prev;
  }
  return _path.reverse();
}

