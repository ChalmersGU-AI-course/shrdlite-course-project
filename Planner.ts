///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="search/AStar.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            //TODO: sort for shortest plan, error handling(null)?
            return plans;
        } else {
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

    module physicalLaws {

        //Check the validity for arm pickups
        function possibleArmPickup (obj : string, state : WorldState) : boolean {
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
        function validPosition(topObj: ObjectDefinition, bottomObj: ObjectDefinition, state: WorldState): boolean {

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

    }

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        
        /*
            TODO: Structure for planning
                - Filter out obviously invalid interpretations
                -- Check object physics
                -- Check spatial relations
                - Calculate heuristic values on every interpretation
                - Do A*
                - Sort the interpretations with the one involving least steps first
                - Convert to basic actions
        */
       
      
      // This function returns a dummy plan involving a random stac
        do {
            var pickstack = getRandomInt(state.stacks.length);
        } while (state.stacks[pickstack].length == 0);
        var plan : string[] = [];

        // First move the arm to the leftmost nonempty stack
        if (pickstack < state.arm) {
            plan.push("Moving left");
            for (var i = state.arm; i > pickstack; i--) {
                plan.push("l");
            }
        } else if (pickstack > state.arm) {
            plan.push("Moving right");
            for (var i = state.arm; i < pickstack; i++) {
                plan.push("r");
            }
        }

        // Then pick up the object
        var obj = state.stacks[pickstack][state.stacks[pickstack].length-1];
        plan.push("Picking up the " + state.objects[obj].form,
                  "p");

        if (pickstack < state.stacks.length-1) {
            // Then move to the rightmost stack
            plan.push("Moving as far right as possible");
            for (var i = pickstack; i < state.stacks.length-1; i++) {
                plan.push("r");
            }

            // Then move back
            plan.push("Moving back");
            for (var i = state.stacks.length-1; i > pickstack; i--) {
                plan.push("l");
            }
        }

        // Finally put it down again
        plan.push("Dropping the " + state.objects[obj].form,
                  "d");

        return plan;
    }



    function checkSpatialRelations(intp : Interpreter.Literal[], objects : ObjectDefinition) : boolean{
        // Check so that each spatial relation holds between the elements
        // Inside
        // Ontop
        var rel = intp[0].rel;
        if(rel === "inside"){
            // * Several things cannot be in one box
            // * Target is a box 
            var stateSet = new collections.Set<string>(); // To know that one box contain one thing
            for(var i = 0; i < intp.length; i++){
                var target = intp[i].args[1];
                var obj    = intp[i].args[0];

                // Check that target is a box.
                if(objects[target].form !== 'box'){
                    console.log("Removed interpretation: ");
                    console.log(intp[i]);
                    console.log("Due to target is not a box.");
                    return false;
                }

                if(stateSet.contains(target)){
                    console.log("Removed interpretation: ");
                    console.log(intp[i]);
                    console.log("Due to bad spatial inside relation");
                    return false; // Two things cannot be inside the same box
                }else{
                    stateSet.add(target); // Add the target so we know that it is occupied.
                }
            }
            return true;

        }else if(rel === "ontop"){ 
            var stateSet = new collections.Set<string>();
            for(var i = 0; i < intp.length; i++){
                var target = intp[i].args[1];
                var obj    = intp[i].args[0];
                if(objects[target].form === 'box'){
                    return false; // Things are inside a box, not ontop. Or is this too harsh?
                }
                if(stateSet.contains(target)){
                    return false;
                }else{
                    stateSet.add(target);
                }

            }
            return true;
            }
        }
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

}
