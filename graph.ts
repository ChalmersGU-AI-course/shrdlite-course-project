/// <reference path="collections.ts" />
module graph {
	export class Node<T> {
		node :T;
		neighbors :collections.Dictionary<T,number>;

		constructor(node :T) {
			this.node = node;
			this.neighbors = new collections.Dictionary<T,number>();
		}

		addNeighbor(neighbor :T, weight :number) :number {
			return this.neighbors.setValue(neighbor, weight);
		}
	}
	
	export class Graph<T> {

		nodeMap :collections.Dictionary<T,Node<T>>;
		
		constructor() {
			this.nodeMap = new collections.Dictionary<T,Node<T>>();
		}

		addNode(node :T) :Node<T> {
			var newNode = new Node<T>(node);
			return this.nodeMap.setValue(node, newNode);
		}

		addArc(a :T, b :T, weight :number) {
			if(!this.nodeMap.containsKey(a)) {
				this.addNode(a);
			}
			if(!this.nodeMap.containsKey(b)) {
				this.addNode(b);
			}
			this.nodeMap.getValue(a).addNeighbor(b, weight);
			this.nodeMap.getValue(b).addNeighbor(a, weight);
		}
		
		cost(a :T, b :T) :number {
			
			var cost :number;
			this.nodeMap.forEach(function(k,v) {
				if(k === a && v.neighbors.containsKey(b)) {
					cost = v.neighbors.getValue(b);
					return v.neighbors.getValue(b);
				}
			});
			return cost;
		}

	}
}
