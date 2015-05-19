/// <reference path="../lib/typescript-collections/collections.ts" />
/// <reference path="graph.ts" />

module astar {

    /** Compute the a path from the given start node to the given end node and the given graph */
    export function compute<T>(graph: graphmodule.Graph<T>, startID: string, isEndState: graphmodule.ValidStateFunction<T>, hFun: graphmodule.HeuristicFunction<T>, generateNeighbours: graphmodule.GenerateNodes<T>) {
    
        //var goalNodeAd = graph.adjacencyMap.getValue(endID);
        var currentAd = graph.adjacencyMap.getValue(startID);

        if (currentAd === undefined) { //goalNodeAd === undefined || 
            return undefined;
        }

        //var goalNode = goalNodeAd.node;

        var pq = new collections.PriorityQueue<graphmodule.Path<T>>(
            function comparePath(first: graphmodule.Path<T>, second: graphmodule.Path<T>) {
                //first: first path
                //second: second path
                //goalNode: The goal node
                //hFun: The heuristic function that should be used
                return graphmodule.comparePath(first, second, hFun); //goalNode, 
            }
        );

        var visited = new collections.Set<graphmodule.GraphNode<T>>();

        var currentPath = new graphmodule.Path<T>();

        var currentAd = graph.adjacencyMap.getValue(startID);

        var currentNode = currentAd.node;

        visited.add(currentNode);
        
        var startTime = new Date().getTime();
        
		while (!isEndState(currentNode)) {
        
            var nowTime = new Date().getTime();
            
            if((nowTime - startTime) > 30000){
                //Not allowed to run any longer
                console.log("A* IS NOT ALLOWED TO RUN ANY LONGER!!");
                return undefined;
            }
        
            //Create next states
            generateNeighbours(currentNode);
        
            currentAd.neighbours.forEach(
                function addEdge(edge: graphmodule.Edge<T>) {
                    var neighbour = edge.to;

                    if (!visited.contains(neighbour)) {
                        
                        var newPath = new graphmodule.Path<T>(edge, currentPath);
                        
                        
                        
                        pq.enqueue(newPath);
                    }
                    return true;
                }
            );

            currentPath = pq.dequeue();
            //console.log("astar.comparePath: " + currentPath);
            
            if (currentPath == undefined) {
                //No path to the goal
                ////console.log("astar.comparePath: No path found to the goal");
                return undefined;
            }

            currentNode = currentPath.path.last().to;

            visited.add(currentNode);

            currentAd = graph.adjacencyMap.getValue(currentNode.id);

        }

        ////console.log("astar.comparePath:  *********************** End of astar ***********************");
        return currentPath;

    }
}