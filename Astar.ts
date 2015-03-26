module Astar {
    

    export function heuristic_cost_estimate(current : number, goal : number) : number{
        
        //TODO
        return 0;
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
        return result; 
    }
}
