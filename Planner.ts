///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        var error = null;
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            try {
                plan.plan = planInterpretation(plan.intp, currentState);
            }
            catch(err) {
                error = err;
                return;
            }
            if (plan.plan) {
                plans.push(plan);
            }
        });
        if (plans.length) {
            return plans;
        } else {
            if(error) {
                throw error;
            }

            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions
    function getGoalFunc(relTargets: Interpreter.Literal[][]) {
        return function IsWorldGoal(world: WorldNode) : boolean {
            for (var i=0; i < relTargets.length; ++i) {
                var relTarget : Interpreter.Literal[] = relTargets[i]
                var isMatch : boolean = true;
                for (var j=0; j< relTarget.length; ++j) {
                    if (!stateSatisfiesLiteral(world.State, relTarget[j])) {
                        isMatch = false;
                        break;
                    }
                }
                if (isMatch) {
                    return true;
                }

            }
            return false;
        }
    }

    //TODO: refactor
    export function stateSatisfiesLiteral(state: WorldState, literal: Interpreter.Literal) : boolean {
        if (literal.rel === "holding") {
            return state.holding === literal.args[0];
        }

        var firstObject : string = literal.args[0];
        var secondObject : string = literal.args[1];
        return Interpreter.isRelativeMatch(firstObject, literal.rel, secondObject, state);
    }

    function getHeuristicFunction(targetLiteral : Interpreter.Literal[][]) {
        return function numberOfMismatches(fromWorld : WorldNode, world : WorldNode) : number {
            var minCost = Infinity;
            for (var i=0; i < targetLiteral.length; ++i) {
                var relTarget : Interpreter.Literal[] = targetLiteral[i]
                var mismatches : number = 0;
                //var objectList : string[] = [];
                for (var j=0; j< relTarget.length; ++j) {
                    if (!stateSatisfiesLiteral(world.State, relTarget[j])) {
                        ++mismatches;
                    }
                    //objectList.concat(relTarget[j]);
                }
                //var objects = new Set(objectList);
                //var numBlockingObjects : number = GetBlockingObjects(world.State, objects);
                var currentCost : number = mismatches;// + numBlockingObjects;
                if (currentCost < minCost){
                    minCost = currentCost;
                }
            }
            return minCost;
        };
    }

    function getHeuristicFunction2(targetLiteral: Interpreter.Literal[][]) {
        var heuristicSubFunctions = [numBlockingObjectsHeuristic, distanceHeuristic];

        return function(fromWorld: WorldNode, world: WorldNode): number {
            var heuristics = targetLiteral.map(function(literal) {
                var subHeuristics = heuristicSubFunctions.map(function(f) {
                    return f(literal, world);
                });
                return sum(subHeuristics);
            });
            return min(heuristics);
        }
    }

    function numBlockingObjectsHeuristic(target: Interpreter.Literal[], world: WorldNode): number {
        var blockingObjects = {};
        var numBlocking = 0;

        var unsatisfied: Interpreter.Literal[] = target.filter(function(literal) {
            return !stateSatisfiesLiteral(world.State, literal);
        })

        var relevantObjects: string[] = getAllArgs(unsatisfied);
        for (var i = 0; i < relevantObjects.length; ++i) {
            var blocking = world.GetBlockingObjects(relevantObjects[i]);
            for (var j = 0; j < blocking.length; ++j) {
                if (!blockingObjects[blocking[j]]) {
                    blockingObjects[blocking[j]] = true;
                    numBlocking++;
                }
            }
        }

        return numBlocking;
    }

    function getAllArgs(target: Interpreter.Literal[]): string[] {
        var allArgs: string[] = [];
        for (var i = 0; i < target.length; ++i) {
            var literal = target[i];
            for (var j = 0; j < literal.args.length; ++j) {
                allArgs.push(literal.args[i]);
            }
        }
        return allArgs;
    }

    function distanceHeuristic(target: Interpreter.Literal[], world: WorldNode): number {
        var distances = [0];

        for (var i = 0; i < target.length; ++i) {
            var literal = target[i];
            if (stateSatisfiesLiteral(world.State, literal)) {
                continue;
            }

            var argDistances = literal.args.map(function(arg) {
                var position = world.GetObjectColumn(arg);
                if (position) {
                    return Math.abs(position - world.State.arm);
                }
                return 0;
            });

            var distance = min(argDistances);

            if (literal.rel == "ontop" || literal.rel == "inside") {
                for (var j = 1; j < literal.args.length; ++j) {
                    var firstPos = world.GetObjectColumn(literal.args[j - 1]);
                    var secondPos = world.GetObjectColumn(literal.args[j]);
                    if (firstPos && secondPos) {
                        distance += Math.abs(firstPos - secondPos);
                    }
                }
            }

            distances.push(distance);
        }

        return max(distances);
    }

    function sum(list: number[]): number {
        var total = 0;
        for (var i = 0; i < list.length; ++i) {
            total += list[i];
        }
        return total;
    }

    function min(list: number[]): number {
        var min = list[0];

        for (var i = 1; i < list.length; ++i) {
            if (list[i] < min) {
                min = list[i];
            }
        }
        return min;
    }

    function max(list: number[]): number {
        var max = list[0];
        for (var i = 1; i < list.length; ++i) {
            if (list[i] > max) {
                max = list[i];
            }
        }
        return max;
    }

    class ObjectPosition {
        constructor (
            public Column: number,
            public Row: number
        ){}
    }

    class WorldNode implements INode<WorldNode> {
        constructor(
            public State: WorldState
            ) {}
        
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
            var topObject = this.GetTopObjectInColumn(this.State.arm);
            var heldObject = this.State.objects[this.State.holding];
            return this.CanPutObjectOntop(heldObject, topObject);
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
            var topObject = this.GetTopObjectInColumn(this.State.arm);
            return (topObject != null);
        }

        Drop(): Neighbour<WorldNode> {
            var newStacks = this.CopyStacks();
            newStacks[this.State.arm].push(this.State.holding);
            var newWorld = this.Copy(newStacks);
            newWorld.State.holding = null;
            return new Neighbour<WorldNode>(newWorld, 1, "d");
        }

        GoLeft(): Neighbour<WorldNode> {
            var newWorld = this.Copy(this.State.stacks);
            newWorld.State.arm -= 1;
            return new Neighbour<WorldNode>(newWorld, 1, "l");
        }

        GoRight(): Neighbour<WorldNode> {
            var newWorld = this.Copy(this.State.stacks);
            newWorld.State.arm += 1;
            return new Neighbour<WorldNode>(newWorld, 1, "r");
        }

        PickUp(): Neighbour<WorldNode> {
            var newStacks = this.CopyStacks();
            var holding = newStacks[this.State.arm].pop();
            var newWorld = this.Copy(newStacks);
            newWorld.State.holding = holding;
            return new Neighbour<WorldNode>(newWorld, 1, "p");
        }

        CopyStacks(): string[][] {
            return this.State.stacks.map(function(stack) {
                return stack.slice();
                });
        }

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

        FindObjectPosition(object: string): ObjectPosition {
            for (var i = 0; i < this.State.stacks.length; ++i) {
                var stack = this.State.stacks[i];
                for (var j = 0; j < stack.length; ++j) {
                    if (stack[j] == object) {
                        return new ObjectPosition(i, j);
                    }
                }
            }
            return null;
        }

        GetObjectColumn(object: string): number {
            var position = this.FindObjectPosition(object);
            if (position) {
                return position.Column;
            }
            if (this.State.holding == object) {
                return this.State.arm;
            }
            return null;
        }

        GetBlockingObjects(object: string): string[] {
            var position = this.FindObjectPosition(object);
            if (!position) {
                return [];
            }

            var stack = this.State.stacks[position.Column];
            var blocking = [];
            for (var i = position.Row + 1; i < stack.length; ++i) {
                blocking.push(stack[i]);
            }
            return blocking;
        }

        GetTopObjectInColumn(column: number): ObjectDefinition {
            var stack = this.State.stacks[column];

            for (var i = stack.length - 1; i >= 0; --i) {
                if (stack[i]) {
                    var retObject = this.State.objects[stack[i]];
                    return retObject;
                }
            }
            return null;
        }

        CanPutObjectOntop(object: ObjectDefinition, baseObject: ObjectDefinition): boolean {
            if (!baseObject) {
                baseObject = {
                    form: "floor",
                    size: null,
                    color: null,
                };
            }
            //Balls cannot support anything.
            if (baseObject.form == "ball") {
                return false;
            }
            //Small objects cannot support large objects.
            if(baseObject.size == "small" && object.size =="large"){
                return false;
            }
            //Balls must be in boxes or on the floor, otherwise they roll away.
            //TODO check if baseobject is floor
            if(object.form == "ball" && !(baseObject.form == "box" || baseObject.form == "floor")){
                    return false;
            }
            //Boxes cannot contain pyramids, planks or boxes of the same size.
            if(baseObject.form == "box" && 
              (object.form == "pyramid" || object.form =="plank" ||
              (object.form == "box" && baseObject.size == object.size))){
                return false;
            }
            //Small boxes cannot be supported by small bricks or pyramids.
            if(object.size == "small" && object.form == "box" && 
              (baseObject.form == "brick" ||baseObject.form == "pyramid")){
                return false
            }

            //Large boxes cannot be supported by large pyramids.
            if(baseObject.form == "pyramid" && baseObject.size == "large" &&
               object.form == "box" && object.size == "large"){
                return false;
            }
            return true;
        }
        toString() : string {
            return this.State.stacks.toString() + this.State.holding + this.State.arm;
        }
    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        try {
            if (intprt.length == 0) {
                return null;
            }

            var goalFunc = getGoalFunc(intprt);
            var heuristicFunc = getHeuristicFunction2(intprt);
            var world = new WorldNode(state)
            var astarResult = Astar(world, goalFunc, heuristicFunc, 5000);

            if (!astarResult || !astarResult.Path){
                return null;
            }
            var steps = astarResult.Path.Steps;
            var analyzedPlan = PlanalyzeActions(steps, state, intprt);
            return analyzedPlan;
        } catch (err) {
            if (err instanceof TimeoutException) {
                throw new Error("timeout");
            } else {
                throw err;
            }
        }
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
