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

    public getFromNode() : WorldStateNode {
        return this.fromNode;
    }

    public getEndNode() : WorldStateNode {
        return this.endNode;
    }

    public getCost() : number {
        return this.cost;
    }

    public getCommand() : string {
        return this.command;
    }

    edgeToString() : string {
        return this.command;
    }
}