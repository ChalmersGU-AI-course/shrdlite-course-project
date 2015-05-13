/// <reference path="../typescript-collections/collections.ts" />

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

interface GraphNode {
	getId() : number;
	equals(otherNode : GraphNode) : boolean;
	distanceTo(to : GraphNode) : number;	
	toString() : string;
	getNeighbors() : GraphNode[];
}


class EucliNode implements GraphNode {
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

	distanceTo(to : EucliNode) : number {
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

	equals(otherNode : EucliNode) : boolean {
		return this.getId() == otherNode.getId();
	}

	toString() : string {
		return "("+this.xPos+","+this.yPos+")";
	}

}

class Edge<T extends GraphNode> {
	private cost : number;
	private fromNode : T;
	private endNode : T;

	constructor(cost : number, fromNode : T, toNode : T) {
		this.cost = cost;
		this.fromNode = fromNode;
		this.endNode = toNode;
	}

	getFromNode() : T {
		return this.fromNode;
	}

	getEndNode() : T {
		return this.endNode;
	}

	getCost() : number {
		return this.cost;
	}

	edgeToString() : string {
		var from = this.fromNode.toString();
		var to = this.endNode.toString();
		//var fromNodeX = this.fromNode.getX();
		//var fromNodeY = this.fromNode.getY();
		//var endNodeX  = this.endNode.getX();
		//var endNodeY  = this.endNode.getY();
		return from + " " + to; 
//		if(fromNodeX < endNodeX) {
//			return fromNodeX + fromNodeY + " " + endNodeX + endNodeY;
//		} else {
//			return endNodeX + endNodeY + " " + fromNodeX + fromNodeY;
//		}
	}
}
