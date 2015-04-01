
/// <reference path="Astar.ts" />

//-- Trivial example -----------------------------

var start = 0;
var goal = 10;

function dummyF(x : number) : [number] {
    return [x+1,x-1];
}

function dummyCost(x, y) {
    return 1;
}

function dummyH(x : number) : number{
    return goal - x - 1;
}

function dummyGoal(x) : boolean{
    return x == goal;
}

function dummyCall(){
    return astar<number>(dummyF, dummyCost, dummyH, start, dummyGoal) ;
    // return bestFirst<number>(dummyF, dummyH, start, dummyGoal) ;
    // return lowestCost<number>(dummyF, dummyCost, start, dummyGoal) ;
}
