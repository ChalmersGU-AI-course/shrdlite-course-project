/// <reference path="../astar-example/astar.ts" />

var sweden = new Graph<EucliNode>();

var kiruna = new EucliNode(0, 5, 2, "Kiruna");
var lulea = new EucliNode(1, 10, 7, "Luleå");
var umea = new EucliNode(2, 10, 17, "Umeå");
var tanndalen = new EucliNode(3, 1, 23, "Tänndalen");
var sthlm = new EucliNode(4, 15, 28, "Stockholm");
var gbg = new EucliNode(5, 1, 33, "Gôteborg");
var kalmar = new EucliNode(6, 12, 34, "Kalmar");
var malmo = new EucliNode(7, 4, 40, "Malmö");

sweden.addNode(kiruna);
sweden.addNode(lulea);
sweden.addNode(umea);
sweden.addNode(tanndalen);
sweden.addNode(sthlm);
sweden.addNode(gbg);
sweden.addNode(kalmar);
sweden.addNode(malmo);

sweden.addEdge(new Edge(10, kiruna, lulea));
sweden.addEdge(new Edge(25, tanndalen, kiruna));
sweden.addEdge(new Edge(12, lulea, umea));
sweden.addEdge(new Edge(14, umea, tanndalen));
sweden.addEdge(new Edge(16, umea, sthlm));
sweden.addEdge(new Edge(19, tanndalen, sthlm));
sweden.addEdge(new Edge(10, tanndalen, gbg));
sweden.addEdge(new Edge(19, gbg, sthlm));
sweden.addEdge(new Edge(9, sthlm, kalmar));
sweden.addEdge(new Edge(12, gbg, kalmar));
sweden.addEdge(new Edge(13, malmo, gbg));
sweden.addEdge(new Edge(11, kalmar, malmo));

var antiBestFirst = new Graph<EucliNode>();

var start = new EucliNode(0,0,1,"start-node");   // V I S U A L I S E D
var roundway0 = new EucliNode(1,1,2,"r1");       //  r0-----r1
var roundway1 = new EucliNode(2,2,2,"r2");       //  /     /
var goal = new EucliNode(3,0,0,"goal-node");     // s     /
											     // g----´

antiBestFirst.addNode(start);
antiBestFirst.addNode(roundway0);
antiBestFirst.addNode(roundway1);
antiBestFirst.addNode(goal);

antiBestFirst.addEdge(new Edge(2,start, roundway0));
antiBestFirst.addEdge(new Edge(1,roundway0, roundway1));
antiBestFirst.addEdge(new Edge(3,roundway1, goal));

var resultSweden = aStar.aStar(sweden, malmo, kiruna);
var resultAntiBest = aStar.aStar(antiBestFirst, start, goal);

printResult("Sweden",resultSweden);
printResult("Anti-best-first",resultAntiBest);

function printResult(name : String, result : any) {
	var path = result.getPath();
	var node = path.firstNode;
	var i = 1;

	console.log("======== Result: " + name + " ========");
	console.log("Total cost:  " + result.getTotalDistance());
	console.log("Total edges: " + path.size());

	while (node != null) {

		console.log("Edge " + i++ + ": " + node.element.getFromNode().getName() + "-" + node.element.getEndNode().getName() + " (cost " + node.element.getCost() + ")");
		node = node.next
	}
}