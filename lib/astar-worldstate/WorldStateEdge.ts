///<reference path="WorldStateNode.ts" />

class WorldStateEdge {
    private cost : number;
    private fromNode : WorldStateNode;
    private endNode : WorldStateNode;
    private command : string;

    /**
     * This class represents a change from one WorldState to a new state.
     * It is used as a component in the search graph for WorldStates.
     *
     * @param cost Defaulted to 1 in this sort of search problems, since we do not prioritize different moves.
     * @param fromNode The state before operation is performed.
     * @param toNode The state after operation is performed.
     * @param command The command that represents the move, which is the one sent back to Shrdlite.
     */
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
}