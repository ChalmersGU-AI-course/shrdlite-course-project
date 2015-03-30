///<reference path="Graph.ts"/>
///<reference path="Random.ts"/>
///<reference path="lib/collections.ts"/>

class Maze {
    constructor(private width: number, private height: number) {
        this.width = Math.max(width, 1);
        this.height = Math.max(height, 1);
    }

    getEdges(seed: number): [number, number][][] {
        return this.generate(seed);
    }

    getNodes(): GraphNode[] {
        var nodes: GraphNode[] = new Array(this.width * this.height);

        for (var x = 0; x < this.width; ++x)
            for (var y = 0; y < this.width; ++y)
                nodes.push({ name: x.toString() + y.toString(), x: x, y: x });

        return nodes;
    }

    private generate(seed: number) {
        //Create a grid graph with different random edge costs and then make it a MST
        var rnd = new Random(seed);

        var edges: [number, number, number][][];
        edges = new Array();

        for (var x = 0; x < this.width; ++x) {
            for (var y = 0; y < this.height; ++y) {

                var c: number = this.no(x, y);
                edges[c] = new Array();

                if (y > 0)
                    edges[c].push([c, this.no(x, y - 1), rnd.nextRange(1, 100)]);

                if (y < this.height - 1)
                    edges[c].push([c, this.no(x, y + 1), rnd.nextRange(1, 100)]);

                if (x > 0)
                    edges[c].push([c, this.no(x - 1, y), rnd.nextRange(1, 100)]);

                if (x < this.width - 1)
                    edges[c].push([c, this.no(x + 1, y), rnd.nextRange(1, 100)]);
            }
        }

        return this.prim(edges, 0);
    }

    private no(x: number, y: number): number {
        return y * this.width + x;
    }

    private prim(edges: [number, number, number][][], start: number): [number, number][][] {
        var best_cost: number[] = new Array(edges.length);
        var parent: number[] = new Array(edges.length);
        var q = new collections.PriorityQueue<[number, number, number]>(
            function (a, b): number {
                return a[2] < b[2] ? 1 : -1;
            });


        for (var i = 0; i < best_cost.length; ++i) {
            best_cost[i] = Number.POSITIVE_INFINITY;

            for (var j = 0; j < edges[i].length; ++j)
                var s = q.enqueue(edges[i][j]);
        }

        while (!q.isEmpty()) {
            var u: [number, number, number] = q.dequeue();
            var from = u[0];
            var to = u[1];
            var cost = u[2];

            if (cost < best_cost[to]) { // [0: from, 1: to, 2: cost]
                best_cost[to] = cost;
                parent[to] = from;
            }
        }

        var p: [number, number][][] = new Array(parent.length);
        for (var i = 0; i < parent.length; ++i) {
            p.push([[parent[i], i], [i, parent[i]]]);
        }

        return p;
    }

}
