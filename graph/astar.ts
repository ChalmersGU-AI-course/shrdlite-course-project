/// <reference path="../lib/typescript-collections/collections.ts" />
/// <reference path="graph.ts" />

module astar {
    export function compute<T>(graph: graphmodule.Graph<T>, startID: string, endID: string) {

        var goalNodeAd = graph.adjacencyMap.getValue(endID);
        var currentAd = graph.adjacencyMap.getValue(startID);

        if (goalNodeAd === undefined || currentAd === undefined) {
            return undefined;
        }

        var goalNode = goalNodeAd.node;

        var pq = new collections.PriorityQueue<graphmodule.Path<T>>(
            function comparePath(first: graphmodule.Path<T>, second: graphmodule.Path<T>) {
                return graphmodule.comparePath(first, second, goalNode);
            }
            );

        var visited = new collections.Set<graphmodule.GraphNode<T>>();

        var currentPath = new graphmodule.Path<T>();

        var currentAd = graph.adjacencyMap.getValue(startID);

        var currentNode = currentAd.node;

        visited.add(currentNode);

        while (currentNode != goalNode) {

            currentAd.neighbours.forEach(
                function addEdge(edge: graphmodule.Edge<T>) {

                    if (!visited.contains(edge.to)) {
                        var newPath = new graphmodule.Path<T>(edge, currentPath);

                        pq.enqueue(newPath);
                    }
                    return true;
                }
                );

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
}