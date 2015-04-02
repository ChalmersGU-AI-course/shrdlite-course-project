/// <reference path="../lib/typescript-collections/collections.ts" />
/// <reference path="graph.ts" />
var astar;
(function (astar) {
    function compute(graph, startID, endID) {
        var goalNodeAd = graph.adjacencyMap.getValue(endID);
        var currentAd = graph.adjacencyMap.getValue(startID);
        if (goalNodeAd === undefined || currentAd === undefined) {
            return undefined;
        }
        var goalNode = goalNodeAd.node;
        var pq = new collections.PriorityQueue(function comparePath(first, second) {
            return graphmodule.comparePath(first, second, goalNode);
        });
        var visited = new collections.Set();
        var currentPath = new graphmodule.Path();
        var currentAd = graph.adjacencyMap.getValue(startID);
        var currentNode = currentAd.node;
        visited.add(currentNode);
        while (currentNode != goalNode) {
            currentAd.neighbours.forEach(function addEdge(edge) {
                if (!visited.contains(edge.to)) {
                    var newPath = new graphmodule.Path(edge, currentPath);
                    pq.enqueue(newPath);
                }
                return true;
            });
            currentPath = pq.dequeue();
            if (currentPath === undefined) {
                //No path to the goal
                return undefined;
            }
            currentNode = currentPath.path.last().to;
            visited.add(currentNode);
            currentAd = graph.adjacencyMap.getValue(currentNode.id);
        }
        return currentPath;
    }
    astar.compute = compute;
})(astar || (astar = {}));
