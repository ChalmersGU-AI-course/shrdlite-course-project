///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="search/AStar.ts"/>
///<reference path="test/Graph.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations: Interpreter.Result[], currentState: WorldState): Result[] {
        var plans: Result[] = [];
        interpretations.forEach((intprt) => {
            var plan: Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            //Sort the plans for the "shortest"
            return plans.sort(compare);
        } else {
            throw new Planner.Error("Found no plans");
        }
    }

    export interface Result extends Interpreter.Result { plan: string[]; }


    export function planToString(res: Result): string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message?: string) { }
        public toString() {return this.name + ": " + this.message }
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    /*
        Physical laws

        The world is ruled by physical laws that constrain the placement and movement of the objects:

        -The floor can support at most N objects (beside each other).           [ ]
        -All objects must be supported by something.                            [ ]
        -The arm can only hold one object at the time.                          [X]
        -The arm can only pick up free objects.                                 [X]
        -Objects are “inside” boxes, but “ontop” of other objects.              [ ]
        -Balls must be in boxes or on the floor, otherwise they roll away.      [X]
        -Balls cannot support anything.                                         [X]
        -Small objects cannot support large objects.                            [X]
        -Boxes cannot contain pyramids, planks or boxes of the same size.       [X]
        -Small boxes cannot be supported by small bricks or pyramids.           [X]
        -Large boxes cannot be supported by large pyramids.                     [X]
    */

    module PhysicalLaws {

        //Check the validity for arm pickups
        export function possibleArmPickup(obj: string, state: WorldState): boolean {
            var bool = false;

            if (state.holding !== null) {
            } else {
                //Check if the object is free
                for (var i = 0; i < state.stacks.length; i++) {
                    var topObjIndex = state.stacks[i].length - 1;
                    if (topObjIndex >= 0) {
                        if (state.stacks[i][topObjIndex] == obj) {
                            return true;
                        }
                    }
                }
            }
            return bool;
        }

        //Check if an intended move is valid
        export function validPosition(topObj: ObjectDefinition, bottomObj: ObjectDefinition): boolean {
            //console.log("Top object: ");
            //console.log(topObj);
            //console.log("Bottom object: ");
            //console.log(bottomObj);
            if (bottomObj.form === "ball")
                return false;
            if (topObj.size === "large" && bottomObj.size === "small")
                return false;
            if (topObj.form === "ball") {
                if (!(bottomObj.form === "box" || bottomObj.form === "floor"))
                    return false;
            }
            if (bottomObj.form === "box") {
                if (topObj.form === "pyramid" || topObj.form === "plank" || topObj.form === "box") {
                    if (bottomObj.size === "small" || topObj.size === "large")
                        return false;
                }
            }
            if (topObj.form === "box") {
                if (topObj.size === "small" && bottomObj.size === "small") {
                    if (bottomObj.form === "brick" || bottomObj.form === "pyramid")
                        return false;
                }
                if (topObj.size === "large" && bottomObj.form === "pyramid" && bottomObj.size === "large")
                    return false;
            }

            return true;
        }

        export function checkInterp(intp: Interpreter.Literal[], state: WorldState): boolean {
            var rel = intp[0].rel;

            for (var i = 0; i < intp.length; i++) {
                var target = intp[i].args[1];
                var primary = intp[i].args[0];

                if (target === "_") {
                    return (rel === "ontop") ? true : false;
                }

                var targetObject = state.objects[target];
                var primaryObject = state.objects[primary];

                if (rel === 'ontop' || rel === 'above' || rel === 'inside') {
                    if (!validPosition(primaryObject, targetObject)) {
                        console.log("Removed interpretation in physical check");
                        return false;
                    }
                } else if (rel === 'under') {
                    if (!validPosition(targetObject, primaryObject)) {
                        console.log("Removed interpretation in physical check");
                        return false;
                    }
                }
            }
            console.log("Interpretation passed physical check");
            return true;
        }
    }

    function planInterpretation(intprt: Interpreter.Literal[][], state: WorldState): string[] {

        /*
            TODO: Structure for planning
                - Filter out obviously invalid interpretations               [X]
                -- Check object physics                                      [X]
                -- Check spatial relations                                   [X]
                - Convert world to PDDL                                      []
                - Calculate heuristic values on every valid interpretation   []
                - Do A* to reach the goalstate                               []
                - List all possible moves                                    []
                - Sort the plans with the one involving least steps first    []
        */

        // Remove invalid interpretations
        var validInterps: Interpreter.Literal[][] = [];
        for (var i = 0; i < intprt.length; i++) {
            if (checkSpatialRelations(intprt[i], state.objects) && PhysicalLaws.checkInterp(intprt[i], state)) {
                console.log("Added!");
                validInterps.push(intprt[i]);
                console.log(validInterps.length);
            }
        }

        //Remove when done
        //testCloning(state);

        // Prepare for A* call
        var start = new Nworld();
        start.states = cloneWorldstate(state);
        //start.states.holding = undefined; // This is a bad call! REMOVE WHEN BETA GOES LIVE
        var stats = { nodesVisited: 0, nodesAdded: 0 }

        var h: Search.Heuristic<Nworld> = allMovesCountsHeuristic(validInterps);
        var goalFunc: (node: Nworld) => boolean = goalFuncHandle(validInterps);

        var search = Search.aStar<Nworld>(h, keyFunc, stats);
        var visitedNodes = search(getNeighbours, start, goalFunc);
        console.log("\nStats:");
        console.log("  nodes visited: " + stats.nodesVisited);
        console.log("  nodes added to queue: " + stats.nodesAdded);

        var path: string[] = [];
        path = buildPath(visitedNodes);
        return pathToPlan(path);
    }

    function buildPath(list : Nworld[]) : string[]{
        var res = [];
        for(var i = 0; i < list.length; i++){
          if(list[i].step !== undefined)
              res.push(list[i].step);
        }
        return res;
    }
    
    function keyFunc(n : Nworld){
        //console.log("keyFunc input: " + n);
        var res = String(n.states.arm);
        var state = n.states;
        if(state.holding !== undefined){
            res = res+state.holding;
        }
        res = res + "!";
      for(var i = 0; i < state.stacks.length; i++){
          for(var j = 0; j < state.stacks[i].length; j++){
              res = res + state.stacks[i][j];
          } 
      }
      //console.log(res);
      return res;
    }

    function checkSpatialRelations(intp: Interpreter.Literal[], objects: { [s: string]: ObjectDefinition }): boolean {
        // Check so that each spatial relation holds between the elements
        // Inside
        // Ontop
        var rel = intp[0].rel;
        if (rel === "inside") {
            // * Several things cannot be in one box
            // * Target is a box 
            var stateSet = new collections.Set<string>(); // To know that one box contain one thing
            for (var i = 0; i < intp.length; i++) {
                var target = intp[i].args[1];
                var obj = intp[i].args[0];

                // Check that target is a box.
                if (objects[target].form !== 'box') {
                    console.log("Removed interpretation: ");
                    console.log(intp[i]);
                    console.log("Due to target is not a box.");
                    return false;
                }

                if (stateSet.contains(target)) {
                    console.log("Removed interpretation: ");
                    console.log(intp[i]);
                    console.log("Due to bad spatial inside relation");
                    return false; // Two things cannot be inside the same box
                } else {
                    stateSet.add(target); // Add the target so we know that it is occupied.
                }
            }
            console.log(intp);
            return true;

        } else if (rel === "ontop") {
            var stateSet = new collections.Set<string>();
            for (var i = 0; i < intp.length; i++) {
                var target = intp[i].args[1];
                var obj = intp[i].args[0];
                if (target === "_")
                    return true;
                if (objects[target].form === 'box') {
                    return false; // Things are inside a box, not ontop. Or is this too harsh?
                }
                if (stateSet.contains(target)) {
                    return false;
                } else {
                    stateSet.add(target);
                }

            }
        }
        return true;
    }


    // Current thoughts of implementations.
    // We accept the interpretations we have left as possible valid solutions
    // we send them to the goalFuncHandle to receive a function to check if our current world
    // is correct.
    // We need to get a function to get a heuristic (this could be a return 0 function for now)
    // 
    // The neighbours to each node in the graph needs to be computed by checking
    //  _ the possible basic moves the arm can do _ that is r,l,p,d and check how the world
    //  changes when putting down or picking up an object.
    //
    //  When this is implemented we should just give these parts to the A-star algorithm and be
    //  thankful for the solution.
    //  The first solution achieved should be the best (not totally convinced of this yet)


    // Function to return a function to check if we fulfilled the goal state
    function goalFuncHandle(intrps: Interpreter.Literal[][]) {
        // Store a set of all interpretations expressed as strings to make subset checks with current world.

        return (function foundGoal(currentWorld: Nworld): boolean {
            var intps = intrps;
            var stacks = currentWorld.states.stacks;
            //console.log("Inside goal function with state: ");
            //console.log(currentWorld);
            for (var i = 0; i < intrps.length; i++) {
                // Check if interpretation i holds in the current world
                var goal = true;
                for (var j = 0; j < intrps[i].length; j++) {
                    var pObj = intrps[i][j].args[0];
                    var tObj = intrps[i][j].args[1];
                    var rel = intrps[i][j].rel;
                    var holds = Interpreter.getRelation([pObj], [tObj], rel, currentWorld.states); // In this pObj & tObj might need to switch, can't figure out how getRelation does it right now.

                    if (!holds.length) {
                        goal = false;
                    }
                }
                // If we have a literal that is a goal state, return true, otherwise keep searching.
                if (goal)
                    return goal;
            }
            return false;
        });
    }
//###################################################################
//###################################################################
//###################################################################
    function getNeighbours(currentWorld: Nworld): [Nworld, number][]{
        // Return all possible moves as corresponing Nworlds, with actual cost (?)
        var arm     = currentWorld.states.arm;
        var holding = currentWorld.states.holding;
        var stacks  = currentWorld.states.stacks;
        var moves :  [Nworld, number][] = [];
        // Total possible moves: Left,Right,Pick,Drop
        if(arm > 0){
            //Move left possible
            var worldstate    = new Nworld();
            var state         = cloneWorldstate(currentWorld.states);
            state.arm = arm - 1;
            worldstate.states = state;
            worldstate.step = 'l';
            currentWorld.neighbours.push([worldstate, 1]);
        }
        if(arm < stacks.length-1){
            // Move right possible
            var worldstate = new Nworld();
            var state = cloneWorldstate(currentWorld.states);
            state.arm = arm + 1;
            worldstate.states = state;
            worldstate.step = 'r';
            currentWorld.neighbours.push([worldstate, 1]);
        }
        // Not hodling an object and object exist at arm position
        if(holding === null && stacks[arm].length > 0){ 
            // Pick up is possible
            var worldstate = new Nworld();
            var state     = cloneWorldstate(currentWorld.states);
            state.holding = state.stacks[arm].pop();
            worldstate.states = state;
            worldstate.step = 'p';
            currentWorld.neighbours.push([worldstate, 1]);

        }
        if(holding !== null){
            // Drop is possible (if all other if-cases holds e.g. physical laws)
            // Check all laws
            // If all laws is OK
            var state = cloneWorldstate(currentWorld.states);
            var topObject = state.objects[state.holding];
            var bottomObject = state.objects[stacks[arm][stacks[arm].length-1]];
                console.log("Trying to put on stack with length: " + stacks[arm].length);
            
            if(stacks[arm].length === 0 || PhysicalLaws.validPosition(topObject, bottomObject)){
                var worldstate = new Nworld();
                var state = cloneWorldstate(currentWorld.states);
                state.stacks[state.arm].push(state.holding);
                console.log("Pushed: " + state.holding + " to position " + state.arm);
                state.holding = null;
                worldstate.states = state;
                worldstate.step = 'd';
                currentWorld.neighbours.push([worldstate, 1]);
            }
        }
        return currentWorld.neighbours;
    }
//################################################################################
//################################################################################
//################################################################################
    function getStackIndex(o1: string, stacks: string[][]): number[] {
        var cords: number[] = [-1, -1];
        for (var i = 0; i < stacks.length; i++) {
            for (var j = 0; j < stacks[i].length; j++) {
                if (stacks[i][j] === o1) {
                    cords[0] = i;
                    cords[1] = j;
                }
            }
        }
        return cords;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function pathToPlan(path : string[]): string[] {
        var plan: string[] = [];
        var prev: string = "";
        for (var i = 0; i < path.length; i++) {
            if (path[i] === prev)
                plan.push(path[i]);
            else {
                switch (path[i]) {
                    case "d":
                        plan.push("Dropping", "d");
                        break;
                    case "p":
                        plan.push("Picking up", "p");
                        break;
                    case "l":
                        plan.push("Moving left", "l");
                        break;
                    case "r":
                        plan.push("Moving right", "r");
                        break;
                    default:
                        plan.push("INITIATING SEQUENCE, PLEASE STAND BACK");
                }
            }
            prev = path[i];
        }
        plan.push("Actions performed: " + path.length);
        return plan;
    }

    /*
        Costs for the heuristic:
        - The heuristic aim to return the number of moves that at least are needed
        - A move is either 'l', 'r', 'p' or 'd'
        - The cost for a move is 1
        - The different relations has different minimum costs

    */
    function allMovesCountsHeuristic(goals: Interpreter.Literal[][]): Search.Heuristic<Nworld> {
        return function (node: Nworld): number {
            var cost: number = Number.MAX_VALUE;

            for (var i = 0; i < goals.length; i++) {
                var max: number = 0;

                for (var j = 0; j < goals[i].length; j++) {
                    var temp: number = calculateCost(goals[i][j], node.states);
                    max = Math.max(temp, max);
                }
                cost = Math.min(cost, max);
            }
            return cost;
        }
    }

    function calculateCost(literal: Interpreter.Literal, state: WorldState): number {
        var cost: number = 0;
        var primary: string = literal.args[0];
        var target = literal.args[1];
        // Since we are searching for the cost we have not yet reached the goal

        if (literal.rel === "holding") {

            cost = calculateHolding(primary, state);

        } else if (literal.rel === "ontop" || literal.rel === "inside") {
            if (state.holding === target || target === "_") {
                cost = calculateHolding(primary, state) + 2; //sidestep + drop
            } else if (state.holding === primary) {
                cost = calculateHolding(target, state) - 1 + 4; //-1 since no picking up then move primary on target
            } else if (findStack(primary, state.stacks) === findStack(target, state.stacks)) {
                var indexA: number = findStack(primary, state.stacks);
                var indexB: number = findStack(target, state.stacks);
                if (howManyAbove(primary, state.stacks[indexA]) < howManyAbove(target, state.stacks[indexB]))
                    cost = calculateHolding(target, state) - 1 + 4; //-1 since no picking up then move primary on target
                else //target is above
                    cost = calculateHolding(primary, state) + 2; //sidestep + drop
            } else { //primary and target is in different stacks
                var indexA: number = findStack(primary, state.stacks);
                var indexB: number = findStack(target, state.stacks);
                var dist: number = Math.abs(findStack(primary, state.stacks) - indexB);
                if (howManyAbove(target, state.stacks[indexB]) !== 0) { //check if the target is on top of its stack
                    cost = howManyAbove(target, state.stacks[indexB]) * 4 - 2; //no picking up or moving back to the stack
                    dist = 2 * dist - Math.abs(state.arm - indexA) + Math.abs(state.arm - indexB);
                }
                cost = cost + calculateHolding(primary, state);
                cost = cost + dist + 1; //drop
            }
        } else if (literal.rel === "above") {
            // First calculate the cost for picking up the primary object
            cost = calculateHolding(primary, state);
            // Add the horizontal distance
            cost = cost + Math.abs(findStack(primary, state.stacks) - findStack(target, state.stacks));
            // Add one move to drop the picked up object, add one more sidestep if they shared stack 
            cost = findStack(primary, state.stacks) === findStack(target, state.stacks) ? cost + 2 : cost + 1;
        } else if (literal.rel === "under") {
            // First calculate the cost for picking up the primary object
            cost = calculateHolding(target, state);
            // Add the horizontal distance
            cost = cost + Math.abs(findStack(primary, state.stacks) - findStack(target, state.stacks));
            // Add one move to drop the picked up object, add one more sidestep if they shared stack 
            cost = findStack(primary, state.stacks) === findStack(target, state.stacks) ? cost + 2 : cost + 1;
        } else if (literal.rel === "beside") {
            var indexA = findStack(primary, state.stacks);
            var indexB = findStack(target, state.stacks);
            if (indexA === indexB) {
                //If a & b share stack, pick up the one highest in the stack and add 2 (l|r, d)
                var obj = howManyAbove(primary, state.stacks[indexA]) < howManyAbove(target, state.stacks[indexB]) ? primary : target;
                cost = calculateHolding(obj, state) + 2;
            } else { // a & b are several stacks apart
                var costA = calculateHolding(primary, state);
                var costB = calculateHolding(target, state);
                cost = costA < costB ? costA : costB; //pickup the cheapest one
                cost = cost + Math.abs(indexA - indexB); // add the distance, subtract 1 since less (l|r) and add 1 because (d)
            }
        } else if (literal.rel === "leftof") {
            cost = calculateLeftOf(primary, target, state);
        } else if (literal.rel === "rightof") {
            cost = calculateLeftOf(target, primary, state);
        }

        return cost;
    }

    function calculateHolding(primary : string, state : WorldState): number {
        var cost: number = 0;
        
        // It we hold the goal we are done
        // Holding an object above the primary's stack costs three (l d r | r d l)
        // Holding an object anywhere else costs one (d) 
        if (state.holding !== null) {
            if (state.holding === primary)
                return cost;
            cost = state.arm === findStack(primary, state.stacks) ? cost + 3 : cost++;
        }
        // The least amount of moves in horizontal position is added to the cost (# of 'l' or 'r')
        var position: number = findStack(primary, state.stacks);
        if (position !== -1)
            cost = cost + Math.abs(position - state.arm);
        else
            return Number.MAX_VALUE-10000; //The object doesn't exist in the world or is the floor

        // When the arm is positioned above the correct stack, it takes at least 4 moves 
        // to move each item above the goal object (p + l|r + d + r|l)
        cost = cost + howManyAbove(primary, state.stacks[position]) * 4;
        // It costs one move to pick up the goal ('p')
        cost++;

        return cost;
    }

    //Calculates the least number of moves needed to get A left of B
    function calculateLeftOf(a: string, b: string, state: WorldState): number {
        var cost: number = 0;
        var indexA = findStack(a, state.stacks);
        var indexB = findStack(b, state.stacks);

        //B is either being held or is in the same stack as A
        if (indexA == 0) {
            //Pick up b
            cost = calculateHolding(b, state);
            if (indexB == -1) {
                cost = state.arm == 0 ? cost + 2 : cost + 1; // 1 = (d) 2 = (r,d)
            } else {
                //if a is above b, move b further right so +1 (r)	
                if (howManyAbove(a, state.stacks[indexA]) < howManyAbove(b, state.stacks[indexB]))
                    cost++;
            }
        }
        //A is either being held or is in the same stack as B
        else if (indexB == state.stacks.length) {
            //Pick up a
            cost = calculateHolding(a, state);
            if (indexA == -1) {
                cost = state.arm == state.stacks.length ? cost + 2 : cost + 1; // 1 = (d) 2 = (r,d)
            } else {
                //if b is above a, move a further left so +1 (l)
                if (howManyAbove(b, state.stacks[indexB]) < howManyAbove(a, state.stacks[indexA]))
                    cost++;
            }
        }
        //A and B are in the same stack
        else if (indexA == indexB) {
            //See which object is highest up in the stack
            var obj = (howManyAbove(a, state.stacks[indexA]) < howManyAbove(b, state.stacks[indexB])) ? a : b
		    //Move the object to the side
            cost = calculateHolding(obj, state) + 2; //(r|l,d)
        }
        //A or B is being held by the arm, minimum cost is 1 (d)
        else if (indexA == -1 || indexB == -1) {
            cost++;
        }
        //Else B is left of A
        else {
            cost = Math.min(calculateHolding(a, state), calculateHolding(b, state));
            var dist = Math.abs(indexA - indexB);
            cost = cost + dist + 2; //(l|r + d);
        }
        return cost;
    } 

    //Returns the index of the stack in stacks where the obj is
    function findStack(obj: string, stacks: string[][]): number {
        for (var i = 0; i < stacks.length; i++) {
            if (stacks[i].lastIndexOf(obj) !== -1)
                return i;
        }
        return -1;
    }

    //Returns how many items obj has above in the stack
    function howManyAbove(obj: string, stack: string[]): number {
        return stack.length - stack.lastIndexOf(obj) + 1;
    }

    //Clones the worldstate
    function cloneWorldstate(state: WorldState): WorldState {
        var clone: WorldState = {
            arm: state.arm,
            holding: state.holding,
            examples: cloneObject(state.examples),
            objects: cloneObject(state.objects),
            stacks: cloneObject(state.stacks)
        };
        return clone;
    }

    // recursive function to clone an object. If a non object parameter
    // is passed in, that parameter is returned and no recursion occurs.
    function cloneObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        var temp = obj.constructor(); // give temp the original obj's constructor
        for (var key in obj) {
            temp[key] = cloneObject(obj[key]);
        }

        return temp;
    }

    function compare(a: Result, b: Result) {
        if (a.plan.length < b.plan.length) {
            return -1;
        }
        if (a.plan.length > b.plan.length) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    /*  
        TTTTTTT   EEEEE      sSSSs   tTTTTTt
           T      E         sS   ss      T
           T      EEEe        Ss        T
           T      E        ss   Ss       T
           T      EEEEE     sSSSs        T
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    function testCloning(state: WorldState) {
        console.log("------------TEST FOR CLONING------------");
        var cloned: WorldState = cloneWorldstate(state);
        if (cloned.arm == state.arm)
            console.log("STATES ARMS ARE EQUAL");
        if (cloned.holding == state.holding)
            console.log("STATES HOLDING ARE EQUAL");

        state.stacks = null;
        if (state.stacks === null)
            console.log("STACKS ARE NOW NULL " + state.stacks);

        state.objects = null;
        if (state.objects === null)
            console.log("OBJECTS ARE NOW " + state.objects);

        console.log("Cloned state: " + cloned.objects);
        console.log("Cloned state: " + cloned.stacks);

        console.log("Cloning back to original");
        state.stacks = cloneObject(cloned.stacks);
        state.objects = cloneObject(cloned.objects);
        console.log("Original state: " + state.objects);
        console.log("Original state: " + state.stacks);
        
        //Testing the equality for the stacks
        var equal = true;
        for (var i = 0; i < state.stacks.length; i++) {
            for (var j = 0; j < state.stacks[i].length; j++) {
                if (!(state.stacks[i][j] === cloned.stacks[i][j])) {
                    equal = false;
                }
            }
        }

        //Testing the equality for objects
        var l: string;
        for (l in state.objects) {
            if (!(cloned.objects[l].color === state.objects[l].color))
                equal = false;
            if (!(cloned.objects[l].form === state.objects[l].form))
                equal = false;
            if (!(cloned.objects[l].size === state.objects[l].size))
                equal = false;
        }
        

        console.log("Success of cloning is " + equal);
        console.log("---------------TEST DONE----------------");
    }

    export class Nworld implements N{
        states: WorldState;
        step: string;
        value: string;
        x: number;
        y: number;
        neighbours: [Nworld, number][] = [];
    }
}
