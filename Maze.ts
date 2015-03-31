///<reference path="Graph.ts"/>
///<reference path="Random.ts"/>
///<reference path="lib/collections.ts"/>

class Maze {
    public constructor(private width: number, private height: number) {
        this.width = Math.max(width, 1);
        this.height = Math.max(height, 1);
    }

    public getEdges(seed: number): [number, number][][] {
        return this.generate(seed);
    }

    public getNodes(): GraphNode[] {
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

                var c: number = this.xy2node(x, y);
                edges[c] = new Array();

                if (y > 0)
                    edges[c].push([c, this.xy2node(x, y - 1), rnd.nextRange(1, 100)]);

                if (y < this.height - 1)
                    edges[c].push([c, this.xy2node(x, y + 1), rnd.nextRange(1, 100)]);

                if (x > 0)
                    edges[c].push([c, this.xy2node(x - 1, y), rnd.nextRange(1, 100)]);

                if (x < this.width - 1)
                    edges[c].push([c, this.xy2node(x + 1, y), rnd.nextRange(1, 100)]);
            }
        }

        return this.prim(edges, 0);
    }

    public xy2node(x: number, y: number): number {
        return y * this.width + x;
    }

    public node2xy(nodeNo: number): [number, number]{
        return [nodeNo % this.width, Math.floor(nodeNo / this.width)];
    }

    private prim(edges: [number, number, number][][], start: number): [number, number][][]{
        var found: boolean[] = new Array(edges.length);
        var parent: number[] = new Array(edges.length);
        var q = new collections.PriorityQueue<[number, number, number]>(
            function (a, b): number {
                return a[2] < b[2] ? 1 : -1;
            });

        for (var i = 0; i < found.length; ++i)
            found[i] = false;

        for (var i = 0; i < edges[start].length; ++i)
            var s = q.enqueue(edges[start][i]);



        while (!q.isEmpty()) {
            var u: [number, number, number] = q.dequeue(); // [0: from, 1: to, 2: cost]
            var from = u[0];
            var to = u[1];
            var cost = u[2];

            if (!found[to]) {
                found [to]= true;
                parent[to] = from;

                for (var i = 0; i < edges[to].length; ++i)
                    var s = q.enqueue(edges[to][i]);
            }
        }

        var p: [number, number][][] = new Array(parent.length);
        for (var i = 0; i < parent.length; ++i) {
            if (p[i] == undefined)
                p[i] = new Array();
            if (p[parent[i]] == undefined)
                p[parent[i]] = new Array();

            p[i].push([i, parent[i]]);
            p[parent[i]].push([parent[i], i]);
        }

        return p;
    }

}
