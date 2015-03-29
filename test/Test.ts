///<reference path="../search/AStar"/>
///<reference path="../search/Search"/>
///<reference path="../search/Heuristic"/>
///<reference path="../lib/collections"/>

import D = collections.Dictionary;

class N {
  constructor(public value: string, public neighbours: [N, number][] = []) {

  }
}




var n1 = new N("n1");
var n2 = new N("n2");
var n3 = new N("n3");
var n4 = new N("n4");
var n5 = new N("n5");
var n6 = new N("n6");

n1.neighbours.push([n2, 1]);
n1.neighbours.push([n3, 1]);

n2.neighbours.push([n4, 1]);
n2.neighbours.push([n5, 4]);

n3.neighbours.push([n6, 5]);

n4.neighbours.push([n5, 1]);
n4.neighbours.push([n6, 3]);

n5.neighbours.push([n6, 1]);

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

var ns: (node: N) => [N, number][] = (node: N) => node.neighbours;
var end: (node: N) => boolean = (node: N) => node.value == "n6";
var aStar: ( h?: Search.Heuristic<N>
           , ns?: (a:N) => string
           ) => Search.Search<N, N[]> = Search.aStar;
var s: Search.Search<N, N[]> = aStar(Search.zeroHeuristic, (node: N) => node.value);
var p: N[] = s(ns, n1, end);

console.log(n1);
console.log(n2);
console.log(n3);
console.log(n4);
console.log(n5);
console.log(n6);

console.log("-------");
console.log(p);

