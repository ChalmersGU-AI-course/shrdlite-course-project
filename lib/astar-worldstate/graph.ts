/// <reference path="../typescript-collections/collections.ts" />
/// <reference path="../astar-worldstate/edge.ts" />
/// <reference path="../astar-worldstate/graphnode.ts" />

class Graph<T extends GraphNode> {
	private edges = new collections.Set<Edge<T>>(e => e.edgeToString());
	private nodes = new collections.Set<T>(n => n.getId().toString()/*n.getId().toString()*/);


	addEdge(newEdge : Edge<T>) {
		if (this.nodes.contains(newEdge.getFromNode()) && this.nodes.contains(newEdge.getEndNode())) {
			this.edges.add(newEdge);
		} else {
			throw "can't place an edge between nonexistent nodes :(";
		}
	}

	addNode(newNode : T) {
		this.nodes.add(newNode);
	}

	getNodes() : T[] {
		return this.nodes.toArray();
	}

	contains(node : T) : boolean {
		return this.nodes.contains(node); 
	}

	getNumberOfNodes() : number {
		return this.nodes.size();
	}

	getNumberOfEdges() : number {
		return this.edges.size();
	}

	getRandomNode() : T {
		var randomIndex = Math.floor((Math.random() * this.getNumberOfNodes()));
		return this.nodes.toArray()[randomIndex];
	}
 
	getEdgesTo(node : T) : Edge<T>[] {
		var close = new collections.Set<Edge<T>>(e => e.edgeToString());
		var arr = this.edges.toArray();
		for (var i = 0; i < arr.length; i++) {
			if(arr[i].getFromNode().equals(node)) {
				close.add(arr[i]);
			} else if(arr[i].getEndNode().equals(node)) {
				close.add(arr[i]);
			}
		}
		return close.toArray();
	}
}