
/// <reference path="Astar.ts" />

class PState{
    /**
    * matr = 3x3 matrix of starting state
    * (iz, jz) = coordinate of zero in `matr`.
    */
    constructor(public matr : number[][], public iz : number, public jz : number){
    }

    /**
    * returns deep copy of this state.
    */
    slice(){
        var newMatr = [];
        for(var i in this.matr){
            newMatr.push(this.matr[i].slice());
        }
        return new PState(newMatr, this.iz, this.jz);
    }

    /**
    * returns html-friendly string.
    */
    toString(){
        var str = "";
        for(var i in this.matr){
            str = str + "<br> [" + this.matr[i] + "]" ;
        }
        return "["+ str +"]<p>";
    }
}

var pStart : PState = new PState(
        [[7,2,4],
         [5,0,6],
         [8,3,1]], 1, 1);

// var pStart : PState = new PState(
//         [[8,3,1],
//          [0,5,7],
//          [4,6,2]], 1, 0);

function puzzleGoal(a : PState){
    return puzzleHeuristic(a) == 0;
}

/**
* Manhattan distance as usual. The tile zero is ignored.
*/
function manhattan(i : number, j : number, x : number){
    if(x == 0){
        return 0;
    }
    return Math.abs((x%3) - j) + Math.abs( Math.floor(x/3) - i );
}

function puzzleHeuristic(a : PState) : number{
    var sum = 0;
    for (var i in a.matr){
        for (var j in a.matr[i]){
            sum = sum + manhattan(i,j,a.matr[i][j]);
        }
    }
    return sum;
}

/**
* returns deep copy of state where the zero tile is swapped with the tile on (ix, jx).
*/
function swap(a : PState, ix : number, jx : number) : PState{
    var b = a.slice();
    b.matr[b.iz][b.jz] = b.matr[ix][jx];
    b.matr[ix][jx] = 0 ;
    b.iz = ix;
    b.jz = jx;
    return b;
}

/**
* returns list of deep copies of neighbouring states.
*/
function puzzleNeighbours(a : PState) : PState[]{
    var is = [-1,0,1,0];
    var js = [0,-1,0,1];
    var result = [];
    for (var n in is){
        var ix = is[n] + a.iz;
        var jx = js[n] + a.jz;
        if(ix<0 || jx<0 || ix>2 || jx>2){
            continue;
        }
        result.push(swap(a,ix,jx));
    }
    return result;
}

function puzzleCost(a : PState, b : PState) : number{
    return 1;
}

function runPuzzle(){
    return astar<PState>(puzzleNeighbours, puzzleCost, puzzleHeuristic, pStart, puzzleGoal, true);
}
