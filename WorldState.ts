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

    /**
     * Adds the specified object to WorldState at the provided stack index, does not verify that the stack exists
     * or that the object is valid.
     *
     * @param stack     Index of the stack which we add the object to.
     * @param name      Identifier of the object.
     * @param object    Object to add.
     */
    addObject(stack : number, name : string, object : ObjectDefinition) {
        this.stacks[stack].push(name);
        this.objects[name] = object;
    }

    /**
     * Returns how many objects exists with the properties defined. If we don't care
     * about a property call it with "any".
     *
     * @param form          Form to count.
     * @param size          Sizes to count.
     * @param color         Color to count.
     * @returns {number}    Amount of objects with properties.
     */
    getNrOfObjects(form : string, size : string, color : string) : number {
        var count = 0;
        for(var key in this.objects) {
            if( (form === "any"     || this.objects[key].form === form) &&
                (size === "any"     || this.objects[key].size === size) &&
                (color === "any"    || this.objects[key].color === color)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Returns a list of object names that fits the given description.
     * @returns {string[]} list of objects that fit the description in this world.
     */
    getObjectByDefinition(form : string, size : string, color : string) : string[]{
        if (form === "floor") {
            return ["floor"];
        }
        var objectsNames:string[] = Array.prototype.concat.apply([], this.stacks);
        if (this.holding !== null && this.holding !== undefined){
            objectsNames[objectsNames.length] = this.holding;
        }
        if (size !== null) {
            objectsNames = objectsNames.filter(e=> this.objects[e].size === size);
        }
        if (color !== null) {
            objectsNames = objectsNames.filter(e=> this.objects[e].color === color);
        }
        if (form !== "anyform") {
            objectsNames = objectsNames.filter(e=> this.objects[e].form === form);
        } else if (size === null && color === null) {
            objectsNames.push("floor");
        }
        return objectsNames;
    }

    /**
     * Returns the object that the arm is currently holding. Does not verify that the arm is holding something.
     * @returns {ObjectDefinition} Object that the arm is currently holding.
     */
    getHoldingObj() : ObjectDefinition {
        return this.objects[this.holding];
    }

    toString() : string {
        return "S: " + this.stacksToString() + ", A: " + this.arm.toString() + ", H: "  + this.holding;
    }

    /**
     * Returns the amount in objects in this state.
     * @returns {number} Total amount of objects in this state.
     */
    nrOfObjectsInWorld() : number {
        var result = 0;
        this.stacks.forEach((stack) => {
            result += stack.length;
        });
        return (this.holding === null) ? result : ++result;
    }

    /**
     * Does a deep compare between this state and the provided other state.
     *
     * @param otherState    State to compare this state with.
     * @returns {boolean}   True if all of the components in the states are exactly the same, false otherwise.
     */
    equals(otherState : WorldState) : boolean {
        if (this.stacks.length != otherState.stacks.length ||
            this.holding !== otherState.holding ||
            this.arm !== otherState.arm) {
            return false;
        }

        for (var i = 0, l=this.stacks.length; i < l; i++) {
            for (var j = 0, k=this.stacks[i].length; j < k; j++) {
                if (this.stacks[i][j] !== otherState.stacks[i][j]) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Verifies whether the provided relation exists in this state.
     *
     * @param obj           Object of the relation.
     * @param loc           Location of the object.
     * @param rel           Relation between the object and the relation.
     * @returns {boolean}   True if the specified relation of the object exists in this state.
     */
    relationExists(obj : string, loc : string, rel : string) : boolean {
        if(loc !== obj) {
            switch(rel) {
                case "ontop":
                case "inside":
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

    /**
     * Verifies whether the provided relation is valid with regards to the physical rules defined for the world.
     * @param fst           First object of the relation.
     * @param snd           Second object of the relation.
     * @param rel           The relation between the first and the second object.
     * @returns {boolean}   True if the relation between the first and second object is valid, false otherwise.
     */
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

    /**
     * Verifies whether a provided condition is satisfied in this world.
     * @param conditions    Conditions to be verified, seperated by "AND"s.
     * @returns {boolean}   True if the condition is satisifed in this state, false otherwise.
     */
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

    /**
     * Generates a collection of reachable states from this state.
     * TODO: Instead of moving one step at a time, we could reason about how objects can be moved.
     *
     * @returns {collections.Dictionary<string, WorldState>} Collection of reachable states from this state, where the key represents the move performed.
     */
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

    /**
     * Returns the number objects on top of the provided object in it's stack.
     * If the objected provided is the floor, the function returns the height of the lowest stack.
     * Does not verify that the provided object exists in this state.
     *
     * @param obj           The object provided.
     * @returns {number}    The number of objects on top the provided object.
     */
    objectsOnTop(obj : string) : number {
        if (obj == "floor") {
            return this.stacks[this.getLowestStackIndex()].length;
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

    /**
     * Checks whether the first object is on top of the second object.
     *
     * @param fstObj        The first object.
     * @param sndObj        This second object.
     * @returns {boolean}   True if the first objet is directly on top of the second object.
     */
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
        });

        return strBuilder.toString();
    }

    /**
     * Checks whether the first object is somewhere above the second object in the same stack.
     * If the second object is the floor, it always return true.
     * @param fstObj        The first object.
     * @param sndObj        The second object.
     * @returns {boolean}   True if the first object is somewhere above the second object in the same stack, false otherwise.
     */
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

    /**
     * Checks whether the first object is somewhere below the second object in the same stack.
     * @param fstObj        The first object.
     * @param sndObj        The second object.
     * @returns {boolean}   True if the first object is somewhere below the second object in the same stack, false otherwise.
     */
    isUnder(fstObj : string, sndObj : string) : boolean {
        return this.isAbove(sndObj,fstObj);
    }

    /**
     * Checks wether the first object is in an adjacent stack of the second object.
     * @param fstObj        The first object.
     * @param sndObj        The second object.
     * @returns {boolean}   True if the first object is in an adjacent stack of the second, false otherwise.
     */
    isBeside(fstObj : string, sndObj : string) : boolean {
        return 1 == this.getDistance(fstObj,sndObj);
    }

    /**
     * Checks wether the first object is in an stack somewhere to the left of the second object.
     * @param fstObj        The first object.
     * @param sndObj        The second object.
     * @returns {boolean}   True if the first object is in an stack somewhere to the left of the second, false otherwise.
     */
    isLeftOf(fstObj : string, sndObj : string) : boolean {
        return this.getStackIndex(fstObj) < this.getStackIndex(sndObj);
    }

    /**
     * Checks wether the first object is in an stack somewhere to the right of the second object.
     * @param fstObj        The first object.
     * @param sndObj        The second object.
     * @returns {boolean}   True if the first object is in an stack somewhere to the right of the second, false otherwise.
     */
    isRightOf(fstObj : string, sndObj : string) : boolean {
        return this.isLeftOf(sndObj,fstObj);
    }

    /**
     * Gets the horizontal distance between the stacks of the first and second object.
     * TODO: Does not handle the floor in a well defined manner.
     *
     * @param fstObj        The first object.
     * @param sndObj        The second object.
     * @returns {number}    The horizontal distance between the stacks of the first and second object.
     */
    getDistance(fstObj : string, sndObj : string) : number {
        return Math.abs(this.getStackIndex(fstObj) - this.getStackIndex(sndObj));
    }

    /**
     * Returns the index of the stack that the object is in.
     * If the object is the floor, it returns the index of the lowest stack.
     * @param obj           The object.
     * @returns {number}    The index of the stack that the object resides in, -1 if the object cant be found (is picked up for example).
     */
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
                stackIndex = found ? stackIndex : stackIndex+1;
            });

            return found ? stackIndex : -1;
        }
    }

    /**
     * Returns the index of the stack with the lowest height.
     * @returns {number} Index of the stack with the lowest height.
     */
    getLowestStackIndex() : number {
        var min = 10000;
        var ix = 0;
        var minStack = ix;

        this.stacks.forEach((stack) => {
            if(stack.length <= min) {
                min = stack.length;
                minStack = ix;
            }
            ix++;
        });

        return minStack;
    }

    getLowestStackIndexNearby(obj : string) : number {
        var objStackIx = this.holding === obj ? this.arm : this.getStackIndex(obj);
        var min = 10000;
        var dist = 10000;
        var ix = 0;
        var minStack = ix;

        this.stacks.forEach((stack) => {
            if(stack.length <= min && Math.abs(ix-objStackIx) < dist) {
                min = stack.length;
                minStack = ix;
            }
            ix++;
        });

        return minStack;
    }

    private newWorldMoveLeft() : WorldState {
        var tempState = this.clone();
        return new WorldState(tempState.stacks, tempState.holding, tempState.arm-1, tempState.objects, tempState.examples);
    }

    private newWorldMoveRight() : WorldState {
        var tempState = this.clone();
        return new WorldState(tempState.stacks, tempState.holding, tempState.arm+1, tempState.objects, tempState.examples);
    }

    private newWorldDrop() : WorldState {
        var tempState = this.clone();
        var newStacks : string[][] = tempState.stacks;

        newStacks[tempState.arm].push(this.holding);

        return new WorldState(newStacks, null, tempState.arm, tempState.objects, tempState.examples);
    }

    private newWorldPick() : WorldState {
        var tempState = this.clone();
        var newStacks  = tempState.stacks;
        var newHolding = newStacks[tempState.arm].pop();

        return new WorldState(newStacks, newHolding, tempState.arm, tempState.objects, tempState.examples);
    }

    private canMoveLeft() : boolean {
        return this.arm != 0;
    }

    private canMoveRight() : boolean {
        return this.arm != this.stacks.length-1;
    }

    private canPick() : boolean {
        return this.stackHeight(this.arm) > 0;
    }

    private canDrop() : boolean {
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

    /**
     * Returns the height of the stack with the provided index.
     * Does not validate the input.
     *
     * @param stackIndex    Index of the stack.
     * @returns {number}    Height of the stack with the provided index.
     */
    stackHeight(stackIndex : number) : number {
        return this.stacks[stackIndex].length;
    }

    isHolding() : boolean {
        return this.holding !== null;
    }

    private isHoldingObj(obj : string) : boolean {
        return this.holding === obj;
    }


    /**
     * Performs a deep copy of the current state.
     * @returns {WorldState} A exact copy of this state.
     */
    clone() : WorldState {
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