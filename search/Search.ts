///<reference path="./Graph.ts" />

import G=Graph.Graph
import N=Graph.Node

module Search {
  export interface Search<Id, Cost, Path> {
    (graph: G<Id, Cost>, start: N<Id>, end: N<Id>): Path
  }
}
