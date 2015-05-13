/// <reference path="collections.ts" />

interface Graph<T>{
    getneighbors(node: number):Array<number>;
    getcost(from: number,to:number):number;
    heuristic_cost_estimate(current : number, goal : number) : number;
    specialIndexOf(obj:T):number;
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

    private reconstruct_path(came_from : number[], goal:number):number[]{
        var result_path:number[] = [];
        result_path.push(goal);
        while(came_from[goal] > 0){
        	goal = came_from[goal];
        	result_path.push(goal);
        }
        
        return result_path;
    }

    private neighbor_nodes(current : number): number[]{
        var result : number[];
        result = this.mGraph.getneighbors(current);
        return result;
    }

    private cost(from:number, to:number): number{
        var result:number;
        result = this.mGraph.getcost(from,to);
        //if cost -1 then we throw error ?
        return result;
    }
    
    public star (start: number, goal : number): number[]{
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
            var current = openset.dequeue().getIndex();
            openset_ids.remove(current);
            counter ++;
            if(current == goal){
                console.info("Number of nodes visited " + counter);
                return this.reconstruct_path(came_from, goal);
            }
            closedset.push(current);
            var currentNeighbors = this.neighbor_nodes(current);
            
            for(var i = 0; i < currentNeighbors.length; i++){
                var neighbor = currentNeighbors[i];
                if(closedset.indexOf(neighbor) == -1){
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
        }
        //no path found!
        console.error("Astar: no path found!");
        return []; 
    }

     private reachedGoal(cond: Literal[], state : WorldState):boolean{
        for(var i = 0; cond.lenght; i++ ){
            if(!checkGoal(cond[i], state))
                return false;
        }
        return true;
    }

    private checkGoal(cond: Literal, state : Worldstate):boolean {
        var a = state.objects[cond.args[0]];
        var b = state.objects[cond.args[1]];
        var pddls = state.pddl.toArray();

        if(cond.rel == "above"){
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(x == a){
                    var y = pddl.args[1];
                    if(y == b)
                        return true;
                    else if(state.objects[y].form == "floor") //hopefully this is the correct syntax
                        return false;
                    else{
                       a=x;
                       index =-1;
                    }
                }
            }
        }
        else if(cond.rel == "ontop" || cond.rel == "inside"){
            for(var index = 0; index < pddls.length; index++){
                 var pddl = pddls[index];
                 if(pddl.args[0] == a){
                    if(pddl.args[1] == b)
                        return true;
                    return false;
                 }
            }
        }
        else if(cond.rel == "under"){
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(x == b){
                    var y = pddl.args[1];
                    if(y == a)
                        return true;
                    else if(state.objects[y].form == "floor") 
                        return false;
                    else{
                       b=x;
                       index =-1;
                    }
                }
            }
            
        }
        else if(cond.rel == "beside"|| cond.rel == "rightof"|| cond.rel == "leftof"){
            if(cond.rel == "beside"|| cond.rel == "rightof"){
                //find floor (a is rightof b, so floor to left of floor and search upwards)
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(x == a){
                        if(state.objects[pddl.args[1]].form == "floor")
                            var floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "rightof" && x == floor){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexLeft = 0; indexLeft < pddls.length; indexLeft++){
                    var pddl = pddls[indexLeft];
                    var x = pddl.args[1];
                    if(x == floor2){
                        if(pddl.args[0]== b)
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexLeft = -1;
                        }
                    }

                }

            }
            if(cond.rel == "beside"|| cond.rel == "leftof"){
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(x == a){
                        if(state.objects[pddl.args[1]].form == "floor")
                            var floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "leftof" && x == floor){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexRight = 0; indexRight < pddls.length; indexRight++){
                    var pddl = pddls[indexRight];
                    var x = pddl.args[1];
                    if(x == floor2){
                        if(pddl.args[0]== b)
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexRight = -1;
                        }
                    }

                }
            }
            return false;
            
        }
        return true;
    }
}
