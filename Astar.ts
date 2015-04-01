interface Graph<T>{
    getneighbors(node: number):Array<number>;
    getcost(from: number,to:number):number;
    heuristic_cost_estimate(current : number, goal : number) : number;
    specialIndexOf(obj:T):number;
}

class Astar <T>{
    mGraph : Graph<T>;

    constructor(g : Graph<T>){
        this.mGraph = g;
    }

    private getMinFScore(fscore : number[], openset : number[]){
        var result : number;
        result=fscore[0];
        var index : number = 0;
        var indexout : number = 0;
        openset.forEach(os => {
            var fs = fscore[os];
            if(fs < result){
                result = fs;
                indexout = index;
            }
            index++;
        });
        return indexout;    
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
        var closedset : number [] = [];   // The set of nodes already evaluated.
        var openset : number [] = [];
        openset[0] = start;       // The set of tentative nodes to be evaluated, initially containing the start node
        var came_from : number [] = [];    // The map of navigated nodes.
        
        var g_score : number [] = [];
        var f_score : number [] = [];
        g_score[start] = 0;
        
        f_score[start] = g_score[start] + this.mGraph.heuristic_cost_estimate(start, goal);
        var counter = 0;
        while (openset.length > 0){
            var current = openset[this.getMinFScore(f_score, openset)];
            counter ++;
            if(current == goal){
                console.info("Counter " + counter);
                return this.reconstruct_path(came_from, goal);
            }
            var index = openset.indexOf(current);
            if(index != undefined ){
                openset.splice(index, 1);   
            }
            closedset.push(current);
            var currentNeighbors = this.neighbor_nodes(current);
            for(var i = 0; i < currentNeighbors.length; i++){
                var neighbor = currentNeighbors[i];
                if(closedset.indexOf(neighbor) == -1){
                    var tentative_g_score : number = g_score[current] + this.cost(current,neighbor); // distance between c and n
                    if(openset.indexOf(neighbor) == -1 || tentative_g_score < g_score[neighbor]){
                        came_from[neighbor] = current;

                        g_score[neighbor] = tentative_g_score;
                        f_score[neighbor] = g_score[neighbor] + this.mGraph.heuristic_cost_estimate(neighbor, goal);
                        if(openset.indexOf(neighbor) == -1){
                            openset.push(neighbor);
                        }
                    }
                }
            }
        }
        //no path found!
        console.error("Astar: no path found!");
        return []; 
    }
}
