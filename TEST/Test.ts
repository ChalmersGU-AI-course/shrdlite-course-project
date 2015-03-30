
/// <reference path="Other.ts" />
/// <reference path="Example.ts" />
/// <reference path="Astar.ts" />
/// <reference path="lib/collections.ts" />

var show = "Hello World!!!" ;

//--------------------------------------

//--------------------------------------

function testMain(){
    // show = "$ " + dummyCall();
    // show = "$" + (4^0) ;
    // show = "$ " + graphCost(A,B);
    show = "$ " + graphRun();

    document.getElementById("demo").innerHTML = show;
}
