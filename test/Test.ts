///<reference path="../search/AStar"/>
///<reference path="../search/Search"/>
///<reference path="../search/Heuristic"/>
///<reference path="./Graph"/>


var x_dim = 10;
var y_dim = 10;

// The map - coordinates with value true connects to their neighbours,
// with value false they do not.
var m: boolean[][] = []; 

// Add edges along the y-axis
var xAxis: boolean = true;
// Add edges along the x-axis
var yAxis: boolean = true;
// Add edges along the diagonals
var diags: boolean = false;

var g: N[][];

var start: N;
var end: N;

var stats = { nodesVisited: 0, nodesAdded: 0 }

function manhattan(end: N): Search.Heuristic<N> {
  return function(node: N): number {
    return Math.abs(end.x - node.x) + Math.abs(end.y - node.y);
  }
}

function straightLine(end: N): Search.Heuristic<N> {
  return function(node: N): number {
    return Math.sqrt(Math.pow(end.x - node.x, 2) + Math.pow(end.y - node.y, 2));
  }
}

function showP (p: N[]): string {
  if ( !p ) {
    console.log("No path found");
  }
  var str = "";
  for (var i in p) {
    if ( i > 0 )
      str += " -> ";
    str += p[i].value
  }
  return str;
}

function run(h: Search.Heuristic<N>, hn: string) {
  stats = { nodesVisited: 0, nodesAdded: 0 }
  var s = Search.aStar(h, (node: N) => node.value, stats);
  var p = s((n: N) => n.neighbours, start, (n: N) => n.value == end.value);

  console.log("\n" + hn + "\n-------------------------")
  console.log("\nPath from " + start.value + " to " + end.value + ":");
  console.log("  " + showP(p));
  console.log("\nStats:");
  console.log("         nodes visited: " + stats.nodesVisited);
  console.log("  nodes added to queue: " + stats.nodesAdded);
  console.log();
  printGraph(m, p);
}


// Initialize map and graph, no edges added at this point
for ( var y=0; y<y_dim; y++ ) { 
  var my = [];
  for ( var x=0; x<x_dim; x++ ) { 
    my.push(true);
  }
  m.push(my);
}

// Add obstacle to map
m[3][3] = false;
m[3][4] = false;
m[4][4] = false;
m[5][4] = false;
m[6][4] = false;


// Add edges along the y-axis
var xAxis: boolean = true;
// Add edges along the x-axis
var yAxis: boolean = true;
// Add edges along the diagonals
var diags: boolean = false;

var g = graph(m, x_dim, y_dim);

var start = g[0][0];
var end   = g[9][9];

run(undefined, "zero");
run(manhattan(end), "manhattan");
run(straightLine(end), "straight line");
