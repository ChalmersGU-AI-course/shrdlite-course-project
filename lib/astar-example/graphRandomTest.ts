/// <reference path="../astar-example/astar.ts" />
/// <reference path="../astar-example/cityNames.ts" />

// Generate a World that is 10000x10000 coordinates big, with hundreds of random cities 
// and random roads between them.

var world = new Graph();

var worldSize = 10000;			// Size of the grid.
var nrOfCities = 10000;			// Number of cities.		
var maxRoadsPerCity = 5;		// Maximum number of roads that a city can have.
var probOfRoad = 40;			// Probility that a road is created where there can be one.

console.log("Initiating cities.");
for (var i = 0; i < nrOfCities; i++) {
	var xPos = Math.floor((Math.random() * worldSize) + 1);
	var yPos = Math.floor((Math.random() * worldSize) + 1);
	var nameIndex = Math.floor((Math.random() * cityNames.length) + 1);

	var node = new GraphNode(i, xPos, yPos, cityNames[nameIndex]);
	world.addNode(node);
}
console.log("Total citis: " + world.getNumberOfNodes() + ".");


console.log("Initiating roads.");
for (var i = 0; i < world.getNumberOfNodes(); i++) {
	var startNode = world.getNode(i);
	for (var j = 0; j < maxRoadsPerCity; j++) {
		var chance = Math.floor((Math.random() * 100) + 1);
		if(chance >= (100-probOfRoad)) {
			var endNode = world.getRandomNode(); // Should be one K-nearest instead.
			var edge = new Edge(startNode.distanceTo(endNode), startNode, endNode);
			world.addEdge(edge);
		}
	}
}
console.log("Total roads: " + world.getNumberOfEdges() + ".");

var fromNode = world.getRandomNode();
var toNode = world.getRandomNode();
var search = aStar.aStar(world, fromNode, toNode);

console.log("From: " + fromNode.getName());
console.log("To: " + toNode.getName());
console.log(search);
if(search != null ) {
	console.log(search.getPath().toArray());
}