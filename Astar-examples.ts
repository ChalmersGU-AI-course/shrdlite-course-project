///<reference path="Astar.ts"/>

class Astar-examples {
    constructor();

    
}



public class eightpuzzle implements  graph<number[][]>, neighbors<number[][]>{
    initstate : number[][];
    goalstate : number[][];
    
    constructor(){
        this.initstate = createState([2, 4, 0, 5, 7, 1 ,8 ,3, 6]);
        this.goalstate = createState([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        this.nodes = allstates();
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
}
