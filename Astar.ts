///<reference path="typescript-collections/Collections.ts"/>

//This module implements the A* search algorithm generically for
//all possible types of nodes in graphs.
module Astar
{
  //This class holds the result of the search,
  //a path of nodes containing the path from
  //the start state to some goal state.
  //It additionally describes how many nodes
  //were visited to reach the goal.
  //T is the node type of the searched graph
	export class SearchResult<T>
	{
    //Did we reach our goal?
		success:boolean;
    //Number of nodes visited before reaching the goal
		nodesVisited:number;
    //Path from the start to the goal
		nodes: T[];

		constructor(n? :T[], nvis?:number) 
		{
			this.nodes = n;
			this.nodesVisited = nvis;
			if(n) this.success = true;
			else	this.success = false;
		}
	}
	
	
	//Finds the shortest path between start and end if such a path exists.
	//@param start	- The starting point
	//@param end		- The target destination
	//@param gen		- function used to generate all adjacent nodes of a node.
	//@param heuristic - a guess for how close a node is to the end node.
	//@param maxIterations - the maximal number of nodes the algorithm visits.
	export function findPath<T>(start : T, 
								gen : (t : T) => T[],
								heuristic : (t : T) => number,
								goal : (t : T) => boolean,
								strFun : (t : T) => string,
								maxIterations : number)	 : SearchResult<T>
	{
		//Degenerate case:
		//Has the goal already been satisfied?
		if(goal(start)) 
			return new SearchResult<T>([start, start], 0);

		//Maps from nodes to node IDs
		var known	 = new collections.Dictionary<T, number>(strFun);
		//Contains the distances of our nodes according to our heuristic
		var dist:number[]		= [];
		//Contains the predecessors of all nodes
		var prev:number[]		= [];
		//Map from node IDs to nodes
		var nodes:T[]		= [];
		//Number of known nodes
		var count:number		= 0;

		//Function which compares the distance from the start state
		//to two nodes.
		//Returns -1 if the	 first node was more distant than the second.
		//Returns	 1 if the second node was more distant than the first.
		//Returns	 0 if the nodes were equidistant.
		var comparer = (a : T, b : T) => 
		{
			var idx0	= known.getValue(a);
			var idx1	= known.getValue(b);

			var val0	= dist[idx0];
			var val1	= dist[idx1];

			if(val0 > val1)
				return -1;
			else if(val0 < val1)
				return 1;
			else 
				return 0;
		}

		//A priority queue which compares nodes using the above function.
		//Ensures we are always operating on the best possible node
		//in the frontier.
		var pQueue = new collections.PriorityQueue<T>(comparer);
		dist.push(heuristic(start));
		//Our start node doesn't have a predecessor.
		prev.push(-1);
		nodes.push(start);
		known.setValue(start, count++);
		//Generate all possible states we can move to
		//from the start state
		var adj = gen(start);

		//We insert every node adjacent to the start state in our
		//frontier priority queue. As we'll do later, we also have to:
		for(var i = 0; i < adj.length; i++)
		{
			//	1. Insert the heuristic distance to the adjacent node.
			//		 This will of course be whatever the heuristic outputs
			//		 plus one for the step from the start state.
			dist.push(1 + heuristic(adj[i]));
			//	2. Insert the predecessor of the adjacent node.
			//		 This will of course be the starting node
			prev.push(0);
			//	3. Insert the adjacent node into the nodes array.
			nodes.push(adj[i]);
			//	4. Insert the adjacent into the map from nodes to node IDs,
			//		 allowing us to get access the ID from the node later.
			known.setValue(adj[i], count++);
			//	5. Insert the adjacent into the priority queue frontier.
			pQueue.enqueue(adj[i]);
		}

		//If the priority queue is empty, there were no adjacent nodes
		//to the starting state. Therefore it's impossible to reach our goal.
		if(pQueue.isEmpty())
			return new SearchResult<T>();

		//Number of iterations of generating a new frontier
		//This is one since we have already generated our first frontier
		var iterations: number = 1;

		//Pop the best (according to the heuristic) node from the frontier
		var node : T = pQueue.dequeue();
		//While we have not yet reached our goal
		while(!goal(node))
		{
			//Get the current node is the predecessor of the new frontier nodes
			var previous = known.getValue(node);
			//Generate the adjacent nodes of the current node
			var adjacent = gen(node);
			for(var i = 0; i < adjacent.length; i++)
			{
				var n = adjacent[i];
				//The distance to the new frontier is the distance to the previous node,
				//plus the one step we took to the new frontier node,
				//plus what our heuristic thinks of the new node,
				//minus what our heuristic thinks of the predecessor node
				//(since the previous distance includes the previous heuristic)
				var distance = dist[previous] + 1 + heuristic(n) - heuristic(node);
				//If we haven't already considered this node, we need to enter it
				//into all the proper collections (as in the first iteration) 
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
          //If we have already visited this node, we need to check whether
          //we have found a better path to it. If so, we need to save this
          //new path
					var current = known.getValue(n);
					if(dist[current] > distance)
					{
						dist[current] = distance;
						prev[current] = previous;
					}
				}
			}

      //If the frontier is empty, we have already visited all the nodes,
      //and therefore need to stop our search
			if(pQueue.isEmpty())
				break;

      //Prepare for the next iteration
			node = pQueue.dequeue();
			iterations++;
			
      //This clause is needed to exit a computation which is too expensive
			if(iterations > maxIterations)
				break;
		}

    //Did we reach our goal?
		if(goal(node))
		{
      //Get the goal node ID
			var current = known.getValue(node);

      //Path from the goal to the start state
			var path:T[] = [];

      //Build the correct search path by walking backwards
      //from the goal state
			while(current != -1)
			{
				path.push(nodes[current]);
				current = prev[current];
			}

      //Reverse the goal->start path to get the start-> goal path
			return new SearchResult<T>(path.reverse(), iterations);
		}
		else 
		{
      //The search failed, return empty result
			return new SearchResult<T>();
		}
	}
}
