
/// <reference path="Dummy.ts" />
/// <reference path="Example.ts" />
/// <reference path="Astar.ts" />
/// <reference path="lib/collections.ts" />

var show = "Hello World!!!" ;

//--------------------------------------

//--------------------------------------

function testMain(){
    // show = "$ " + dummyCall();
    show = "$ " + graphRun();

    document.getElementById("demo").innerHTML = show;
}
