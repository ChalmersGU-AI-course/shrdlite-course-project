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

    equals(otherState : WorldState) : boolean {
        if (this.stacks.length != otherState.stacks.length) {
            return false;
        }

        for (var i = 0, l=this.stacks.length; i < l; i++) {
            for (var j = 0, k=this.stacks[i].length; j < k; j++) {
                if (this.stacks[i][j] !== otherState.stacks[i][j]) {
                    return false;
                }
            }
        }

        if (this.holding !== otherState.holding) {
            return false;
        }

        if (this.arm !== otherState.arm) {
            return false;
        }

        return true;
    }

    // This can perhaps be made smarter. Instead of moving one step at a time, we could reason about how objects can be moved.
    getNewStates() : WorldState[] {
        var newStates : WorldState[] = [];

        if (this.canMoveLeft()) {
            newStates.push(this.newWorldMoveLeft());
        }

        if (this.canMoveRight()) {
            newStates.push(this.newWorldMoveRight());
        }

        if (!this.isHolding()) {
            newStates.push(this.newWorldPick());
        } else if (this.canDrop()) {
            newStates.push(this.newWorldDrop());
        }

        return newStates;
    }

    objectsOnTop(obj : string) : number {
        if (obj == "floor") {
            return this.stacks[this.getLowestStackNumber()-1].length;
        } else {
            this.stacks.forEach((stack) => {
                var ix = stack.indexOf(obj);

                if (ix >= 0) {
                    return stack.length - 1 - ix;
                }
            });

            return -1;
        }
    }

    isOnTopOf(fstObj : string, sndObj : string) : boolean {
        var stackNumber = this.getStackNumber(fstObj);

        if (stackNumber == this.getStackNumber(sndObj)) {
            return 1 == this.stacks[stackNumber-1].indexOf(fstObj) - this.stacks[stackNumber-1].indexOf(sndObj);
        }

        return false;
    }

    isAbove(fstObj : string, sndObj : string) : boolean {
        var stackNumber = this.getStackNumber(fstObj);

        if (stackNumber == this.getStackNumber(sndObj)) {
            return this.stacks[stackNumber-1].indexOf(fstObj) > this.stacks[stackNumber-1].indexOf(sndObj);
        }

        return false;
    }

    isBeside(fstObj : string, sndObj : string) : boolean {
        return 1 == this.getDistance(fstObj,sndObj);
    }

    isLeftOf(fstObj : string, sndObj : string) : boolean {
        return this.getStackNumber(fstObj) < this.getStackNumber(sndObj);
    }

    isRightOf(fstObj : string, sndObj : string) : boolean {
        return this.isLeftOf(sndObj,fstObj);
    }

    getDistance(fstObj : string, sndObj : string) : number {
        return Math.abs(this.getStackNumber(fstObj) - this.getStackNumber(sndObj));
    }

    getStackNumber(obj : string) : number {
        if (obj == "floor") {
            return this.getLowestStackNumber();
        } else {
            var ix = 1;

            this.stacks.forEach((stack) => {
                if (stack.indexOf(obj) >= 0) {
                    return ix;
                }
                ix++;
            });

            return -1;
        }
    }

    getLowestStackNumber() : number {
        var min = 10000;
        var ix = 1;
        var minStack = ix;

        this.stacks.forEach((stack) => {
            if(stack.length < min) {
                min = stack.length;
                minStack = ix++;
            }
        });

        return minStack;
    }

    newWorldMoveLeft() : WorldState {
        return new WorldState(this.stacks, this.holding, this.arm-1, this.objects, this.examples);
    }

    newWorldMoveRight() : WorldState {
        return new WorldState(this.stacks, this.holding, this.arm+1, this.objects, this.examples);
    }

    newWorldDrop() : WorldState {
        var newStacks : string[][] = this.stacks;
        newStacks[this.arm].push(this.holding);

        return new WorldState(newStacks, null, this.arm, this.objects, this.examples);
    }

    newWorldPick() : WorldState {
        var newStacks : string[][] = this.stacks;
        var newHolding : string = newStacks[this.arm].pop();

        return new WorldState(newStacks, newHolding, this.arm, this.objects, this.examples);
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
            var topObj : ObjectDefinition = this.objects[topObjName];
            var currObj : ObjectDefinition = this.objects[this.holding];

            return currObj.canBePutOn(topObj);
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


    constructor(form:string, size:string, color:string) {
        this.form = form;
        this.size = size;
        this.color = color;
    }

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