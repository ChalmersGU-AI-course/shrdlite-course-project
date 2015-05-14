interface GraphNode {
    getId() : number;
    equals(otherNode : GraphNode) : boolean;
    distanceTo(to : GraphNode) : number;
    toString() : string;
    getNeighbors() : GraphNode[];
}