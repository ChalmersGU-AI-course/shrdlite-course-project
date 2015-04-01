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

        var came_from: number[] = []; //matris typ

        var openset = new collections.Set<number>();
        openset.add(start);

        var closedset = new collections.Set<number>();

        //can't get stl to work
        //var f_score: minheap = new MinHeap();
        var f_score = [];

        //fill array with -1 to indicate nodes not yet calculated
        for (var i = 0; i < this.nodes.length; ++i)
            f_score[i] = -1;

        var g_score = []; //could maybe use = new int[f_score.length] for pre allocation
        for (var i = 0; i < this.nodes.length; ++i)
            g_score[i] = 0;


        f_score[start] = g_score[start] + this.heuristicCost(start, goal);

        while (!openset.isEmpty()) {
            //var current: number = this.indexOfSmallest(f_score);//hitta elementet med lägst värde i f_score, sätt current till dess index
            var current: number = this.indexOfSmallestRestricted(f_score, openset.toArray());
            console.log("current: ", current);

            if (current == goal) {
                var path = [];//: [][number, number];
                var cur = goal;
                while (cur != start) {
                    path.push([came_from[cur], cur]);
                    cur = came_from[cur];
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
                    came_from[current_neighbours[i][1]] = current;
                    g_score[current_neighbours[i][1]] = tentative_g_score;
                    f_score[current_neighbours[i][1]] = g_score[current_neighbours[i][1]] + this.heuristicCost(current_neighbours[i][1], goal);

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

    //returns index of smallest non negative element
    indexOfSmallest(arr: number[]) {
        var lowest = 0;
        for (var i = 1; i < arr.length; ++i) {
            if ((arr[i] <= arr[lowest] && arr[i] >= 0) || (arr[i] >= 0 && arr[lowest] == -1)) lowest = i;
        }
        return lowest;
    }

    indexOfSmallestRestricted(arr: number[], oset: number[]) {
        var lowest = oset[0];
        var index = oset[0];

        for (var i = 0; i < oset.length; ++i) {
            index = oset[i];
            if ((arr[index] <= arr[lowest] && arr[index] >= 0) || (arr[index] >= 0 && arr[lowest] == -1)) lowest = index;
        }
        return lowest;
    }
    
    //returns -1 if value not in arr
    find(arr: number[], value: number) {
        var index = -1;
        for (var i = 0; i < arr.length; ++i) {
            if (arr[i] == value) index = i;
        }
        return index;
    }

    get NoOfNodes(): number {
        return this.nodes.length;
    }
}
