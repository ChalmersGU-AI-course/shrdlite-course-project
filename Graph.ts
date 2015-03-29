interface GraphNode {
    name: string;
    x: number;
    y: number;
}

class Graph {
    nodes: GraphNode[];
    edges: [number, number][][]; //A list of tuples for every node

    constructor(nodes: GraphNode[], edges: [number, number][][]) {
        this.nodes = nodes;
        this.edges = edges;
    }

    findPath(start: number, goal: number): [number, number][] //Returns a list of edges
    {
        if (start > this.nodes.length || start < 0 || goal > this.nodes.length || goal < 0)
            throw new RangeError("Node does not exist");

        var closedset = []; //list
        var openset = start; //list
        var came_from = []; //matris typ

        /*
        var f_score: minheap = new MinHeap();

	    var g_score = ; //array of same length as nodes list
	    g_score[start]=0;

	    //min heap på f_score
	    f_score[start] = g_score[start] + heuristicCost(start,goal);

        while (openset.size() != 0) {
            var current: number = ;//hitta elementet med lägst värde i f_score, sätt current till dess index

            if (current == goal) {
                //hurray
                //returnera
            }

            //find current in openset and remove that element and add to closed
            it = openset.find(current);
            closedset.add(openset(it));
            openset.remove(it);

            current_neighbour = getNeighbours(current);

            for (var i = 0; i < current_neighbour.length; ++i) {
                if (closedSet.contains(current_neighbour[i]))
                    continue;

                var tentative_g_score = g_score[current] + edge_between_cost;

                if (!openset.contains(current_neighbour[i]) || tenative_g_score < g_score[current_neighbour[i]]) {
                    //spara undan hur du kom hit
                    g_score[current_neighbour[i]] = tenative_g_score;
                    f_score[current_neighbour[i]] = g_score[current_neighbour[i]] + heuristicCost[current_neighbour[i], goal];
                    if (openset.contains(current_neighbour[i]))
                        openset.add(current_neighbour[i]);
                }
            }
        }
        */

        //Dummy: Just a test path for the view
        return [[start, 9], [10, 13], [13, 12], [12, goal]];

        return undefined; //No path was found
    }

    heuristicCost(current: number, goal: number): number {
        return 0;
    }

    getNeighbours(node: number): [number, number][] {
        if (node < 0 || node >= this.nodes.length)
            throw new RangeError("Node does not exist");

        return this.edges[node];
    }

    get NoOfNodes(): number {
        return this.nodes.length;
    }
}