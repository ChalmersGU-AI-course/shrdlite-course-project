
/// <reference path="Astar.ts" />

//-- Trivial example -----------------------------

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
    return astar<number>(dummyF, dummyCost, dummyH, 0, dummyGoal)
}
