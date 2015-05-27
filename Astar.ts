/// <reference path="collections.ts" />
/// <reference path="Interpreter.ts"/>

interface Graph<T>{
    getneighbors(node: number):Array<number>;
    getcost(from: number,to:number):number;
    heuristic_cost_estimate(current : number, goal : Interpreter.Literal[] ) : number;
    specialIndexOf(obj:T):number;
    reachedGoal(current:number, conditions:Interpreter.Literal[]):boolean;
    checkGoal(current:number, condition:Interpreter.Literal):boolean;
}

class NodeScore {
	private index:number;
	private fscore:number;
	
	constructor(i:number, fs:number){
		this.index = i;
		this.fscore = fs;
		
	}
	public getIndex():number{
		return this.index;
	}
	public getFscore(){
		return this.fscore;
	}
	public setFscore(fs:number){
		this.fscore = fs;
	}
	
}

class Astar <T>{
    mGraph : Graph<T>;

    constructor(g : Graph<T>){
        this.mGraph = g;
    }

    private reconstruct_path(came_from : number[], goal:number, print : boolean):number[]{
        var result_path:number[] = [];
        result_path.push(goal);
        while(came_from[goal] > 0){
        	goal = came_from[goal];
        	result_path.push(goal);
        }
        if(print){
        	console.log("path length(Astar): "+result_path.length);
        }
        
        return result_path;
    }

    private neighbor_nodes(current : number): number[]{
        var result : number[];
        console.log("getting neighbors");
        result = this.mGraph.getneighbors(current);
        return result;
    }

    private cost(from:number, to:number): number{
        var result:number;
        result = this.mGraph.getcost(from,to);
        //if cost -1 then we throw error ?
        return result;
    }
    
    public star (start: number, goal : Interpreter.Literal[], bestsofar : number): number[]{
        // The set of tentative nodes to be evaluated, initially containing the start node
        var openset = new collections.PriorityQueue<NodeScore>(
        					function (a:NodeScore,b:NodeScore){
        						return b.getFscore() - a.getFscore();
        					});
       	var openset_ids = new collections.Set<number>(); 
        var closedset : number [] = [];   // The set of nodes already evaluated.      
        var came_from : number [] = [];    // The map of navigated nodes.
        var g_score : number [] = [];
        var f_score : number [] = [];
        g_score[start] = 0;
        f_score[start] = g_score[start] + this.mGraph.heuristic_cost_estimate(start, goal);
        openset.add(new NodeScore(start,f_score[start]));
        openset_ids.add(start);
        var counter = 0;
        
        while (!openset.isEmpty()){
        	var path = this.reconstruct_path(came_from, current, false);
        	if(bestsofar < path.length){
        		console.log("Worse Path: Number of nodes visited " + counter);
        		return path;	// no point in exporing a path which is worse than the one we have already got
        	}
        	if(closedset.length > 5000){
        		console.log("Too long search: Number of nodes visited " + counter);
        		return [];	// the search is too long
        	}
            var current = openset.dequeue().getIndex();
            openset_ids.remove(current);
            counter ++;
            if(this.mGraph.reachedGoal(current, goal)){
                console.log("Number of nodes visited " + counter);
                return this.reconstruct_path(came_from, current, true);//changed to current, since goal will be literals
            } //needs to be adjusted

            closedset.push(current);
            var currentNeighbors = this.neighbor_nodes(current);
            for(var i = 0; i < currentNeighbors.length; i++){
                var neighbor = currentNeighbors[i];
                var tentative_g_score : number = g_score[current] + this.cost(current,neighbor); // distance between c and n
                var neighborNode = new NodeScore(neighbor, f_score[neighbor]);
                var containsNode = !(openset.contains(neighborNode));
                
            	if(containsNode ||tentative_g_score < g_score[neighbor]){
                    came_from[neighbor] = current;
                    g_score[neighbor] = tentative_g_score;
                    f_score[neighbor] = g_score[neighbor] + this.mGraph.heuristic_cost_estimate(neighbor, goal);
                    neighborNode.setFscore(f_score[neighbor]);
                    if(containsNode){
                    	openset.add(neighborNode);
                    }
                }
            }
        }
        //no path found!
        console.error("Astar: no path found!");
        return []; 
    }

}
