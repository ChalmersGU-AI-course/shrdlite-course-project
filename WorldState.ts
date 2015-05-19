/// <reference path="lib/typescript-collections/collections.ts" />
/// <reference path="ObjectDefinition.ts" />
/// <reference path="Interpreter.ts" />
/// <reference path="lib/astar-worldstate/astar.ts" />
/// <reference path="lib/utils.ts" />

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

    addObject(stack : number, name : string, object : ObjectDefinition) {
        this.stacks[stack].push(name);
        this.objects[name] = object;
    }

    toString() : string {
        return "S: " + this.stacksToString() + ", A: " + this.arm.toString() + ", H: "  + this.holding;
    }

    /**
     * Returns the amount in objects in this state.
     * @returns {number} Number of objects in the state.
     */
    nrOfObjectsInWorld() : number {
        var result = 0;
        this.stacks.forEach((stack) => {
            result += stack.length;
        });
        return (this.holding === null) ? result : ++result;
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

    relationExists(obj : string, loc : string, rel : string) : boolean {
        console.log("RELATIONEXISTS");
        if(loc !== obj) {
            switch(rel) {
                case "ontop":
                case "inside":
                    console.log(obj + " " + rel + " " + loc + ": " + this.isOnTopOf(obj,loc));
                    return this.isOnTopOf(obj,loc);
                case "beside":
                    return loc !== "floor" && this.isBeside(obj,loc);
                case "rightof":
                    return loc !== "floor" && this.isRightOf(obj,loc);
                case "leftof":
                    return loc !== "floor" && this.isLeftOf(obj,loc);
                case "above":
                    return this.isAbove(obj,loc);
                case "under":
                    return loc !== "floor" && this.isUnder(obj,loc);
            }
        }

        return false;
    }

    validPlacement(fst : string, snd : string, rel : string) : boolean {
        if(fst !== "floor") {
             var fstObj = this.objects[fst];
             var sndObj = this.objects[snd];

             switch (rel) {
                 case "ontop":
                 case "inside":
                     return snd === "floor" || fstObj.canBePutOn(sndObj);
                 case "above":
                     return snd === "floor" || (sndObj.form !== "ball" && !fstObj.largerThan(sndObj));
                 case "under":
                     return snd !== "floor" || (fstObj.form !== "ball" && !sndObj.largerThan(fstObj)); //TODO second operand of || will crash sometimes
                 case "beside":
                 case "leftof":
                 case "rightof":
                     return snd !== "floor";
             }
        }
        return false;
    }

    satisfiesConditions(conditions : Interpreter.Literal[]) : boolean {
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
                    result = result && this.isUnder(fstObj,sndObj);
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
                case "holding":
                    result = result && this.isHoldingObj(fstObj);
            }
        });

        return result;
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

        if (!this.isHolding() && this.canPick()) {
            newStates.setValue("p",this.newWorldPick());
        } else if (this.canDrop()) {
            newStates.setValue("d",this.newWorldDrop());
        }

        return newStates;
    }

    objectsOnTop(obj : string) : number {
        if (obj == "floor") {
            return this.stacks[this.getLowestStackIndex()-1].length;
        } else {
            var objectsOnTop = -1;

            this.stacks.forEach((stack) => {
                var ix = stack.indexOf(obj);

                if (ix >= 0) {
                    objectsOnTop = stack.length - 1 - ix;
                }
            });

            return objectsOnTop;
        }
    }

    isOnTopOf(fstObj : string, sndObj : string) : boolean {
        if(!this.isHoldingObj(fstObj)) {
            var firstObjStackIndex = this.getStackIndex(fstObj);

            if(sndObj === "floor") {
                return this.stacks[firstObjStackIndex][0] === fstObj;
            } else {
                if (firstObjStackIndex === this.getStackIndex(sndObj)) {
                    return 1 == this.stacks[firstObjStackIndex].indexOf(fstObj) - this.stacks[firstObjStackIndex].indexOf(sndObj);
                }
            }
        }
        return false;
    }

    stacksToString() : string {
        var strBuilder = [];
        this.stacks.forEach((stack) => {
            strBuilder.push("[" + stack.toString() + "]");
        })

        return strBuilder.toString();
    }

    isAbove(fstObj : string, sndObj : string) : boolean {
        if(sndObj === "floor") {
            return true;
        } else {
            var stackIndex = this.getStackIndex(fstObj);

            if (stackIndex == this.getStackIndex(sndObj)) {
                return this.stacks[stackIndex].indexOf(fstObj) > this.stacks[stackIndex].indexOf(sndObj);
            }

            return false;
        }
    }

    isUnder(fstObj : string, sndObj : string) : boolean {
        return this.isAbove(sndObj,fstObj);
    }

    isBeside(fstObj : string, sndObj : string) : boolean {
        return 1 == this.getDistance(fstObj,sndObj);
    }

    isLeftOf(fstObj : string, sndObj : string) : boolean {
        return this.getStackIndex(fstObj) < this.getStackIndex(sndObj);
    }

    isRightOf(fstObj : string, sndObj : string) : boolean {
        return this.isLeftOf(sndObj,fstObj);
    }

    getDistance(fstObj : string, sndObj : string) : number {
        // TODO: Needs to handle floor.
        return Math.abs(this.getStackIndex(fstObj) - this.getStackIndex(sndObj));
    }

    getStackIndex(obj : string) : number {
        if (obj == "floor") {
            return this.getLowestStackIndex();
        } else {
            var stackIndex = 0;
            var found = false;

            this.stacks.forEach((stack) => {
                if (stack.indexOf(obj) >= 0) {
                    found = true;
                }
                found ? stackIndex : stackIndex++;
            });

            return found ? stackIndex : -1;
        }
    }

    getLowestStackIndex() : number {
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
        var tempState = this.clone(this);
        return new WorldState(tempState.stacks, tempState.holding, tempState.arm-1, tempState.objects, tempState.examples);
    }

    newWorldMoveRight() : WorldState {
        var tempState = this.clone(this)
        return new WorldState(tempState.stacks, tempState.holding, tempState.arm+1, tempState.objects, tempState.examples);
    }

    newWorldDrop() : WorldState {
        var tempState = this.clone(this)
        var newStacks : string[][] = tempState.stacks;

        newStacks[tempState.arm].push(this.holding);

        return new WorldState(newStacks, null, tempState.arm, tempState.objects, tempState.examples);
    }

    newWorldPick() : WorldState {
        var tempState = this.clone(this)
        var newStacks  = tempState.stacks;
        var newHolding = newStacks[tempState.arm].pop();

        return new WorldState(newStacks, newHolding, tempState.arm, tempState.objects, tempState.examples);
    }

    canMoveLeft() : boolean {
        return this.arm != 0;
    }

    canMoveRight() : boolean {
        return this.arm != this.stacks.length-1;
    }

    canPick() : boolean {
        return this.stackHeight(this.arm) > 0;
    }

    canDrop() : boolean {
        var stackHeight = this.stackHeight(this.arm);

        if (!this.isHolding()) {
            return false;
        } else if (stackHeight === 0) {
            return true;
        } else {
            var topObjName : string = this.stacks[this.arm][stackHeight-1];
            var topObj : ObjectDefinition = this.objects[topObjName];
            var currObj : ObjectDefinition = this.objects[this.holding];

            return currObj.canBePutOn(topObj);
        }
    }

    stackHeight(stackIndex : number) : number {
        return this.stacks[stackIndex].length;
    }

    isHolding() : boolean {
        return this.holding !== null;
    }

    isHoldingObj(obj : string) : boolean {
        return this.holding === obj;
    }


    clone(obj) : WorldState {
        var newStacks : string[][] = [];

        for(var i = 0; i < this.stacks.length; i++) {
            newStacks.push([]);
            for(var j = 0; j < this.stacks[i].length; j++) {
                newStacks[i].push(this.stacks[i][j]);
            }
        }

        var newHolding = this.holding;
        var newArm = this.arm;

        var newObjects : { [s:string]: ObjectDefinition } = {};

        for (var key in this.objects) {
            if (this.objects.hasOwnProperty(key)) {
                newObjects[key] = this.objects[key];
            }
        }

        var newExamples = [];

        for(var i = 0; i < this.examples.length; i++) {
            newExamples[i] = this.examples[i];
        }

        return new WorldState(newStacks, newHolding, newArm, newObjects, newExamples);
    }
}