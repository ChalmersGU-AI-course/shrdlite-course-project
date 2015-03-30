///<reference path="Astar.ts"/>

var sp = new Shortestpath();
var as = new AstarSearch<number[]>(sp);

for(var i = 0 ; i < 4; i ++){
    console.log("hello");   
}


class Shortestpath implements graph<number[]>{   // index 0 = x, index 1 = y

    constructor(){
        this._nodeValues = [[1,1],[1,2],[2,3],[3,2],[4,2],[5,5]];
        this._nodeneighbors = [[1,2],[4],[3],[5],[]];
        this._edges         = [[2,3],[2],[3],[3],[]];
        
    }
    getneighbors(node: number):Array<number>{
        return this._nodeneighbors.get(node);
    }
    
    getcost(from: number,to:number):number{
        var index = this._nodeneighbors.get(from).indexof(to);
        if(index >= 0){
            return this._edges.get(index);
        }
        return -1;
    }
    
    heuristic_cost_estimate(current : number, goal : number) : number{
        var cur = this._nodeValues.get(current);
        var gol = this._nodeValues.get(goal);
        //Manhathan distance
        return Math.abs(gol.get(0) - cur.get(0)) + Math.abs(gol.get(1) - cur.get(1));
    }
}

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
    }*/
}
