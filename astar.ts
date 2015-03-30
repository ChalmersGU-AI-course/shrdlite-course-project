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
	 * @param equals	- a function that can determine equality.
	 * @param heuristic - a guess for how close a node is to the end node.
	 */
	export function findPath<T>(start : T, end : T, 
								gen : (t : T) => T[],
								equals : (t0 : T, t1 : T) => boolean,
								tstring : (t : T) => string,
								heuristic : (t : T, e : T) => number)  : Path<T>
	{
		var known  = new collections.Dictionary<T, number>(tstring);

		var dist:number[]   = [];
		var prev:number[]  	= [];
		var nodes:T[]		= [];
		var count:number    = 0;

		var comparer = (a : T, b : T) => 
		{
			var idx0  = known.getValue(a);
			var idx1  = known.getValue(b);

			var val0  = dist[idx0];
			var val1  = dist[idx1];

			if(val0 > val1)
				return -1;
			else if(val0 < val1)
				return 1;
			else 
				return 0;
		}

		var pQueue = new collections.PriorityQueue<T>(comparer);
		
		dist.push(heuristic(start, end));
		prev.push(-1);
		nodes.push(start);
		known.setValue(start, count++);
		var firstNeighbours = gen(start);
		for(var i = 0; i < firstNeighbours.length; i++)
		{
			dist.push(1 + heuristic(firstNeighbours[i], end));
			prev.push(0);
			nodes.push(firstNeighbours[i]);
			known.setValue(firstNeighbours[i], count++);
			pQueue.enqueue(firstNeighbours[i]);
		}

		if(pQueue.isEmpty())
		{
			return null;
		}

		var node : T = pQueue.dequeue();
		while(!equals(node, end))
		{
			console.log(node);
			var previous = known.getValue(node);
			var adjacent = gen(node);
			for(var i = 0; i < adjacent.length; i++)
			{
				var n 		 = adjacent[i];
				var distance = dist[previous] + 1 + heuristic(n, end) - heuristic(node, end);
				if(!known.containsKey(n))
				{
					dist.push(distance);
					prev.push(previous);
					nodes.push(n);
					known.setValue(n, count++);
					pQueue.enqueue(n);
				}
				else 
				{

					var current = known.getValue(n);
					if(dist[current] > distance)
					{
						dist[current] = distance;
						prev[current] = previous;
					}
				}
			}

			if(pQueue.isEmpty())
				break;

			node = pQueue.dequeue();
		}

		if(known.containsKey(end))
		{
			var current = known.getValue(end);
			var path:T[] = [];
			while(current != -1)
			{
				path.push(nodes[current]);
				current = prev[current];
			}

			return new Path<T>(path.reverse());
		}
		else 
		{
			return null;			
		}
	}
}