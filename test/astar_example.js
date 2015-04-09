/// <reference path='../typings/node.d.ts' />
/// <reference path="../src/AStar"/>
function contents(nodes) {
    return nodes.map(function (n) {
        return n.content;
    });
}
function heuristic(start, goal) {
    return 1;
}
function example1() {
    var node1 = new AStar.Node("state1");
    var node2 = new AStar.Node("state2");
    var node3 = new AStar.Node("state3");
    node1.addNeighbour(node2, 1);
    node1.addNeighbour(node3, 1);
    node2.addNeighbour(node3, 1);
    var result = AStar.astar(node1, node3, heuristic);
    console.log("example 1: ", contents(result));
}
function example2() {
    var node1 = new AStar.Node("state1");
    var node2 = new AStar.Node("state2");
    var node3 = new AStar.Node("state3");
    node1.addNeighbour(node2, 1);
    node1.addNeighbour(node3, 200);
    node2.addNeighbour(node3, 1);
    var result = AStar.astar(node1, node3, heuristic);
    console.log("example 2: ", contents(result));
}
example1();
example2();
