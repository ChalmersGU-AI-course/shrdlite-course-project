///<reference path="lib/collections.ts"/>

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

        var cameFrom: number[] = []; //matris typ

        var openset = new collections.Set<number>();

        var fscore = new collections.PriorityQueue<{ node: number; cost: number }>(function (a, b): number {
            return a.cost < b.cost ? 1 : -1;
        });


        var closedset = new collections.Set<number>();

        var g_score = []; //could maybe use = new int[f_score.length] for pre allocation
        for (var i = 0; i < this.nodes.length; ++i)
            g_score[i] = 0;

        openset.add(start);
        fscore.enqueue({ node: start, cost: g_score[start] + this.heuristicCost(start, goal) });

        while (!openset.isEmpty()) {
            //var current: number = this.indexOfSmallest(f_score);//hitta elementet med lägst värde i f_score, sätt current till dess index
            var current = fscore.dequeue().node;

            if (current == goal) {
                var path = [];//: [][number, number];
                var cur = goal;
                while (cur != start) {
                    path.push([cameFrom[cur], cur]);
                    cur = cameFrom[cur];
                }
                var pathI = [];
                for (var i = 0; i < path.length; ++i) {
                    pathI[i] = path[path.length - 1 - i];
                }

                return pathI;
            }

            //find current in openset and remove that element and add to closed
            closedset.add(current);
            //openset.splice(it, 1); //splice removes the element at index
            openset.remove(current);

            var current_neighbours = this.getNeighbours(current);


            for (var i = 0; i < current_neighbours.length; ++i) {

                if (closedset.contains(current_neighbours[i][1]))
                    continue;

                var edge_between_cost = this.cost(this.nodes[current], this.nodes[current_neighbours[0][1]]);


                var tentative_g_score = g_score[current] + edge_between_cost;

                if (!openset.contains(current_neighbours[i][1]) || tentative_g_score < g_score[current_neighbours[i][1]]) {
                    cameFrom[current_neighbours[i][1]] = current;
                    g_score[current_neighbours[i][1]] = tentative_g_score;

                    fscore.enqueue({node: current_neighbours[i][1], cost: g_score[current_neighbours[i][1]] + this.heuristicCost(current_neighbours[i][1], goal)});

                    if (!openset.contains(current_neighbours[i][1]))
                        openset.add(current_neighbours[i][1]);
                }
            }
        }

        return undefined; //No path was found
    }

    heuristicCost(current: number, goal: number): number {
        return this.cost(this.nodes[current], this.nodes[goal]);
    }

    getNeighbours(node: number): [number, number][] {
        if (node < 0 || node >= this.nodes.length)
            throw new RangeError("Node does not exist");

        return this.edges[node];
    }

    cost(node1: GraphNode, node2: GraphNode) {
        return Math.sqrt((node1.x - node2.x) * (node1.x - node2.x) + (node1.y - node2.y) * (node1.y - node2.y));
    }

    get NoOfNodes(): number {
        return this.nodes.length;
    }
}
