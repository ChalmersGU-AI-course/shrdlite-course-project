/// <reference path="../astar-example/astar.ts" />
/// <reference path="../astar-example/cityNames.ts" />

// Generate a World that is 10000x10000 coordinates big, with hundreds of random cities 
// and random roads between them.

var world = new Graph();

var worldSize = 10000;
var nrOfCities = 3000;
var nrOfRoads = 2000;
var maxRoadsPerCity = 5;
var probOfRoad = 20;
var maxCost = 50;

console.log("Initiating " + nrOfCities + " cities.");
for (var i = 0; i < nrOfCities; i++) {
	var xPos = Math.floor((Math.random() * worldSize) + 1);
	var yPos = Math.floor((Math.random() * worldSize) + 1);
	var nameIndex = Math.floor((Math.random() * cityNames.length) + 1);

	var node = new GraphNode(i, xPos, yPos, cityNames[nameIndex]);
	world.addNode(node);
}

/* Work in progress
for (var i = 0; i < world.getNumberOfNodes(); i++) {
	for (var i = 0; i < maxRoadsPerCity; i++) {
		var chance = Math.floor((Math.random() * 100) + 1);
		if(chance >= (100-probOfRoad)) {

		}
	}
}
*/

console.log("Initiating " + nrOfRoads + " roads.");
for (var i = 0; i < nrOfRoads; i++) {
	var cost = Math.floor((Math.random() * maxCost) + 1);
	var startNode = world.getRandomNode();
	var endNode = world.getRandomNode();

	var edge = new Edge(cost, startNode, endNode);
	world.addEdge(edge);
}

var fromNode = world.getRandomNode();
var toNode = world.getRandomNode();

console.log("From: " + fromNode.getName());
console.log("To: " + toNode.getName());
var search = aStar.aStar(world, fromNode, toNode);
console.log(search);
if(search != null ) {
	console.log(search.getPath().toArray());
}