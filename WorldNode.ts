///<reference path="WorldRules.ts"/>

//The node used in the A* algorithm for the WorldState
class WorldNode implements INode<WorldNode> {
    constructor(
        public State: WorldState
        ) {}
    
    //Returns all availble neighbours of this world state
    Neighbours() : Neighbour<WorldNode>[] {
        var neighbours: Neighbour<WorldNode>[] = [];

        if (this.CanDrop()) {
            neighbours.push(this.Drop());
        }

        if (this.CanPickUp()) {
            neighbours.push(this.PickUp());
        }

        if (this.CanGoLeft()) {
            neighbours.push(this.GoLeft());
        }

        if (this.CanGoRight()) {
            neighbours.push(this.GoRight());
        }
        return neighbours;
    }

    CanDrop(): boolean {
        if (!this.State.holding) {
            return false;
        }
        var topObject = getTopObjectInColumn(this.State.arm, this.State);
        var heldObject = this.State.objects[this.State.holding];
        return canPutObjectOntop(heldObject, topObject);
    }

    CanGoLeft(): boolean {
        return this.State.arm > 0;
    }

    CanGoRight(): boolean {
        return this.State.arm < this.State.stacks.length - 1;
    }

    CanPickUp(): boolean {
        if (this.State.holding) {
            return false;
        }
        var topObject = getTopObjectInColumn(this.State.arm, this.State);
        return (topObject != null);
    }

    //Returns anew worldnode where the drop action has been performed
    Drop(): Neighbour<WorldNode> {
        var newStacks = this.CopyStacks();
        newStacks[this.State.arm].push(this.State.holding);
        var newWorld = this.Copy(newStacks);
        newWorld.State.holding = null;
        return new Neighbour<WorldNode>(newWorld, 1, "d");
    }

    //Returns a new worldnode where the arm has moved one step to the left
    GoLeft(): Neighbour<WorldNode> {
        var newWorld = this.Copy(this.State.stacks);
        newWorld.State.arm -= 1;
        return new Neighbour<WorldNode>(newWorld, 1, "l");
    }

    //Returns a new worldnode where the arm has moved one stop to the right
    GoRight(): Neighbour<WorldNode> {
        var newWorld = this.Copy(this.State.stacks);
        newWorld.State.arm += 1;
        return new Neighbour<WorldNode>(newWorld, 1, "r");
    }

    //Returns a new worldnode where the pick up action has been performed
    PickUp(): Neighbour<WorldNode> {
        var newStacks = this.CopyStacks();
        var holding = newStacks[this.State.arm].pop();
        var newWorld = this.Copy(newStacks);
        newWorld.State.holding = holding;
        return new Neighbour<WorldNode>(newWorld, 1, "p");
    }

    //Returns a new copy of the stacks arrays
    CopyStacks(): string[][] {
        return this.State.stacks.map(function(stack) {
            return stack.slice();
            });
    }

    //Returns a new copy of the WorldNode, with the specified stacks
    Copy(stacks: string[][]): WorldNode {
        var state: WorldState = {
            stacks: stacks,
            holding: this.State.holding,
            arm: this.State.arm,
            objects: this.State.objects,
            examples: this.State.examples,
        };

        return new WorldNode(state);
    }
    
    //toString is used to determine wheter this node has been previously visisted in the A* implementation
    toString() : string {
        var stacksString = this.State.stacks.map(function(v) { return "[" + v.toString() + "]"});
        return stacksString + ";" + this.State.holding + ";" + this.State.arm;
    }
}