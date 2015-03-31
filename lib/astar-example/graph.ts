/// <reference path="../typescript-collections/collections.ts" />

class Graph {
	private edges = new collections.Set<Edge>();
	private nodes = new collections.Set<GraphNode>();

	constructor(argument) {
		// code...
	}

	addEdge(newEdge : Edge) {
		this.edges.add(newEdge);
	}

	addNode(newNode : GraphNode) {
		this.nodes.add(newNode);
	}
}

class GraphNode {
	private id : number;
	private xPos : number;
	private yPos : number;

	constructor(id : number, xPos : number, yPos : number) {
		this.id = id;
		this.xPos = xPos;
		this.yPos = yPos;
	}

	distanceTo(to : GraphNode) : number {
		return Math.sqrt(Math.pow(this.xPos-to.xPos, 2)+Math.pow(this.yPos-to.yPos, 2));
	}
}

class Edge {
	private cost : number;
	private fromNode : number;
	private endNode : number;

	constructor(cost : number, fromNode : number, toNode : number) {
		this.cost = cost;
		this.fromNode = fromNode;
		this.endNode = toNode;
	}

	compareTo(otherEdge : Edge) : number {
		return this.cost-otherEdge.cost;
	}
}