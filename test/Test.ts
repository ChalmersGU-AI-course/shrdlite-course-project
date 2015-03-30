///<reference path="../search/AStar"/>
///<reference path="../search/Search"/>
///<reference path="../search/Heuristic"/>

class N {
  constructor(public value: string, public neighbours: [N, number][] = []) {
  }
}

//                    (n1)
//                1  /   \  1
//               ----     ----
//              /             \
//             (n2)          (n3)
//          4  /  \  1         |
//         ----    ----        |
//        /            \       |
//        |     1       |      |
//      (n5)----------(n4)     |
//        |             |      |
//        \ 1        3 /       |
//         -----   ----        |
//              \ /         5 /
//               |        ----
//               |       /
//              (n6)-----

var n1 = new N("n1");
var n2 = new N("n2");
var n3 = new N("n3");
var n4 = new N("n4");
var n5 = new N("n5");
var n6 = new N("n6");
var ns = [n1, n2, n3, n4, n5, n6];

n1.neighbours.push([n2, 1]);
n1.neighbours.push([n3, 1]);

n2.neighbours.push([n4, 1]);
n2.neighbours.push([n5, 4]);

n3.neighbours.push([n6, 5]);

n4.neighbours.push([n5, 1]);
n4.neighbours.push([n6, 3]);

n5.neighbours.push([n6, 1]);


var start = n1;
var end   = n6;

var s = Search.aStar(undefined, (node: N) => node.value);
var p = s((n: N) => n.neighbours, start, (n: N) => n.value == end.value);


var showN = (n: N) => {
  var str   = "  " + n.value;
  for (var i in n.neighbours) {
    if ( i > 0 ) 
      str += ", ";
    else
      str += " -> ";

    str += "(" + n.neighbours[i][0].value + ", " + n.neighbours[i][1] + ")" ;
  }
  console.log(str);
}

var showP = (p: N[]) => {
  var str   = "  ";
  for (var i in p) {
    if ( i > 0 )
      str += " -> ";

    str += p[i].value
  }
  console.log(str);
}

console.log("\nNodes:")
for (var i in ns) {
  showN(ns[i]);
}

console.log("\nPath from " + start.value + " to " + end.value + ":");
showP(p);
console.log();

