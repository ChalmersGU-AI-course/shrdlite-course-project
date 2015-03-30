module Astar{
    export interface Graph<T>{
        /*_nodeValues : Array<T>;
        _nodeneighbors : Array<Array<number>>;   //neighboring nodes to index node 
        _edges : Array<Array<number>>;        //from index node a to index node b
        */
        getneighbors(node: number):Array<number>;
        
        getcost(from: number,to:number):number;
        
        heuristic_cost_estimate(current : number, goal : number) : number;
        
    }
    
    export class AstarSearch <T>{
        mGraph : Graph<T>;
    
        constructor(g : Graph<T>){
            this.mGraph = g;
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
            result_path.push(goal);
            
            while(came_from[goal] > 0){
            	goal = came_from[goal];
            	result_path.push[goal];
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
            var closedset : number [];   // The set of nodes already evaluated.
            var openset : number [];
            openset[0] = start;       // The set of tentative nodes to be evaluated, initially containing the start node
            var came_from : number [];    // The map of navigated nodes.
            
            var g_score : number [];
            var f_score : number [];
            g_score[start] = 0;
            
            f_score[start] = g_score[start] + this.mGraph.heuristic_cost_estimate(start, goal);
            
            while (openset.length){
                var current = this.getMinFScore(openset);
                if(current === goal){
                    return this.reconstruct_path(came_from, goal);
                }
                var index = openset.indexOf(current);
                if(index != undefined){
                    openset.splice(index, 1);   
                }
                closedset.push(current);
                var currentNeighbors = this.neighbor_nodes(current);
                var i : number = 0;
                while(i < currentNeighbors.length){
                    var neighbor = currentNeighbors[i];
                    if(closedset.indexOf(neighbor) < 0){
                        var tentative_g_score : number = g_score[current] + this.cost(current,neighbor); // distance between c and n
                        if(openset.indexOf(neighbor) === -1 || tentative_g_score < g_score[neighbor]){
                            came_from[neighbor] = current;
                            g_score[neighbor] = tentative_g_score;
                            f_score[neighbor] = g_score[neighbor] + this.mGraph.heuristic_cost_estimate(neighbor, goal);
                            if(openset.indexOf(neighbor) == -1){
                                openset.push(neighbor);
                            }
                        }
                    
                    }
                    
                    i++;
                }
                
            }
                
            return this.reconstruct_path(came_from, goal); 
        }
    }
}
