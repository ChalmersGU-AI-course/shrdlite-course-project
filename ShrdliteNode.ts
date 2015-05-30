///<reference path="Graph.ts"/>
///<reference path="World.ts"/>

class ShrdliteNode implements GraphNode<number> {
    public name: string;
    public updateName() {
        this.name = this.toString();
    }
    private objects: { [s: string]: ObjectDefinition; };

    public constructor(public state: WorldState) {
        this.name = this.toString();
    }


    costTo(to: ShrdliteNode): number {
        var from_row = Math.floor(this.state.arm / this.state.rowLength);
        var to_row = Math.floor(to.state.arm / this.state.rowLength);
        var from_col = this.state.arm % this.state.rowLength;
        var to_col = to.state.arm % this.state.rowLength;

        return (Math.abs(from_col - to_col) + Math.abs(from_row - to_row) + 1);
    }

    neighbours(): { node: ShrdliteNode; edge: number }[] {
        var path: Array<{ node: ShrdliteNode; edge: number }> = [];

        //take up object
        if (this.state.holding == null) {

            for (var i = 0; i < this.state.stacks.length; ++i)
                if (this.state.stacks[i].length > 0) {
                    var newNode = new ShrdliteNode(this.cloneOfWorld());
                    newNode.state.arm = i;
                    newNode.state.holding = newNode.state.stacks[i].pop();
                    newNode.updateName(); //Overhead but nice anyway
                    path.push({ node: newNode, edge: i });
                }
        }
        else {
            //put down object
            for (var i = 0; i < this.state.stacks.length; ++i) {
                if (this.isPhysicallyPossible(i)) {
                    var newNode = new ShrdliteNode(this.cloneOfWorld());
                    newNode.state.arm = i;
                    newNode.state.stacks[i].push(newNode.state.holding);
                    newNode.state.holding = null;
                    newNode.updateName(); //Overhead but nice anyway
                    path.push({ node: newNode, edge: i });
                }
            }
        }
        return path;
    }

    isPhysicallyPossible(n: number): boolean {
        //which object is on top?
        var topPos: number = this.state.stacks[n].length - 1;

        //destination object
        var dest;
        if (topPos >= 0) { //there is actually an object on this stack
            dest = this.state.objects[this.state.stacks[n][topPos]];
        } else { //otherwise use the floor object
            dest = this.state.objects["floor"];
        }

        //origin object from the crane
        var orig = this.state.objects[this.state.holding];

        //Balls must be in boxes or on the floor.
        if (orig.form == "ball" && dest.form != "floor" && dest.form != "box") {
            return false;
        }

        //Large boxes cannot be supported by large pyramids.
        if ((orig.size == "large" && orig.form == "box") && (dest.size == "large" && dest.form == "pyramid")) {
            return false;
        }

        //Small boxes cannot be supported by small bricks or pyramids.
        if ((orig.size == "small" && orig.form == "box") && (dest.size == "small" && (dest.form == "pyramid" || dest.form == "brick"))) {
            return false;
        }

        //Boxes cannot contain pyramids, planks or boxes of the same size.
        if ((orig.form == "pyramid" || orig.form == "box" || orig.form == "plank") && (orig.size == dest.size) && (dest.form == "box")) {
            return false;
        }

        //Balls cannot support other objects.
        if (dest.form == "ball") {
            return false;
        }

        //Small objects cannot support large objects.
        if (orig.size == "large" && dest.size == "small") {
            return false;
        }

        return true;
    }

    toString(): string {
        var str: string = "S:";
        for (var i = 0; i < this.state.stacks.length; ++i) {
            for (var j = 0; j < this.state.stacks[i].length; ++j) {
                str += this.state.stacks[i][j] + ",";
            }
            str += ";"
        }
        str += ";H:" + this.state.holding + ";";

        return str;
    }

    private cloneOfWorld(): WorldState {
        var stackcopy: string[][] = [];

        for (var i = 0; i < this.state.stacks.length; ++i) {
            stackcopy[i] = [];
            for (var j = 0; j < this.state.stacks[i].length; ++j)
                stackcopy[i][j] = this.state.stacks[i][j];
        }

        return { arm: this.state.arm, examples: this.state.examples, holding: this.state.holding, objects: this.state.objects, stacks: stackcopy, rowLength: this.state.rowLength };
    }
}
