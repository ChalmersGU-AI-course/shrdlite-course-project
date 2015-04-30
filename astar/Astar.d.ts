/**
 * @namespace Top level namespace for astar
 */
declare module Astar {

  interface State {
    heuristic(solution: any): number;  // compare length to goal
    match(solution: any): boolean;     // see if goal is found
    expand(): Transition[];            // expand to next possible states
    hash(): number; // TODO: for now, with current implementation
    toString(): string;
  }

  /*
   * Represents a transition in a problem graph.
   */
  interface Transition {
    cost: number;
    state: State;
  }

  /*
   * Represents solution by a path, and a graph that was created during the
   * search for eventually further investigation.
   */
  interface Solution<T extends State> {
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
  function search<T extends State>(start: T, g: ASGraph<T>, goal: any): Solution<T>;

  function printGraph<T extends State>(graph: ASGraph<T>, maxDepth: number);

  function hash(s: string): number;

  //////////////////////////////////////////////////////////////////////
  // private classes and functions

  /*
   * A-Star Node: represents a node in the problem graph.
   */
  class ASNode<T extends State> {
    state: T;
    prev: number; // (id of node) just one node enables a walk back.
    next: number[];
    totalCost: number;
    constructor(state: T, cost: number, prev: ASNode<T>, next: [number]);
  }

  /*
   * Hash table is used internally in graph, TODO: for now
   */
  interface HashTable<T extends State> {
    [key: number]: ASNode<T>;
  }

  /*
   * A-Star graph: represents problem graph.
   * TODO: another implementation could maybe be faster? Right now the search is
   * quite slow, which is likeluy due to the ASGraph implementation
   */
  class ASGraph<T extends State> {
    start: ASNode<T>;
    table: HashTable<T>;             // ASGraph stores nodes in Hashtable to save space
    set(node: ASNode<T>): boolean;
    get(k: number): ASNode<T>;
    constructor(node: ASNode<T>);
  }

  /*
   * Used for determining what node to expore next in the astar search function.
   */
  function comparator<T extends State>(goal: any);

  /*
   * extracts the path from the ANode back to start node
   */
  function path<T extends State>(n: ASNode<T>, graph: ASGraph<T>): T[];

}
