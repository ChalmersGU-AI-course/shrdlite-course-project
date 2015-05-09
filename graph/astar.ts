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
		while (!isEndState(currentNode)) {
        
            //Create next states
            var neighbours = generateNeighbours(currentNode);
            
            //Add next states to the graph
            neighbours.forEach(
                function addNode(neighbour: graphmodule.GraphNode<T>){
                    
                    //Add the neighbour to the graph
                    graph.addNode(neighbour);
                    
                    //Add edge between current node and neighbour
                    graph.addEdge(currentNode.id, neighbour.id, 1, true);
                    
                    return true;
                }
            );
        
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
            console.log("astar.comparePath: " + currentPath);
            
            if (currentPath == undefined) {
                //No path to the goal
                //console.log("astar.comparePath: No path found to the goal");
                return undefined;
            }

            currentNode = currentPath.path.last().to;

            visited.add(currentNode);

            currentAd = graph.adjacencyMap.getValue(currentNode.id);

        }

        //console.log("astar.comparePath:  *********************** End of astar ***********************");
        return currentPath;

    }
}