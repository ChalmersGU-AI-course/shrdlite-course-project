///<reference path="lib/collections.ts"/>

/**
 * @interface represent a node in the graph
 */
interface GraphNode {
    name: string;
    costTo(to: GraphNode): number;
}

/**
 * @class represent a Node which have euclidean coordinates
 */
class PointNode implements GraphNode {
    public constructor(public name: string, public x: number, public y: number) {
    }

    costTo(to: PointNode): number {
        return Math.sqrt((this.x - to.x) * (this.x - to.x) + (this.y - to.y) * (this.y - to.y));
    }
}

/**
 * @class represent a G(v,E)
 */
class Graph<T extends GraphNode> {
    nodes: GraphNode[];
    edges: [number, number][][]; //A list of tuples for every node

    /*
    * Creates an instance of Graph
    * @constructor
    */
    public constructor(nodes: GraphNode[], edges: [number, number][][]) {
        this.nodes = nodes;
        this.edges = edges;
    }

    /**
    * Find shortest path
    * 
    * @method findPath
    * @param {number} start The node you start from
    * @param {number} goal The node you want to find the path to
    * @return [number, number][] List of edges which creates the shortest path between start and goal. Returns undefined if no path was found and an empty set [] if start is goal
    */
    public findPath(start: number, goal: number): [number, number][] //Returns a list of edges
    {
        if (start > this.nodes.length || start < 0 || goal > this.nodes.length || goal < 0)
            throw new RangeError("Node does not exist");

        var cameFrom: number[] = []; //matris typ

        var openset = new collections.Set<number>();

        var fScore = new collections.PriorityQueue<{ node: number; cost: number }>(function (a, b): number {
            return a.cost < b.cost ? 1 : -1;
        });

        var closedset = new collections.Set<number>();

        var gScore = []; //could maybe use = new int[f_score.length] for pre allocation
        for (var i = 0; i < this.nodes.length; ++i)
            gScore[i] = 0;

        openset.add(start);
        fScore.enqueue({ node: start, cost: gScore[start] + this.heuristicCost(start, goal) });

        while (!openset.isEmpty()) {
            var current = fScore.dequeue().node;

            if (current == goal) {
                var path: [number, number][] = [];
                var cur = goal;
                while (cur != start) {
                    path.push([cameFrom[cur], cur]);
                    cur = cameFrom[cur];
                }

                //Reverse
                var pathI = [];
                for (var i = 0; i < path.length; ++i) {
                    pathI[i] = path[path.length - 1 - i];
                }

                return pathI;
            }

            //find current in openset and remove that element and add to closed
            closedset.add(current);
            openset.remove(current);
            var currentEdges = this.edgesFor(current);

            for (var i = 0; i < currentEdges.length; ++i) {

                if (closedset.contains(currentEdges[i][1]))
                    continue;

                var edge_between_cost = this.nodes[current].costTo(this.nodes[currentEdges[0][1]]);
                var tentativeGScore = gScore[current] + edge_between_cost;

                if (!openset.contains(currentEdges[i][1]) || tentativeGScore < gScore[currentEdges[i][1]]) {
                    cameFrom[currentEdges[i][1]] = current;
                    gScore[currentEdges[i][1]] = tentativeGScore;

                    fScore.enqueue({node: currentEdges[i][1], cost: gScore[currentEdges[i][1]] + this.heuristicCost(currentEdges[i][1], goal)});

                    if (!openset.contains(currentEdges[i][1]))
                        openset.add(currentEdges[i][1]);
                }
            }
        }

        return undefined; //No path was found
    }

    /**
    * Get a minimum cost between to nodes
    *
    * @param {number} current From this node
    * @param {number} goal To thi snode
    * @return {number} A minimum cost for traveling between the nodes
    */
    private heuristicCost(current: number, goal: number): number {
        return this.nodes[current].costTo(this.nodes[goal]);
    }

    /**
    * Get all edges for a node
    *
    * @param {number} node The node you want the neighbours of
    * @return {[number, number][]} A list of edges
    */
    private edgesFor(node: number): [number, number][] {
        if (node < 0 || node >= this.nodes.length)
            throw new RangeError("Node does not exist");

        return this.edges[node];
    }

    /**
    * Get number of nodes in the graph
    */
    public get Size(): number {
        return this.nodes.length;
    }
}
