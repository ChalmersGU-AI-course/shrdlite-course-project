///<reference path="Graph.ts"/>
///<reference path="Random.ts"/>
///<reference path="lib/collections.ts"/>

class Maze {
    private edges_: [number, number][][];
    private nodes_: GraphNode[];
    private width_: number;
    private height_: number;
    private gridsize: number;

    public constructor() {
    }

    public get width() {
        return this.width_;
    }

    public set width(val: number) {
        this.width_ = Math.max(val, 1);
    }

    public get height() {
        return this.height_;
    }

    public set height(val: number) {
        this.height_ = Math.max(val, 1);
    }

    public get nodes(): GraphNode[] {
        return this.nodes_;
    }

    public get edges(): [number, number][][] {
        return this.edges_;
    }

    private genNodes(): GraphNode[] {
        var nodes: GraphNode[] = new Array(this.width * this.height_);

        for (var y = 0; y < this.height_; ++y)
            for (var x = 0; x < this.width; ++x)
                nodes[this.xy2node(x, y)] = { name: x.toString() + y.toString(), x: x, y: y };

        return nodes;
    }

    public generateGraph(width: number, height: number, seed: number, balance: number) {
        this.width = width;
        this.height = height;

        //Create a grid graph with different random edge costs and then make it MST-like
        var rnd = new Random(seed);

        var xstrength = balance * 100 - 1;
        var ystrength = 100 - xstrength;

        var edges: [number, number, number][][];
        edges = new Array(this.noOfNodes);

        for (var x = 0; x < this.width; ++x) {
            for (var y = 0; y < this.height_; ++y) {

                var c: number = this.xy2node(x, y);
                edges[c] = new Array();

                if (y > 0)
                    edges[c].push([c, this.xy2node(x, y - 1), rnd.nextRange(1, ystrength)]);

                if (y < this.height_ - 1)
                    edges[c].push([c, this.xy2node(x, y + 1), rnd.nextRange(1, ystrength)]);

                if (x > 0)
                    edges[c].push([c, this.xy2node(x - 1, y), rnd.nextRange(1, xstrength)]);

                if (x < this.width - 1)
                    edges[c].push([c, this.xy2node(x + 1, y), rnd.nextRange(1, xstrength)]);
            }
        }

        this.edges_ = this.prim(edges, 0);
        this.nodes_ = this.genNodes();

        return new Graph(this.nodes_, this.edges_);
    }

    public xy2node(x: number, y: number): number {
        return y * this.width + x;
    }

    public node2xy(nodeNo: number): [number, number] {
        return [nodeNo % this.width, Math.floor(nodeNo / this.width)];
    }

    private get noOfNodes(): number {
        return this.width * this.height;
    }

    private prim(edges: [number, number, number][][], start: number): [number, number][][] {
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
                found[to] = true;
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

    public drawMaze(ctx: CanvasRenderingContext2D): void {
        var canvasWidth = ctx.canvas.width - 1; // canvas needs to be 1 bigger
        var canvasHeight = ctx.canvas.height - 1;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.gridsize = Math.min(canvasWidth / this.width, canvasHeight / this.height); 

        ctx.lineWidth = 1;
        ctx.shadowBlur = 1;

        ctx.strokeStyle = "black";

        for (var x = 0; x <= this.width; ++x) {
            ctx.beginPath();
            ctx.moveTo(x * this.gridsize + 0.5, 0.5);
            ctx.lineTo(x * this.gridsize + 0.5, canvasHeight + 0.5);
            ctx.stroke();
        }

        for (var y = 0; y <= this.height; ++y) {
            ctx.beginPath();
            ctx.moveTo(0.5, y * this.gridsize + 0.5);
            ctx.lineTo(canvasWidth + 0.5, y * this.gridsize + 0.5);
            ctx.stroke();
        }

        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        for (var x = 0; x < this.width; ++x) {
            for (var y = 0; y < this.height; ++y) {
                var nodeNo: number = this.xy2node(x, y);

                var n: [number, number][] = this.edges[nodeNo];
                for (var i = 0; i < n.length; ++i) {
                    var e = n[i];
                    var c = this.node2xy(e[1]);

                    if (c[0] > x) {
                        ctx.beginPath();
                        ctx.moveTo((x + 1) * this.gridsize + 0.5, y * this.gridsize + 1 + 0.5);
                        ctx.lineTo((x + 1) * this.gridsize + 0.5,(y + 1) * this.gridsize - 1 + 0.5);
                        ctx.stroke();
                    }
                    if (c[0] < x) {
                        ctx.beginPath();
                        ctx.moveTo(x * this.gridsize + 0.5, y * this.gridsize + 1 + 0.5);
                        ctx.lineTo(x * this.gridsize + 0.5,(y + 1) * this.gridsize - 1 + 0.5);
                        ctx.stroke();
                    }
                    if (c[1] < y) {
                        ctx.beginPath();
                        ctx.moveTo(x * this.gridsize + 1 + 0.5, y * this.gridsize + 0.5);
                        ctx.lineTo((x + 1) * this.gridsize - 1 + 0.5, y * this.gridsize + 0.5);
                        ctx.stroke();
                    }
                    if (c[1] > y) {
                        ctx.beginPath();
                        ctx.moveTo(x * this.gridsize + 1 + 0.5,(y + 1) * this.gridsize + 0.5);
                        ctx.lineTo((x + 1) * this.gridsize - 1 + 0.5,(y + 1) * this.gridsize + 0.5);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    public drawPath(ctx: CanvasRenderingContext2D, path: [number, number][]): void {
        var start = this.nodes[path[0][0]];

        ctx.lineWidth = 1;
        ctx.strokeStyle = "blue";

        ctx.beginPath();
        ctx.moveTo(start.x * this.gridsize + 0.5 + this.gridsize / 2, start.y * this.gridsize + 0.5 + this.gridsize / 2);

        for (var i = 0; i < path.length; ++i) {
            var n = this.nodes[path[i][1]];
            ctx.lineTo(n.x * this.gridsize + 0.5 + this.gridsize / 2, n.y * this.gridsize + 0.5 + this.gridsize / 2);
        }
        ctx.stroke();
    }
}
