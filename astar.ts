///<reference path="typescript-collections/Collections.ts"/>

module Astar
{
	export class SearchResult<T>
	{
		success:boolean;
		nodesVisited:number;
		nodes: T[];

		constructor(n? :T[], nvis?:number) 
		{
			this.nodes = n;
			this.nodesVisited = nvis;
			if(n) this.success = true;
			else  this.success = false;
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
	export function findPath<T>(start : T, 
								gen : (t : T) => T[],
								heuristic : (t : T) => number,
                                equals : (t: T, t0 : T) => boolean,
								goal : (t : T) => boolean,
                                strFun : (t : T) => string)  : SearchResult<T>
	{
		//Simple case:
		if(goal(start)) 
		{
			return new SearchResult<T>([start, start], 0);
		}

		var known  = new collections.Dictionary<T, number>(strFun);
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
		
		dist.push(heuristic(start));
		prev.push(-1);
		nodes.push(start);
		known.setValue(start, count++);
		var adj = gen(start);
		for(var i = 0; i < adj.length; i++)
		{
			dist.push(1 + heuristic(adj[i]));
			prev.push(0);
			nodes.push(adj[i]);
			known.setValue(adj[i], count++);
			pQueue.enqueue(adj[i]);
		}

		if(pQueue.isEmpty())
		{
			return new SearchResult<T>();
		}

		var iterations: number    = 1;
		var node : T = pQueue.dequeue();
		while(!goal(node))
		{
			var previous = known.getValue(node);
			var adjacent = gen(node);
			for(var i = 0; i < adjacent.length; i++)
			{
				var n 		 = adjacent[i];
				var distance = dist[previous] + 1 + heuristic(n) - heuristic(node);
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
			iterations++;
		}

		if(goal(node))
		{
			var current = known.getValue(node);
			var path:T[] = [];
			while(current != -1)
			{
				path.push(nodes[current]);
				current = prev[current];
			}

			return new SearchResult<T>(path.reverse(), iterations);
		}
		else 
		{
			return new SearchResult<T>();
		}
	}
}