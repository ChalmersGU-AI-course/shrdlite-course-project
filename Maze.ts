///<reference path="Graph.ts"/>
///<reference path="Random.ts"/>
///<reference path="lib/collections.ts"/>

class Maze {
    private edges_: [number, number][][];
    private nodes_: GraphNode[];
    private width_: number;
    private height_: number;
    private gridsize: number;

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
                nodes[this.xy2node(x, y)] = { name: '(' + x.toString() + ',' + y.toString() + ')', x: x, y: y };

        return nodes;
    }

    public generateGraph(width: number, height: number, seed: number, balance: number): Graph {
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

        this.edges_ = this.primLike(edges, 0);
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

    private primLike(edges: [number, number, number][][], start: number): [number, number][][] {
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

        found[start] = true;
        parent[start] = undefined;

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

        //Pack all edges
        var edgePackage: [number, number][][] = new Array(parent.length);
        for (var i = 0; i < parent.length; ++i) {
            if (parent[i] != undefined) { //Should only be undefined for root in tree
                if (edgePackage[i] == undefined)
                    edgePackage[i] = new Array();
                if (edgePackage[parent[i]] == undefined)
                    edgePackage[parent[i]] = new Array();

                edgePackage[i].push([i, parent[i]]);
                edgePackage[parent[i]].push([parent[i], i]);
            }
        }

        return edgePackage;
    }

    public drawMaze(ctx: CanvasRenderingContext2D): void {
        var canvasWidth = ctx.canvas.width - 1; // canvas needs to be 1 bigger
        var canvasHeight = ctx.canvas.height - 1;

        ctx.clearRect(-1, -1, ctx.canvas.width, ctx.canvas.height);

        this.gridsize = Math.min(canvasWidth / this.width, canvasHeight / this.height);

        ctx.lineWidth = 0.5;
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "black";

        for (var x = 0; x <= this.width; ++x) {
            ctx.beginPath();
            ctx.moveTo(x * this.gridsize, 0);
            ctx.lineTo(x * this.gridsize, canvasHeight);
            ctx.stroke();
        }

        for (var y = 0; y <= this.height; ++y) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.gridsize);
            ctx.lineTo(canvasWidth, y * this.gridsize);
            ctx.stroke();
        }

        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;

        for (var x = 0; x < this.width; ++x) {
            for (var y = 0; y < this.height; ++y) {
                var nodeNo: number = this.xy2node(x, y);

                var n: [number, number][] = this.edges[nodeNo];
                for (var i = 0; i < n.length; ++i) {
                    var e = n[i];
                    var c = this.node2xy(e[1]);

                    if (c[0] > x) {
                        ctx.beginPath();
                        ctx.moveTo((x + 1) * this.gridsize, y * this.gridsize + 0.5);
                        ctx.lineTo((x + 1) * this.gridsize,(y + 1) * this.gridsize - 0.5);
                        ctx.stroke();
                    }
                    if (c[0] < x) {
                        ctx.beginPath();
                        ctx.moveTo(x * this.gridsize, y * this.gridsize + 0.5);
                        ctx.lineTo(x * this.gridsize,(y + 1) * this.gridsize - 0.5);
                        ctx.stroke();
                    }
                    if (c[1] < y) {
                        ctx.beginPath();
                        ctx.moveTo(x * this.gridsize + 0.5, y * this.gridsize);
                        ctx.lineTo((x + 1) * this.gridsize - 0.5, y * this.gridsize);
                        ctx.stroke();
                    }
                    if (c[1] > y) {
                        ctx.beginPath();
                        ctx.moveTo(x * this.gridsize + 0.5,(y + 1) * this.gridsize);
                        ctx.lineTo((x + 1) * this.gridsize - 0.5,(y + 1) * this.gridsize);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    public drawPath(ctx: CanvasRenderingContext2D, path: [number, number][]): void {

        if (path != undefined && path.length > 0) {
            var start = this.nodes[path[0][0]];



            var sx = start.x * this.gridsize + this.gridsize / 2;
            var sy = start.y * this.gridsize + this.gridsize / 2;

            ctx.beginPath();
            ctx.arc(sx, sy, this.gridsize / 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.lineWidth = 0;
            ctx.fill();


            ctx.lineWidth = 1;
            ctx.strokeStyle = "blue";

            ctx.beginPath();

            ctx.moveTo(sx, sy);

            for (var i = 0; i < path.length; ++i) {
                var n = this.nodes[path[i][1]];
                var nx = n.x * this.gridsize + this.gridsize / 2;
                var ny = n.y * this.gridsize + this.gridsize / 2;
                ctx.lineTo(nx, ny);
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(nx, ny, this.gridsize / 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.lineWidth = 0;
            ctx.fill();
        }
    }

    public coord2node(x: number, y: number): number {
        var n = this.xy2node(Math.floor(x / this.gridsize), Math.floor(y / this.gridsize));
        if (n < this.noOfNodes && n >= 0)
            return n;
        else
            return undefined;
    }
}
