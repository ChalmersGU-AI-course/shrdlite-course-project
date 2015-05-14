class Edge<T extends GraphNode> {
    private cost : number;
    private fromNode : T;
    private endNode : T;

    constructor(cost : number, fromNode : T, toNode : T) {
        this.cost = cost;
        this.fromNode = fromNode;
        this.endNode = toNode;
    }

    getFromNode() : T {
        return this.fromNode;
    }

    getEndNode() : T {
        return this.endNode;
    }

    getCost() : number {
        return this.cost;
    }

    edgeToString() : string {
        var from = this.fromNode.toString();
        var to = this.endNode.toString();
        //var fromNodeX = this.fromNode.getX();
        //var fromNodeY = this.fromNode.getY();
        //var endNodeX  = this.endNode.getX();
        //var endNodeY  = this.endNode.getY();
        return from + " " + to;
//		if(fromNodeX < endNodeX) {
//			return fromNodeX + fromNodeY + " " + endNodeX + endNodeY;
//		} else {
//			return endNodeX + endNodeY + " " + fromNodeX + fromNodeY;
//		}
    }
}