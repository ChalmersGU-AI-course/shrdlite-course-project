///<reference path="collections.ts"/>
module Graph {

export interface Edge{
    from : string;
    to   : string;
    cost : number;
}

export interface Coor{
    posX : number;
    posY : number;
}

//vertex class contains information Node 
export class Vertex {

    private vertexId : string;
    private edgeList : Array<Edge>;
    private costFromStart : number;
    private costToGoal : number;
    private parent   : Vertex;
    private coord : Coor;

    constructor(v : string, es : Array<Edge>,g : number, h : number,c : Coor) {
        this.vertexId = v;
        this.edgeList = es;
        this.costFromStart = g;
        this.costToGoal = h;
        this.coord = c;
    }

    //return id of the node
    getVertexId() : string {
        return this.vertexId;
    }


    //return edges
    getEdges() : Array<Edge> {
        return this.edgeList;
    }

    //return specific coordinate of that node
    getCoor() : Coor {
        return this.coord;
    }

    //return F value (g + h)
    getF() : number {
        return this.costFromStart + this.costToGoal;
    }

    //return G value (costFromStart)
    getG() : number {
        return this.costFromStart;
    }

    //return H value (costToGoal)
    getH() : number {
        return this.costToGoal;
    }

    //set new G (costFromStart)
    setG( g : number) {
        this.costFromStart = g;
    }

    //set new H (costToGoal)
    setH( h : number) {
        this.costToGoal = h;
    }


    //set paraent of current node (to trace back the result after we found goal)
    setParent(p : Vertex){
        this.parent = p;
    }

    //return parent of node
    getParent() : Vertex {
        return this.parent;
    }


}


//graph class contains a dictionary of Vertex (optimized for running time) 
export class Graph {

    private vertices : collections.Dictionary<string,Vertex>;
    private isEnabledGrid : boolean;

    constructor() {
        this.vertices = new collections.Dictionary<string,Vertex>();
        this.isEnabledGrid = false;
    }

    //enable special grid represenation to easier for user to construct graph
    getEnabledGrid(): boolean{
        return this.isEnabledGrid;
    }


    //add vertex to graph
    addVertex( v : string , es : Array<Edge>, h : number){
        var coor = {posX:0,posY:0};
        this.vertices.setValue(v, new Vertex(v,es,0,h,coor));
    }

    //add grid to graph ()
    addVertexGrid( v : string, es : Array<Edge>, h : number,c : Coor){
        this.vertices.setValue(v, new Vertex(v,es,0,h,c));
    }

    //return a vertex from a dictionary 
    getVertex( key : string) : Vertex {
        return this.vertices.getValue(key);
    }


    //helper function to let user input grid and this will convert it into graph
    addGrid(d : number[][]){
        this.isEnabledGrid = true;

        for (var i = 0; i < d.length; i++) {
             for (var j = 0; j < d[i].length; j++) {
                    var vtxId = this.genNodeName(i,j);
                    var coor = {posX:i,posY:j};
                    this.addVertexGrid(vtxId,this.genEdges(i,j,d),0,coor);
             }
        }
    
    }


    //generate adjacent nodes
    genEdges(x : number, y : number, d : number[][]) : Array<Edge>{
        var edges = new collections.LinkedList<Edge>();
        var fromId = this.genNodeName(x,y);
    
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
        if(this.checkInBound(x-1,y,d)){
            if(d[x-1][y] == 1){
                var toN = this.genNodeName(x-1,y);
                var edge = {from:fromId,to:toN,cost:1}
                edges.add(edge);
            }
        }

        //middle-left
        if(this.checkInBound(x,y-1,d)){
            if(d[x][y-1] == 1){
                var toN = this.genNodeName(x,y-1);
                var edge = {from:fromId,to:toN,cost:1}
                edges.add(edge);
            }
        }
        //middle-right
        if(this.checkInBound(x,y+1,d)){
            if(d[x][y+1] == 1){
                var toN = this.genNodeName(x,y+1);
                var edge = {from:fromId,to:toN,cost:1}
                edges.add(edge);
            }
        }

        //btm-middle
        if(this.checkInBound(x+1,y,d)){
            if(d[x+1][y] == 1){
                var toN = this.genNodeName(x+1,y);
                var edge = {from:fromId,to:toN,cost:1}
                edges.add(edge);
            }
        }

        return edges.toArray();
    }

    //check array out of bound
    checkInBound(x : number, y :number, d :number[][]) : boolean{
        if(x < 0 || x >= d.length){
            return false;
        }
        if(y < 0 || y >= d[x].length){
            return false;
        }
        return true;
    }

    //generate vertex id for example (0,0) => A0 , (2,1) => C1
    genNodeName(x : number, y : number) : string {
        var chr = String.fromCharCode(65 + x);
        return chr + y.toString();
    }

    //return adjacent nodes
    getAdjacent( key : string) : collections.LinkedList<Vertex>{
        var vtx = this.getVertex(key);
        var edges = vtx.getEdges();
        var list = new collections.LinkedList<Vertex>();

        for (var i = 0; i < edges.length; i++) {
            if(edges[i].from == key){
                var adj = this.getVertex(edges[i].to);
                list.add(adj);          
            }
        }

        return list;
    }

    //return edge's cost
    getCostG(from : string, to : string) : number {
        var vtx = this.getVertex(from);
        var edges = vtx.getEdges();

        for (var i = 0; i < edges.length; i++) {
            if(edges[i].from == from && edges[i].to == to){
                return edges[i].cost;
            }
        }
        return 1;

    }


}

}

