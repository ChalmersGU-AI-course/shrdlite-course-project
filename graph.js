/// <reference path="collections.ts" />
var graph;
(function (graph) {
    var Node = (function () {
        function Node(node) {
            this.node = node;
            this.neighbors = new collections.Dictionary();
        }
        Node.prototype.addNeighbor = function (neighbor, weight) {
            if (!this.neighbors.containsKey(neighbor)) {
                return this.neighbors.setValue(neighbor, weight);
            }
            return this.neighbors.getValue(neighbor);
        };
        return Node;
    })();
    graph.Node = Node;
    var Graph = (function () {
        function Graph() {
            this.nodeMap = new collections.Dictionary();
        }
        Graph.prototype.addNode = function (node) {
            var newNode = new Node(node);
            return this.nodeMap.setValue(node, newNode);
        };
        Graph.prototype.addArc = function (a, b, weight) {
            if (!this.nodeMap.containsKey(a)) {
                this.addNode(a);
            }
            if (!this.nodeMap.containsKey(b)) {
                this.addNode(b);
            }
            return this.nodeMap.getValue(a).addNeighbor(this.nodeMap.getValue(a), weight);
        };
        Graph.prototype.cost = function (a, b) {
            for (var node in this.nodeMap.values()) {
                if (node === a && node.neighbors.containsKey(b)) {
                    return node.neighbors.getValue(b);
                }
            }
        };
        return Graph;
    })();
    graph.Graph = Graph;
})(graph || (graph = {}));
