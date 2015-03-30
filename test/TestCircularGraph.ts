///<reference path="../search/AStar"/>
///<reference path="../search/Search"/>
///<reference path="../search/Heuristic"/>


class N {
  constructor(public value: string, public neighbours: [N, number][] = []) {
  }
}

//                    (n1)
//                1  /   \  4
//               ----     ----
//      10      /             \
//  (n7)-------(n2)          (n3)
//          4  A  A  1         |
//         ----    ----      5 |
//        /            \       |
//        V     1       V      |
//      (n5)<-------->(n4)     |
//        |             A      |
//         \ 2        3 /      |
//          ----   ----        |
//              \ /          /
//               |        ----   
//               |       /       
//              (n6)-----        

var n1 = new N("n1");
var n2 = new N("n2");
var n3 = new N("n3");
var n4 = new N("n4");
var n5 = new N("n5");
var n6 = new N("n6");
var n7 = new N("n7");
var ns = [n1, n2, n3, n4, n5, n6, n7];

n1.neighbours.push([n2, 1]);
n1.neighbours.push([n3, 4]);

n2.neighbours.push([n4, 1]);
n4.neighbours.push([n2, 1]);

n2.neighbours.push([n5, 4]);
n5.neighbours.push([n2, 4]);

//n2.neighbours.push([n7, 1]);
n2.neighbours.push([n7, 10]);

n3.neighbours.push([n6, 5]);

n4.neighbours.push([n5, 1]);
n5.neighbours.push([n4, 1]);

n4.neighbours.push([n6, 3]);

n5.neighbours.push([n6, 1]);


var start = n1;
var ends:Array<N>  = [n6];

var s = Search.aStar(undefined, (node: N) => node.value);
var p = s((n: N) => n.neighbours, start, (n: N) => isEnd(n));

function isEnd(node: N): boolean{
    for(var i = 0; i < ends.length; i++){
        if(node == ends[i]){
            return true;
        }
    }
    return false;
}

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

console.log("\nPath from " + start.value + " to " + p[p.length -1].value + ":");
showP(p);
console.log();