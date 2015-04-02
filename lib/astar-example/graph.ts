/// <reference path="../typescript-collections/collections.ts" />

class Graph {
	private edges = new collections.Set<Edge>(e => e.edgeToString());
	private nodes = new collections.Set<GraphNode>(n => n.getId().toString());

	addEdge(newEdge : Edge) {
		if (this.nodes.contains(newEdge.getFromNode()) && this.nodes.contains(newEdge.getEndNode())) {
			this.edges.add(newEdge);
		} else {
			throw "can't place an edge between nonexistent nodes :(";
			
		}
	}

	addNode(newNode : GraphNode) {
		this.nodes.add(newNode);
	}

	getNode(id : number) : GraphNode {
		return this.nodes.toArray()[i];
	}

	contains(node : GraphNode) : boolean {
		return this.nodes.contains(node); 
	}

	getNumberOfNodes() : number {
		return this.nodes.size();
	}

	getNumberOfEdges() : number {
		return this.edges.size();
	}

	getRandomNode() : GraphNode {
		var randomIndex = Math.floor((Math.random() * this.getNumberOfNodes()));
		return this.nodes.toArray()[randomIndex];
	}

	getEdgesTo(node : GraphNode) : Edge[] {
		var close = new collections.Set<Edge>(e => e.edgeToString());
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

	getNeighborsTo(node : GraphNode) : GraphNode[] {
		var neighbors = new collections.Set<GraphNode>(g => g.getId().toString());
		var edgeArr = this.edges.toArray();
		var e;

		for (var i = 0; i < edgeArr.length; i++) {
			e = edgeArr[i];

			if(e.getFromNode().equals(node)) {
				neighbors.add(e.getEndNode());
			} else if(e.getEndNode().equals(node)) {
				neighbors.add(e.getFromNode());
			}

		}

		return neighbors.toArray();
	}

	getEdgeBetween(start : GraphNode, end : GraphNode) : Edge {
		var edgeArr = this.edges.toArray();
		var e;
		for (var i = 0; i < edgeArr.length; i++) {
			e = edgeArr[i];

			if(e.getFromNode().equals(start) && e.getEndNode().equals(end)) {
				return e;
			}
		}
	}

	getCostForEdge(firstNode : GraphNode, secondNode : GraphNode) : number {
		var edgeArr = this.edges.toArray();

		for (var i = 0; i < edgeArr.length; i++) {
			var e = edgeArr[i];

			if(e.getFromNode().equals(firstNode) && e.getEndNode().equals(secondNode)
			|| e.getFromNode().equals(secondNode) && e.getEndNode().equals(firstNode)) {
				return e.getCost();
			}
		}

		return -1;
	}
}

class GraphNode {
	private id : number;
	private xPos : number;
	private yPos : number;
	private name : string;

	constructor(id : number, xPos : number, yPos : number, name : string) {
		this.id = id;
		this.xPos = xPos;
		this.yPos = yPos;
		this.name = name;
	}

	distanceTo(to : GraphNode) : number {
		return Math.sqrt(Math.pow(this.xPos-to.xPos, 2)+Math.pow(this.yPos-to.yPos, 2));
	}

	getId() : number {
		return this.id;
	}

	getX() : number {
		return this.xPos;
	}

	getY() : number {
		return this.yPos;
	}

	getName() : string {
		return this.name;
	}

	equals(otherNode : GraphNode) : boolean {
		return this.getId() == otherNode.getId();
	}
}

class Edge {
	private cost : number;
	private fromNode : GraphNode;
	private endNode : GraphNode;

	constructor(cost : number, fromNode : GraphNode, toNode : GraphNode) {
		this.cost = cost;
		this.fromNode = fromNode;
		this.endNode = toNode;
	}

	compareTo(otherEdge : Edge) : number {
		return this.cost-otherEdge.cost;
	}

	getFromNode() : GraphNode {
		return this.fromNode;
	}

	getEndNode() : GraphNode {
		return this.endNode;
	}

	getCost() : number {
		return this.cost;
	}

	edgeToString() : string {
		var fromNodeX = this.fromNode.getX();
		var fromNodeY = this.fromNode.getY();
		var endNodeX  = this.endNode.getX();
		var endNodeY  = this.endNode.getY();

		if(fromNodeX < endNodeX) {
			return fromNodeX + fromNodeY + " " + endNodeX + endNodeY;
		} else {
			return endNodeX + endNodeY + " " + fromNodeX + fromNodeY;
		}
	}
}
