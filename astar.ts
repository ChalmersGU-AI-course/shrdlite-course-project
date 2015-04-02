/// <reference path="collections.ts" />
/// <reference path="graph.ts" />
module AStar {

	export function AStarSearch<T>(graph: graph.Graph<T>, start: T, goal: T, h: (_h:T) => number) {
	
		var cameFrom = new collections.Dictionary<T, T>();
		var costSoFar = new collections.Dictionary<T, number>();

		var frontier = new collections.PriorityQueue<T>(function(a,b) {
			return ((costSoFar.getValue(a)+h(a)) - (costSoFar.getValue(b)+h(b)));
		});
		cameFrom.setValue(start,start);
		costSoFar.setValue(start, 0);
		frontier.enqueue(start);

		var counter = 0;

		while(!frontier.isEmpty()) {
			var cur = frontier.dequeue();
			if(cur === goal) {
				var finalPath = recons_path<T>(cameFrom, goal);
				console.log("[INFO] Done in " + counter  + " iterations, final path: " + finalPath);
				return finalPath;
			}
			graph.nodeMap.getValue(cur).neighbors.forEach( (k,v) => {
				var newCost = costSoFar.getValue(k) + graph.cost(cur, k);
				if(!costSoFar.containsKey(k) || newCost < costSoFar.getValue(k)) {
					costSoFar.setValue(k, newCost);
					frontier.enqueue(k);
					cameFrom.setValue(k, cur);					
				}
			});
			console.log("[INFO] Iteration done, result: ");
			console.log("\tcurrent node: " + cur);
			console.log("\tnext node: " + frontier.peek());
			console.log("\tfrontier: ");
			frontier.forEach( (elem) => {
				console.log("\t\t"+elem);
			});
			counter++;
		}
		return null;
	}

	function recons_path<T>(came_from, current) {
		var total_path = new collections.LinkedList<T>();
		var temp_came_from = came_from;
		total_path.add(current);
		while( temp_came_from.containsKey(current) ) {
			var next = temp_came_from.remove(current);
			current = next;
			total_path.add(current);
		}
		return total_path;
	}

}
