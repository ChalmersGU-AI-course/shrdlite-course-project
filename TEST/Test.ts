
/// <reference path="Dummy.ts" />
/// <reference path="Example.ts" />
/// <reference path="Puzzle.ts" />
/// <reference path="Astar.ts" />
/// <reference path="lib/collections.ts" />

var show = "Hello World!!!" ;

//--------------------------------------

//--------------------------------------

function testMain(){
    // show = "$ " + dummyCall();
    // show = "$ " + graphRun();
    // show = "$ " + puzzleHeuristic(pStart) + ", " + puzzleHeuristic(pGoal);
    var ns = puzzleNeighbours(pStart);
    // show = "$ " + pStart + " $$$$$ " + ns;
    // show = "$ " + puzzleHeuristic(ns[0]);
    show = "$ start heuristic: " + puzzleHeuristic(pStart) + "<p>"+ runPuzzle() ;

    document.getElementById("demo").innerHTML = show;
}
