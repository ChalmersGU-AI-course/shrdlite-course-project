/// <reference path="/lib/typescript-collections/collections.ts" />

class Graph {
	private var edges = new collections.Set<Edge>();
	private var nodes = new collections.Set<Node>();

	constructor(argument) {
		// code...
	}

	addEdge(newEdge : Edge) {
		edges.add(newEdge);
	}

	addNode(newNode : Node) {
		nodes.add(newNode);
	}
}

class Node {
	private id : int;
	private xPos : int;
	private yPos : int;

	constructor(id : int, xPos : int, yPos : int) {
		this.id = id;
		this.xPos = xPos;
		this.yPos = yPos;
	}

	distanceTo(to : Node) : double {
		return Math.sqrt(Math.pow(this.xPos-to.xPos, 2)+Math.pow(this.yPos-to.yPos, 2));
	}
}

class Edge {
	private cost : int;
	private fromNode : int;
	private endNode : int;

	constructor(cost : int, fromNode : Node, toNode : Node) {
		this.cost = cost;
		this.fromNode = fromNode;
		this.endNode = endNode;
	}

	compareTo(otherEdge : Edge) : int {
		return this.cost-otherEdge.cost;
	}
}