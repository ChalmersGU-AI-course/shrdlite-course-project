/// <reference path='../typings/node.d.ts' />
/// <reference path="../src/AStar"/>

var AStar = require("../src/AStar.js");

var node1 = new AStar.Node("state1");
var node2 = new AStar.Node("state2");
var node3 = new AStar.Node("state3");

node1.addNeighbour(node2, 1);
node1.addNeighbour(node3, 2);
node2.addNeighbour(node3, 3);
node3.addNeighbour(node2, 4);

function heuristic(start, goal): number {
  return Math.random();
}

var result = AStar.astar(node1, node3, heuristic);
console.log("result: ", result);
