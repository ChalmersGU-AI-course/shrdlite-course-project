module Astar {
    

    export function heuristic_cost_estimate(current : number, goal : number) : number{
        
        //TODO
        return 0;
    }

    export function getMinFScore(fscore : number[]){
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

    export function reconstruct_path(came_from : number[], goal:number):number[]{
        var result_path:number[];
        //TODO
        return result_path;
    }
    
    export function star (start: number, goal : number): number[]{
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
            current = getMinFScore(openset);
            if(current === goal)
                return reconstruct_path(came_from, goal);
            
            
        }
        
 
        remove current from openset
        add current to closedset
        for each neighbor in neighbor_nodes(current)
            if neighbor in closedset
                continue
            tentative_g_score := g_score[current] + dist_between(current,neighbor)
 
            if neighbor not in openset or tentative_g_score < g_score[neighbor] 
                came_from[neighbor] := current
                g_score[neighbor] := tentative_g_score
                f_score[neighbor] := g_score[neighbor] + heuristic_cost_estimate(neighbor, goal)
                if neighbor not in openset
                    add neighbor to openset
 
        return failure
        
        
        
        return result; 
    }
}
