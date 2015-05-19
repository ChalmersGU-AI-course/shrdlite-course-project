/// <reference path="collections.ts" />
module AStar {

	// start: startNode
	// checkGoal: function checking if found the goal
	// h: heuristic-function
	// cost: function calculating the cost from a to b
	// adj: function for finding adjacent nodes.
	export function AStarSearch<T>(start: T, checkGoal: (_n:T) => boolean, h: (_h:T) => number,
				       cost: (a:T,b:T) => number, adj: (n:T) => T[]) : T[] {

		var costSoFar = new collections.Dictionary<T, number>();
	
		var frontier = new collections.PriorityQueue<Node<T>>(function(a,b) {
			return ((costSoFar.getValue(a.node)+h(a.node)) - (costSoFar.getValue(b.node)+h(b.node)));
		});

		costSoFar.setValue(start, 0);
		frontier.enqueue(new Node<T>(start));

		while(!frontier.isEmpty()) {
			var cur : Node<T> = frontier.dequeue();
			if(checkGoal(cur.node)) {
				var finalPath = recons_path<T>(cur);
				return finalPath;
			}
			var adjacentNodes : T[] = adj(cur.node);
			adjacentNodes.forEach((node : T) => {
				var newCost : number = costSoFar.getValue(cur.node) + cost(cur.node, node);
				if(!costSoFar.containsKey(node) || newCost < costSoFar.getValue(node)) {
					costSoFar.setValue(node, newCost);
					var next : Node<T> = new Node<T>(node);
					next.setPrev(cur);
					frontier.enqueue(next);
				}
			});

		}
		return null;
	}

	class Node<T> {
		node : T;
		prev : Node<T>;

		constructor(node : T){
			this.node = node;
		}

		setPrev(prev : Node<T>) {
			this.prev = prev;
		}

		toString() {
			collections.makeString(this);
		}
	}

	function recons_path<T>(current : Node<T>) : T[] {
		var total_path : T[] = [];
		while( current.prev ) {
			total_path.push(current.node);
			var next = current.prev;
			current = next;
		}
		return total_path;
	}

}
