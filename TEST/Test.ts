
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
    var res = runPuzzle();
    show = "$ start heuristic: " + puzzleHeuristic(pStart) +
            "<p> path length: " + res.length +
            "<p>"+ res;

    document.getElementById("demo").innerHTML = show;
}
