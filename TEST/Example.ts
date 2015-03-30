
/// <reference path="lib/collections.ts" />
/// <reference path="Astar.ts" />

//-- Definitions ----------------------------------------

class PositionXY{
    constructor(public x : number, public y : number){
    }

    toString(){
        return "(" + this.x + ", " + this.y + ")";
    }
}

var Origin : PositionXY;
var End : PositionXY;


//-- Functions ----------------------------------------

function makeGraph<T>(){
    return new collections.Dictionary<T, collections.Dictionary<T, number>>();
}

var graph = makeGraph<PositionXY>();

function addPosition<T>(a : PositionXY){
    graph.setValue(a, new collections.Dictionary<PositionXY, number>());
}

function addEdge(fr : PositionXY, to : PositionXY, cost : number){
    graph.getValue(fr).setValue(to, cost);
    graph.getValue(to).setValue(fr, cost);
}

function graphNeighbours(a : PositionXY) : PositionXY[]{
    return graph.getValue(a).keys();
}

function graphCost(a : PositionXY, b : PositionXY) : number{
    return graph.getValue(a).getValue(b);
}

function graphHeuristic(a : PositionXY) : number{
    var x = (End.x - a.x);
    var y = (End.y - a.y);
    return Math.sqrt(x*x + y*y) ;
}

function graphGoal(a : PositionXY) : boolean{
    return a.x == End.x && a.y == End.y;
}

function graphRun(){
    return astar<PositionXY>(graphNeighbours, graphCost, graphHeuristic, Origin, graphGoal);
}

//-- Graph data ------------------------------------------

var Origin = new PositionXY(0,0);
var A = new PositionXY(1,2);
var B = new PositionXY(2,0);
var C = new PositionXY(3,1);
var D = new PositionXY(4,3);
var E = new PositionXY(5,4);
var F = new PositionXY(2,4);
// var End = Origin;
var End = new PositionXY(4,5);


addPosition(Origin);
addPosition(A);
addPosition(B);
addPosition(C);
addPosition(D);
addPosition(E);
addPosition(F);
addPosition(End);


addEdge(Origin,A,4);
addEdge(Origin,B,3);
addEdge(Origin,F,7);

addEdge(A,B,3);
addEdge(A,F,4);

addEdge(B,C,2);
addEdge(B,End,11);

addEdge(C,D,3);
addEdge(C,F,4);

addEdge(D,E,2);
addEdge(D,End,4);

addEdge(E,End,3);
addEdge(F,End,6);
