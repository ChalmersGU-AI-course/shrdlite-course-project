class Astar {
    mgraph:number[][];
    constructor(graph:number[][]){
        mgraph = graph;
    }
    private heuristic_cost_estimate(current : number, goal : number) : number{
        
        //TODO
        return 0;
    }

    private getMinFScore(fscore : number[]){
        var result : number;
        result=fscore[0];
        var index : number = 0;
        var indexout : number = 0;
        fscore.forEach(fs => {
            if(fs < result){
                result = fs;
                indexout = index;
            }
            index ++;}
        );
        return indexout;    
    }

    private reconstruct_path(came_from : number[], goal:number):number[]{
        var result_path:number[];
        //TODO
        return result_path;
    }

    private neighbor_nodes(current : number): number[]{
        var result : number[];
        return result;
    }

    private cost(from:number, to:number): number{
        var result:number;
        
        return result;
    }
    
    public star (start: number, goal : number): number[]{
        var closedset : number [];   // The set of nodes already evaluated.
        var openset : number [];
        openset[0] = start;       // The set of tentative nodes to be evaluated, initially containing the start node
        var came_from : number [];    // The map of navigated nodes.
        var result : number [];
        
        var g_score : number [];
        var f_score : number [];
        g_score[start] = 0;
        
        f_score[start] = g_score[start] + heuristic_cost_estimate(start, goal);
        
        while (openset.length){
            var current = getMinFScore(openset);
            if(current === goal){
                return reconstruct_path(came_from, goal);
            }
            var index = openset.indexOf(current);
            if(index != undefined){
                openset.splice(index, 1);   
            }
            closedset.push(current);
            var currentNeighbors = neighbor_nodes(current);
            var i : number = 0;
            while(i < currentNeighbors.length){
                var neighbor = currentNeighbors[i];
                if(closedset.indexOf(neighbor) < 0){
                    var tentative_g_score : number = g_score[current] + cost(current,neighbor); // distance between c and n
                    if(openset.indexOf(neighbor) === -1 || tentative_g_score < g_score[neighbor]){
                        came_from[neighbor] = current;
                        g_score[neighbor] = tentative_g_score;
                        f_score[neighbor] = g_score[neighbor] + heuristic_cost_estimate(neighbor, goal);
                        if(openset.indexOf(neighbor) == -1){
                            openset.push(neighbor);
                        }
                    }
                
                }
                
                i++;
            }
            
        }
            
        return result; 
    }
}
