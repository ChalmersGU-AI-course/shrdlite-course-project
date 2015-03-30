///<reference path="typescript-collections/Collections.ts"/>

module Astar
{
	export class Path<T>
	{
		nodes: T[];
		constructor(n :T[]) 
		{
			this.nodes = n;
		}
	}

	/**
	 * Finds the shortest path between start and end if such a path exists.
	 * @param start 	- The starting point
	 * @param end		- The target destination
	 * @param gen   	- function used to generate all adjacent nodes of a node.
	 * @param heuristic - ls
	 */
	export function findPath<T>(start : T, end : T, 
								gen : (t : T) => T[],
								heuristic : (t : T) => number)  : Path<T>
	{
		var known  = new collections.Dictionary<T, number>();
		var back   = new collections.Dictionary<number, T>();

		var dist:number[]   = [];
		var prev:number[]  	= [];
		var count:number    = 0;

		var comparer = (a : T, b : T) => 
		{
			var idx0  = known.getValue(a);
			var idx1  = known.getValue(b);

			var val0  = dist[idx0];
			var val1  = dist[idx1];

			if(val0 < val1)
				return -1;
			else if(val0 > val1)
				return 1;
			else 
				return 0;
		}


		var pQueue = new collections.PriorityQueue<T>(comparer);
		var node   = start;

		dist.push(0);
		prev.push(-1);
		known.setValue(node, count++);

		while(node != end && !pQueue.isEmpty())
		{
			var previous = known.getValue(node);
			var adjacent = gen(node);
			for(var n in adjacent)
			{
				var distance = dist[previous] + 1 + heuristic(n);
				if(!known.containsKey(n))
				{
					dist.push(distance);
					prev.push(previous);
					known.setValue(node, count);
					back.setValue(count++, node);
					pQueue.enqueue(n);
				}
				else 
				{
					var current = known.getValue(node);
					if(dist[current] > distance)
					{
						dist[current] = distance;
						prev[current] = previous;
					}
				}
			}

			node = pQueue.dequeue();
		}

		if(known.containsKey(end))
		{
			var current = known.getValue(end);
			var path:T[] = [];
			while(current != -1)
			{
				path.push(back.getValue(current));
				current = prev[current];
			}

			return new Path<T>(path);
		}
		else 
		{
			return null;			
		}
	}
}