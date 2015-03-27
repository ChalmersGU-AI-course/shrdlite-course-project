
module Graph {
  // The interface of a node in a graph with an identifier of type Id
  export interface Node<Id> {
    node_id: Id;
  }

  // The interface of a graph, where the nodes have identifiers of type
  // Id and where the edge cost have type Cost
  export interface Graph<Id,Cost> {
    nodes: Node<Id>[];                      // The nodes in the graph
    (node: Node<Id>): Node<Id>[];           // Neighbours
    (start: Node<Id>, end: Node<Id>): Cost; // Edge cost
  }
}

