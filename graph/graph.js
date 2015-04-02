/// <reference path="../lib/typescript-collections/collections.ts" />
var graphmodule;
(function (graphmodule) {
    /** A node that has a string ID and holds some arbitrary data.
     * Also holds a map containing the heuristic to every other node (in a graph) */
    var GraphNode = (function () {
        function GraphNode(id, data) {
            this.id = id;
            if (data != undefined) {
                this.data = data;
            }
            this.heuristics = new collections.Dictionary();
        }
        GraphNode.prototype.toString = function () {
            return this.id;
        };
        return GraphNode;
    })();
    graphmodule.GraphNode = GraphNode;
    /** An edge holds its two end-nodes and has a cost */
    var Edge = (function () {
        function Edge(from, to, cost) {
            this.from = from;
            this.to = to;
            this.cost = cost;
        }
        Edge.prototype.toString = function () {
            return this.from.toString() + "-" + this.to.toString();
        };
        return Edge;
    })();
    graphmodule.Edge = Edge;
    /** Holds a node and all the edges going out from it */
    var Adjacency = (function () {
        function Adjacency(node) {
            this.node = node;
            this.neighbours = new collections.Set();
        }
        Adjacency.prototype.toString = function () {
            return "Node: " + this.node.toString() + ": " + this.neighbours.toString();
        };
        return Adjacency;
    })();
    graphmodule.Adjacency = Adjacency;
    /** A Path is a list of edges. It also has a cost */
    var Path = (function () {
        function Path(newEdge, oldPath) {
            var _this = this;
            this.path = new collections.LinkedList();
            this.cost = 0;
            if (oldPath != undefined) {
                oldPath.path.forEach(function (item) {
                    _this.path.add(item);
                    return true;
                });
                this.cost += oldPath.cost;
            }
            if (newEdge != undefined) {
                this.path.add(newEdge);
                this.cost += newEdge.cost;
            }
        }
        Path.prototype.toString = function () {
            return "Path [" + this.cost + "] = " + this.path.toString();
        };
        return Path;
    })();
    graphmodule.Path = Path;
    /** Function to compare two paths. Needs to know the goal node in order to use heuristics */
    function comparePath(first, second, goal) {
        //returns cost of: second - first in regard of reaching the goal
        return (second.cost + second.path.last().to.heuristics.getValue(goal)) - (first.cost + first.path.last().to.heuristics.getValue(goal));
    }
    graphmodule.comparePath = comparePath;
    /** Graph holding nodes and edges */
    var Graph = (function () {
        function Graph() {
            this.adjacencyMap = new collections.Dictionary();
            this.nodes = new collections.Set();
            this.edges = new collections.Set();
        }
        Graph.prototype.addNode = function (node) {
            this.nodes.add(node);
            this.adjacencyMap.setValue(node.id, new Adjacency(node));
        };
        Graph.prototype.addEdge = function (startId, endId, cost, bidirectional) {
            if (bidirectional === void 0) { bidirectional = false; }
            //Get the Adjacency<T> object for each node
            var adjacencyNodeStart = this.adjacencyMap.getValue(startId);
            var adjacencyNodeEnd = this.adjacencyMap.getValue(endId);
            //If any of them are null, fail
            if (adjacencyNodeStart === undefined || adjacencyNodeEnd === undefined) {
                return false;
            }
            //Get the actual nodes
            var startNode = adjacencyNodeStart.node;
            var endNode = adjacencyNodeEnd.node;
            //Create an Edge<T> from start to end
            var newEdge = new Edge(startNode, endNode, cost);
            //Add the Edge<T>
            this.edges.add(newEdge);
            this.adjacencyMap.getValue(startId).neighbours.add(newEdge);
            //In case the Edge<T> should be bidirectional, add an Edge<T>
            // in the other direction as well
            if (bidirectional) {
                var newEdge2 = new Edge(endNode, startNode, cost);
                this.edges.add(newEdge2);
                this.adjacencyMap.getValue(endId).neighbours.add(newEdge2);
            }
            return true;
        };
        Graph.prototype.setHeuristicsFun = function (callback) {
            this.nodes.forEach(callback);
        };
        Graph.prototype.toString = function () {
            return "---Graph<T>---\nNodes: " + this.nodes.toString() + "\nEdges: " + this.edges.toString() + "\n----------";
        };
        return Graph;
    })();
    graphmodule.Graph = Graph;
})(graphmodule || (graphmodule = {}));
