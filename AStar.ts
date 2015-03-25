/// <reference path="Datastructures/PriorityQueue.ts"/>
module AStar {
    import PriorityQueue = require('PriorityQueue');
    
    interface IGraph 
    {
    
    }
    
    interface INode 
    {
	id : number;
    weight : number;
    parent : number;
    children: [number]
    }
    
    export function asdasdJarnaMain ()
    {
        var queue = new PriorityQueue();
		var came_from: { [current: number]: INode; } = {};
		
    }
	
	
	function reconstruct_path (came_from, current)
    {
		var total_path : number[] = [];
		while(current in came_from)
		{
			current = came_from;
			total_path.push(current);
		}
		return total_path;
    }
}



