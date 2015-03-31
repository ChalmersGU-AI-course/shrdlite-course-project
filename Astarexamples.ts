///<reference path="Astar.ts"/>

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
var as = new Astar<number[]>(sp);
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

/*
class eightpuzzle implements  graph<number[][]>, neighbors<number[][]>{
    initstate : number[][];
    goalstate : number[][];
    
    constructor(){
        this.initstate = createState([2, 4, 0, 5, 7, 1 ,8 ,3, 6]);
        this.goalstate = createState([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        this.nodes = allstates();
    }
    
    //For 8 puzzle
    heuristic_cost_estimate(current : number, goal : number) : number{
        var manhattanDist:number = 0;
        /*for(var i=0;i<N;i++){
            manhattanDist = current
        }
        var N:number = Math.sqrt(current.length)
        for(var x=0;x<N;x++){
            for(var y=0;y<N;y++){
                var currentValue:number = current[y*N + x];

                if(currentValue){ //0 is the empty block
                    var target:number = goal.indexOf(currentValue);
                    
                    manhattanDist += Math.abs(x - target / N) + Math.abs(y - target % N) 
                }
            }
        }
        //TODO
        return manhattanDist;
    }
    
    findZero(instate: number[][]):number[]{
        var indexzero : number[] = [-1,-1];
        for(var i = 0; i < 4; i ++){
            if(instate[i].indexOf(0) >= 0){
                indexzero[0] = i;
                indexzero[1] = instate[i].indexOf(0);
                return indexzero;
            }
        }
        return indexzero;
    }
    
    getneighbors(instate: number[][]):Array<number [][]>{
        var result: Array<number[][]>;
        var indexzero = findZero(instate);
        
        
        var nindexzero = indexzero;
        if(indexzero[0]-1 >= 0){
            nindexzero[0] = indexzero[0]-1;
            result.push(transitionState(instate, indexzero, nindexzero));
        }
        if(indexzero[0]+1 < 3){
            nindexzero[0] = indexzero[0]+1;
            result.push(transitionState(instate, indexzero, nindexzero));
        }
        if(indexzero[1]-1 >= 0){
            nindexzero[1] = indexzero[1]-1;
            result.push(transitionState(instate, indexzero, nindexzero));    
        }
        if(indexzero[1]+1 < 3){
            nindexzero[1] = indexzero[1]+1;
            result.push(transitionState(instate, indexzero, nindexzero));    
        }
        return result;    
    }
    
    transitionState(instate: number[][], oldZ: number[],newZ: number[]): number[][]{
        instate[oldZ[0]][oldZ[1]] = instate[newZ[0]][newZ[1]];
        instate[newZ[0]][newZ[1]] = 0;
        return instate;
    }
    
    createState(input : number[]):number[]{
        var sum : number = 0;
        var nstate : number [][];
        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                this.nstate[i][j] = input[sum];
                sum ++;
                j++;
            }
        }    
        return nstate;
    }
}*/
