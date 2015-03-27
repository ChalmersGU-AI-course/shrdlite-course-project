///<reference path="./Graph.ts" />

module Search {
  import G = Graph.Graph;
  import N = Graph.Node;

  export interface Search<Id, Cost, Path> {
    search(graph: G<Id, Cost>, start: N<Id>, end: N<Id>): Path
  }
}
