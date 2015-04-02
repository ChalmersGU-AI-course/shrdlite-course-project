/// <reference path="collections.ts" />
/// <reference path="graph.ts" />
module AStar {

	export function AStarSearch<T>(graph: graph.Graph<T>, start: T, goal: T, h: (_h:T) => number) {
	
		var cameFrom = new collections.Dictionary<T, T>();
		var costSoFar = new collections.Dictionary<T, number>();

		var frontier = new collections.PriorityQueue<T>(function(a,b) {
			if( (costSoFar.getValue(a)+h(a)) < ( costSoFar.getValue(b)+h(b)) ){
				return -1;
			}
			if( (costSoFar.getValue(a)+h(a) ) > ( costSoFar.getValue(b)+h(b)) ) {
				return 1;
			}
			return 0;
		});
		cameFrom.setValue(start,start);
		costSoFar.setValue(start, 0);
		frontier.enqueue(start);
		while(!frontier.isEmpty()) {
			var cur = frontier.dequeue();
			if(cur === goal) {
				console.log("Done!\n");
				return cameFrom;
			}
			graph.nodeMap.getValue(cur).neighbors.forEach(function(k,v) {
				var newCost = costSoFar.getValue(k) + graph.cost(cur, k);
				if(!costSoFar.containsKey(k) || newCost < costSoFar.getValue(k)) {
					costSoFar.setValue(k, newCost);
					frontier.enqueue(k);
					cameFrom.setValue(k, cur);					
				}
			});
		}
	}
}
