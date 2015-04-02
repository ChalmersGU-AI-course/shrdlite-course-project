/// <reference path="../astar-example/astar.ts" />

var sweden = new Graph();

var kiruna = new GraphNode(0, 5, 2, "Kiruna");
var lulea = new GraphNode(1, 10, 7, "Luleå");
var umea = new GraphNode(2, 10, 17, "Umeå");
var tanndalen = new GraphNode(3, 1, 23, "Tänndalen");
var sthlm = new GraphNode(4, 15, 28, "Stockholm");
var gbg = new GraphNode(5, 1, 33, "Gôteborg");
var kalmar = new GraphNode(6, 12, 34, "Kalmar");
var malmo = new GraphNode(7, 4, 40, "Malmö");

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
sweden.addEdge(new Edge(10, malmo, gbg));
sweden.addEdge(new Edge(14, kalmar, malmo));

//aStar.aStar(sweden, malmo, kiruna);
//console.log(aStar.aStar(sweden, malmo, kiruna));
//console.log(aStar.aStar(sweden, malmo, kiruna).getPath().toArray());