///<reference path="../search/AStar"/>
///<reference path="../search/Search"/>
///<reference path="../search/Heuristic"/>

class CoNode {
    constructor(public value: string, 
        public x: number, 
        public y: number, 
        public neighbours: [CoNode, number][] = []){}
}

module Search{
  export function lineHeuristic(end: CoNode): Heuristic<CoNode>{
    return function (node: CoNode): number {
      var x2 = (node.x - end.x)*(node.x - end.x);
      var y2 = (node.y - end.y)*(node.y - end.y);
      return Math.sqrt(x2+y2);
   }
  }
}

// Construct nodes
var n1 = new CoNode("n1", 1, 1);
var n2 = new CoNode("n2", 10000000, 10000000);
var n3 = new CoNode("n3", 1, 2);
var n4 = new CoNode("n4", 1, 3);

// Construct neighbours
n1.neighbours.push([n2,1]);
n1.neighbours.push([n3,2]);

n2.neighbours.push([n4,4]);
n2.neighbours.push([n3,3]);

n3.neighbours.push([n4,5]);

var ns = [n1,n2,n3,n4];

var start = n1;
var end = n4;

var h = Search.lineHeuristic(end);
var s = Search.aStar(h, (node: CoNode) => node.value);
var p = s((n: CoNode) => n.neighbours, start, (n: CoNode) => n.value == end.value);

// Print graph structure.
var printN = (n: CoNode) => {
  var str = " " + n.value;
  for (var i in n.neighbours) {
    if ( i > 0)
      str += ", ";
    else
      str += " -> ";

    str += "(" + n.neighbours[i][0].value + ", " + n.neighbours[i][1] + ")" ;
  }
  console.log(str);
}

// Print best path.
var printP = (n: CoNode[]) => {
  var str = "  ";
  for (var i in p) {
    if (i > 0 )
      str += " -> ";

    str += p[i].value
  }
  console.log(str);
}

console.log("\nNodes:")
for (var i in ns) {
  printN(ns[i]);
}

console.log("\nPath from " + start.value + " to " + end.value + ":");
printP(p);
console.log();

