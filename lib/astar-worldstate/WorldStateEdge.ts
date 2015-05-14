///<reference path="WorldStateNode.ts" />

class WorldStateEdge {
    private cost : number;
    private fromNode : WorldStateNode;
    private endNode : WorldStateNode;
    private command : string;

    constructor(cost : number, fromNode : WorldStateNode, toNode : WorldStateNode, command : string) {
        this.cost = cost;
        this.fromNode = fromNode;
        this.endNode = toNode;
        this.command = command;
    }

    getFromNode() : WorldStateNode {
        return this.fromNode;
    }

    getEndNode() : WorldStateNode {
        return this.endNode;
    }

    getCost() : number {
        return this.cost;
    }

    getCommand() : string {
        return this.command;
    }

    edgeToString() : string {
        return this.command;
    }
}