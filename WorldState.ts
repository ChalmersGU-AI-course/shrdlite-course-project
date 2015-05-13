class WorldState {
    stacks: string[][];
    holding: string;
    arm: number;
    objects: { [s:string]: ObjectDefinition; };
    examples: string[];

    constructor(stacks:string[][], holding:string, arm:number, objects:{[s:string] : ObjectDefinition}, examples:string[]) {
        this.stacks = stacks;
        this.holding = holding;
        this.arm = arm;
        this.objects = objects;
        this.examples = examples;
    }

    getNewStates() : WorldState[] {
        var newStates : WorldState[] = [];


    }

    canMoveLeft() : boolean {
        return this.arm != 0;
    }

    canMoveRight() : boolean {
        return this.arm != this.stacks.length-1;
    }

    canDrop() : boolean {
        var stackHeight : number = this.stacks[this.arm].length;

        if (!this.isHolding()) {
            return false;
        } else if (stackHeight == 0) {
            return true;
        } else {
            var topObjName : string = this.stacks[this.arm][stackHeight-1];
            // var topObj : ObjectDefinition = this.objects  (retrieve the values with keys 'topObjName' and 'holding')
        }
    }

    isHolding() : boolean {
        return this.arm != null;
    }
}

class ObjectDefinition {
    form: string;
    size: string;
    color: string;

    // The floor is not an object, so this function does not care about it.
    canBePutOn(otherObj : ObjectDefinition) : boolean {
        if (!this.largerThan(otherObj) || otherObj.form == "ball") { // smaller objects cannot support larger objects
                                                                     // and balls cannot support anything

            if (this.form == "ball") { // balls must be in boxes
                return otherObj.form == "box";

            } else if (otherObj.form == "box") { // boxes cannot contain pyramids, planks or boxes of the same size.
                return this.form == "brick"
                    || this.form == "ball"
                    || this.form == "table"
                    || (this.form == "box" && this.smallerThan(otherObj));

            } else if (this.form == "box" && this.size == "small") {              // small boxes cannot be supported by
                return !(otherObj.form == "brick" && otherObj.size == "small"     // small bricks or
                      || otherObj.form == "pyramid");                             // pyramids

            } else if (this.form == "box" && this.size == "large") {              // large boxes cannot be supported by
                return !(otherObj.form == "pyramid" && otherObj.size == "large"); // large pyramids
            }
        }

        return false;
    }

    largerThan(otherObj : ObjectDefinition) : boolean {
        return this.size == "large" && otherObj.size == "small";
    }

    smallerThan(otherObj : ObjectDefinition) : boolean {
        return this.size == "small" && otherObj.size == "large";
    }
}