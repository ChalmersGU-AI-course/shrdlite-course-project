/// <reference path="lib/typescript-collections/collections.ts" />
/// <reference path="ObjectDefinition.ts" />
/// <reference path="Interpreter.ts" />

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

    toString() : string {
        return this.stacks.toString() + this.arm.toString() + this.isHolding().toString();
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

    satisifiesConditions(conditions : Interpreter.Literal[]) : boolean {
        var result = true;

        conditions.forEach((goal) => {
            var fstObj = goal.args[0];
            var sndObj = goal.args[1];

            switch (goal.rel) {
                case "ontop":
                case "inside":
                    result = result && this.isOnTopOf(fstObj,sndObj);
                    break;
                case "above":
                    result = result && this.isAbove(fstObj,sndObj);
                    break;
                case "under":
                    result = result && this.isAbove(sndObj,fstObj);
                    break;
                case "beside":
                    result = result && this.isBeside(fstObj,sndObj);
                    break;
                case "left":
                    result = result && this.isLeftOf(fstObj,sndObj);
                    break;
                case "right":
                    result = result && this.isRightOf(fstObj,sndObj);
                    break;
            }
        });

        if (result) {
            return true;
        }
        return false;
    }

    // This can perhaps be made smarter. Instead of moving one step at a time, we could reason about how objects can be moved.
    getNewStates() : collections.Dictionary<string,WorldState> {
        var newStates = new collections.Dictionary<string,WorldState>(ws => ws.toString());

        if (this.canMoveLeft()) {
            newStates.setValue("l",this.newWorldMoveLeft());
        }

        if (this.canMoveRight()) {
            newStates.setValue("r",this.newWorldMoveRight());
        }

        if (!this.isHolding()) {
            newStates.setValue("p",this.newWorldPick());
        } else if (this.canDrop()) {
            newStates.setValue("d",this.newWorldDrop());
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

        console.log("Stack: " + newStacks[this.arm].toString());
        console.log("Holding: " + this.holding);

        newStacks[this.arm].push(this.holding);

        return new WorldState(newStacks, null, this.arm, this.objects, this.examples);
    }

    newWorldPick() : WorldState {
        var newStacks : string[][] = this.stacks;
        var newHolding : string = newStacks[this.arm].pop();

        console.log("Picked up: " + newHolding);

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

            console.log("Stack size: " + stackHeight);
            console.log("Stack: " + this.stacks[this.arm]);
            console.log("Top obj: " + topObj);
            console.log("Holding:" + this.holding);
/*
            console.log(this.stacks[this.arm].length);
            console.log(stackHeight-1);
            console.log(currObj.toString());
            console.log(topObj.toString());
            */
            return currObj.canBePutOn(topObj);
        }
    }

    isHolding() : boolean {
        return this.holding !== null;
    }
}