///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>

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

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        // This function returns a dummy plan involving a random stack
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


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }


         private reachedGoal(cond: Literal[], state : WorldState):boolean{
        for(var i = 0; cond.lenght; i++ ){
            if(!checkGoal(cond[i], state))
                return false;
        }
        return true;
    }

    private checkGoal(cond: Literal, state : Worldstate):boolean {
        var a = state.objects[cond.args[0]];
        var b = state.objects[cond.args[1]];
        var pddls = state.pddl.toArray();

        if(cond.rel == "above"){
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(x == a){
                    var y = pddl.args[1];
                    if(y == b)
                        return true;
                    else if(state.objects[y].form == "floor") //hopefully this is the correct syntax
                        return false;
                    else{
                       a=x;
                       index =-1;
                    }
                }
            }
        }
        else if(cond.rel == "ontop" || cond.rel == "inside"){
            for(var index = 0; index < pddls.length; index++){
                 var pddl = pddls[index];
                 if(pddl.args[0] == a){
                    if(pddl.args[1] == b)
                        return true;
                    return false;
                 }
            }
        }
        else if(cond.rel == "under"){
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(x == b){
                    var y = pddl.args[1];
                    if(y == a)
                        return true;
                    else if(state.objects[y].form == "floor") 
                        return false;
                    else{
                       b=x;
                       index =-1;
                    }
                }
            }
            
        }
        else if(cond.rel == "beside"|| cond.rel == "rightof"|| cond.rel == "leftof"){
            if(cond.rel == "beside"|| cond.rel == "rightof"){
                //find floor (a is rightof b, so floor to left of floor and search upwards)
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(x == a){
                        if(state.objects[pddl.args[1]].form == "floor")
                            var floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "rightof" && x == floor){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexLeft = 0; indexLeft < pddls.length; indexLeft++){
                    var pddl = pddls[indexLeft];
                    var x = pddl.args[1];
                    if(x == floor2){
                        if(pddl.args[0]== b)
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexLeft = -1;
                        }
                    }

                }

            }
            if(cond.rel == "beside"|| cond.rel == "leftof"){
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(x == a){
                        if(state.objects[pddl.args[1]].form == "floor")
                            var floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "leftof" && x == floor){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexRight = 0; indexRight < pddls.length; indexRight++){
                    var pddl = pddls[indexRight];
                    var x = pddl.args[1];
                    if(x == floor2){
                        if(pddl.args[0]== b)
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexRight = -1;
                        }
                    }

                }
            }
            return false;
            
        }
        return true;
    }
}
