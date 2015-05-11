///<reference path="collections.ts"/>
var Graph;
(function (_Graph) {
    //vertex class contains information Node 
    var Vertex = (function () {
        function Vertex(v, es, g, h, c) {
            this.vertexId = v;
            this.edgeList = es;
            this.costFromStart = g;
            this.costToGoal = h;
            this.coord = c;
        }
        //return id of the node
        Vertex.prototype.getVertexId = function () {
            return this.vertexId;
        };
        //return edges
        Vertex.prototype.getEdges = function () {
            return this.edgeList;
        };
        //return specific coordinate of that node
        Vertex.prototype.getCoor = function () {
            return this.coord;
        };
        //return F value (g + h)
        Vertex.prototype.getF = function () {
            return this.costFromStart + this.costToGoal;
        };
        //return G value (costFromStart)
        Vertex.prototype.getG = function () {
            return this.costFromStart;
        };
        //return H value (costToGoal)
        Vertex.prototype.getH = function () {
            return this.costToGoal;
        };
        //set new G (costFromStart)
        Vertex.prototype.setG = function (g) {
            this.costFromStart = g;
        };
        //set new H (costToGoal)
        Vertex.prototype.setH = function (h) {
            this.costToGoal = h;
        };
        //set paraent of current node (to trace back the result after we found goal)
        Vertex.prototype.setParent = function (p) {
            this.parent = p;
        };
        //return parent of node
        Vertex.prototype.getParent = function () {
            return this.parent;
        };
        return Vertex;
    })();
    _Graph.Vertex = Vertex;
    //graph class contains a dictionary of Vertex (optimized for running time) 
    var Graph = (function () {
        function Graph() {
            this.vertices = new collections.Dictionary();
            this.isEnabledGrid = false;
        }
        //enable special grid represenation to easier for user to construct graph
        Graph.prototype.getEnabledGrid = function () {
            return this.isEnabledGrid;
        };
        //add vertex to graph
        Graph.prototype.addVertex = function (v, es, h) {
            var coor = { posX: 0, posY: 0 };
            this.vertices.setValue(v, new Vertex(v, es, 0, h, coor));
        };
        //add grid to graph ()
        Graph.prototype.addVertexGrid = function (v, es, h, c) {
            this.vertices.setValue(v, new Vertex(v, es, 0, h, c));
        };
        //return a vertex from a dictionary 
        Graph.prototype.getVertex = function (key) {
            return this.vertices.getValue(key);
        };
        //helper function to let user input grid and this will convert it into graph
        Graph.prototype.addGrid = function (d) {
            this.isEnabledGrid = true;
            for (var i = 0; i < d.length; i++) {
                for (var j = 0; j < d[i].length; j++) {
                    var vtxId = this.genNodeName(i, j);
                    var coor = { posX: i, posY: j };
                    this.addVertexGrid(vtxId, this.genEdges(i, j, d), 0, coor);
                }
            }
        };
        //generate adjacent nodes
        Graph.prototype.genEdges = function (x, y, d) {
            var edges = new collections.LinkedList();
            var fromId = this.genNodeName(x, y);
            // commented out ,dont sure we need this in future for diagonal adjacent
            // // top-left
            // if(this.checkInBound(x-1,y-1,d)){
            //     if(d[x-1][y-1] == 1){
            //         var toN = this.genNodeName(x-1,y-1);
            //         var edge = {from:fromId,to:toN,cost:1}
            //         edges.add(edge);
            //     }
            // }
            // //top-right
            // if(this.checkInBound(x-1,y+1,d)){
            //     if(d[x-1][y+1] == 1){
            //         var toN = this.genNodeName(x-1,y+1);
            //         var edge = {from:fromId,to:toN,cost:1}
            //         edges.add(edge);
            //     }
            // }
            // //btm-left
            // if(this.checkInBound(x+1,y-1,d)){
            //     if(d[x+1][y-1] == 1){
            //         var toN = this.genNodeName(x+1,y-1);
            //         var edge = {from:fromId,to:toN,cost:1}
            //         edges.add(edge);
            //     }
            // }
            // //btm-right
            // if(this.checkInBound(x+1,y+1,d)){
            //     if(d[x+1][y+1] == 1){
            //         var toN = this.genNodeName(x+1,y+1);
            //         var edge = {from:fromId,to:toN,cost:1}
            //         edges.add(edge);
            //     }
            // }
            //top-middle
            if (this.checkInBound(x - 1, y, d)) {
                if (d[x - 1][y] == 1) {
                    var toN = this.genNodeName(x - 1, y);
                    var edge = { from: fromId, to: toN, cost: 1 };
                    edges.add(edge);
                }
            }
            //middle-left
            if (this.checkInBound(x, y - 1, d)) {
                if (d[x][y - 1] == 1) {
                    var toN = this.genNodeName(x, y - 1);
                    var edge = { from: fromId, to: toN, cost: 1 };
                    edges.add(edge);
                }
            }
            //middle-right
            if (this.checkInBound(x, y + 1, d)) {
                if (d[x][y + 1] == 1) {
                    var toN = this.genNodeName(x, y + 1);
                    var edge = { from: fromId, to: toN, cost: 1 };
                    edges.add(edge);
                }
            }
            //btm-middle
            if (this.checkInBound(x + 1, y, d)) {
                if (d[x + 1][y] == 1) {
                    var toN = this.genNodeName(x + 1, y);
                    var edge = { from: fromId, to: toN, cost: 1 };
                    edges.add(edge);
                }
            }
            return edges.toArray();
        };
        //check array out of bound
        Graph.prototype.checkInBound = function (x, y, d) {
            if (x < 0 || x >= d.length) {
                return false;
            }
            if (y < 0 || y >= d[x].length) {
                return false;
            }
            return true;
        };
        //generate vertex id for example (0,0) => A0 , (2,1) => C1
        Graph.prototype.genNodeName = function (x, y) {
            var chr = String.fromCharCode(65 + x);
            return chr + y.toString();
        };
        //return adjacent nodes
        Graph.prototype.getAdjacent = function (key) {
            var vtx = this.getVertex(key);
            var edges = vtx.getEdges();
            var list = new collections.LinkedList();
            for (var i = 0; i < edges.length; i++) {
                if (edges[i].from == key) {
                    var adj = this.getVertex(edges[i].to);
                    list.add(adj);
                }
            }
            return list;
        };
        //return edge's cost
        Graph.prototype.getCostG = function (from, to) {
            var vtx = this.getVertex(from);
            var edges = vtx.getEdges();
            for (var i = 0; i < edges.length; i++) {
                if (edges[i].from == from && edges[i].to == to) {
                    return edges[i].cost;
                }
            }
            return 1;
        };
        return Graph;
    })();
    _Graph.Graph = Graph;
})(Graph || (Graph = {}));
