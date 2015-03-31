    interface Graph<T>{
        getneighbors(node: number):Array<number>;
        
        getcost(from: number,to:number):number;
        
        heuristic_cost_estimate(current : number, goal : number) : number;
        
        specialIndexOf(obj:T):number;
        
    }
    
    class AstarSearch <T>{
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
            
            while (openset.length > 0){
                var current = openset[this.getMinFScore(openset)];

                if(current == goal){
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
                    if(closedset.indexOf(neighbor) < 0){
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
            console.log("came_from: " + came_from.toString());   

            return []; 
        }
    }

class Shortestpath implements Graph<number[]>{   // index 0 = x, index 1 = y
    _nodeValues : Array<number[]>;
    _nodeneighbors : Array<Array<number>>;   //neighboring nodes to index node 
    _edges : Array<Array<number>>;        //from index node a to index node b
    _width : number;
    _heigth : number;

    constructor(size:number, wall:boolean, hole:number){
        this._width = size;
        this._heigth = size;
        this._nodeValues = [];
        //this._nodeValues = [[1,1],[1,2],[2,3],[3,2],[4,2],[5,5]];
        var index = 0;
        for(var i = 0; i < this._width; i++){
            for(var j = 0; j < this._heigth; j++){
                this._nodeValues[index] = [i,j];  
                index ++;  
            }
        }
        if(wall){
            this.makewall(hole);    
        }
        
        
        this._nodeneighbors = [[1,2],[4],[3],[5],[]];
        this._edges         = [[2,3],[2],[3],[3],[]];
        
    }
    
    makewall(hole:number){
        //make a wall
        for(var i = 1; i < 9; i++){
            if(i != hole){
                this._nodeValues.splice(this.specialIndexOf([10-i,i]),1);
            }
        }
    }
    
    getneighbors(node: number):Array<number>{
        var cur = this._nodeValues[node];
        var neig :Array<number> = [];
        var found;
        if(cur[0]>0){
            found = this.specialIndexOf([cur[0]-1,cur[1]]);
            if(found >= 0){
                neig.push(found);  
            }
        }
        if(cur[0]<this._width){
            found = this.specialIndexOf([cur[0]+1,cur[1]]);
            if (found >= 0){
                neig.push(found);
            }
        }
        if(cur[1]>0){
            found = this.specialIndexOf([cur[0],cur[1]-1]);
            if (found >= 0){
                neig.push(found);
            }
        }
        if(cur[1]<this._heigth){
            found = this.specialIndexOf([cur[0],cur[1]+1]);
            if (found >= 0){
                neig.push(found);
            }
        }
        return neig;
    }
    
    getcost(from: number,to:number):number{
        return 1;
        var index = this._nodeneighbors[from].indexOf(to);
        if(index >= 0){
            return 1;
            //return this._edges[from][index];
        }
        return -1;
    }
    
    heuristic_cost_estimate(current : number, goal : number) : number{
        var cur = this._nodeValues[current];
        var gol = this._nodeValues[goal];
        //Manhathan distance
        return Math.abs(gol[0] - cur[0]) + Math.abs(gol[1] - cur[1]);
    }
    
    specialIndexOf(obj:number[]):number {    
        for (var i = 0; i < this._nodeValues.length; i++) {
            if (this._nodeValues[i][0] == obj[0] && this._nodeValues[i][1] == obj[1]) {
                return i;
            }
        }
        return -1;
    }
}


var sp = new Shortestpath(10, true, 0);// 10x10 map, true for wall and 5 for hole in wall 
var as = new AstarSearch<number[]>(sp);
var start = sp.specialIndexOf([2,2]);
var end = sp.specialIndexOf([6,6]);
console.log("Start: " +start +" End: " + end);
var res = as.star(start,end);
if(res.length == 0){
    console.log("no path found");
}else{
    var conv = [];
    for(var i = 0 ; i < res.length; i ++){
        conv[i]= sp._nodeValues[res[i]];
    }
    conv = conv.reverse();
    conv.forEach(c => {
        console.log("(" + c+")");   
    
        });
    console.log("Path length: " + conv.length);
    console.log("res: (" + conv.toString()+")");   
}
//}
