/// <reference path="collections.ts" />
module AStar {

	// start: startNode
	// checkGoal: function checking if found the goal
	// h: heuristic-function
	// cost: function calculating the cost from a to b
	// adj: function for finding adjacent nodes.
	export function AStarSearch<T>(start: T, checkGoal: (_n:T) => boolean, h: (_h:T) => number,
				       cost: (a:T,b:T) => number, adj: (n:T) => T[]) {
	
		var cameFrom = new collections.Dictionary<T, T>();
		var costSoFar = new collections.Dictionary<T, number>();

		var frontier = new collections.PriorityQueue<T>(function(a,b) {
			return ((costSoFar.getValue(a)+h(a)) - (costSoFar.getValue(b)+h(b)));
		});
		cameFrom.setValue(start,start);
		costSoFar.setValue(start, 0);
		frontier.enqueue(start);

		while(!frontier.isEmpty()) {
			var cur : T = frontier.dequeue();
			console.log(cur);
			if(checkGoal(cur)) {
				console.log(cameFrom);
				var finalPath = recons_path<T>(cameFrom, cur);
				return finalPath;
			}
			var adjacentNodes : T[] = adj(cur);
			adjacentNodes.forEach((node : T) => {
				var newCost : number = costSoFar.getValue(cur) + cost(cur, node);
				if(!costSoFar.containsKey(node) || newCost < costSoFar.getValue(node)) {
					costSoFar.setValue(node, newCost);
					frontier.enqueue(node);
					cameFrom.setValue(node, cur);
				}
			});
		}
		return null;
	}

	function recons_path<T>(came_from, current) {
		var total_path : T[] = [];
		var temp_came_from = came_from;
		total_path.push(current);
		while( temp_came_from.containsKey(current) ) {
			var next = temp_came_from.getValue(current);
			current = next;
			total_path.push(current);
		}
		return total_path;
	}

}
