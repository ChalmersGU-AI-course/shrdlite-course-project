///<reference path="typescript-collections/Collections.ts"/>

module Astar
{
	export class Path<T>
	{
		nodes: T[];
		constructor(i : number) { }
	}

	export function findPath<T>(start : T, end : T, 
								gen : (t : T) => T[],
								heuristic : (t : T) => number)  : Path<T>
	{

		
		return new Path<T>(0);
	}
}