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




    function heuristic_cost_estimate(current:number, goal:number):number{//some parts can be improved
        var cond = this._nodeValues[goal];
        var state = this._nodeValues[current];
        var a = state.objects[cond.args[0]];
        var b = state.objects[cond.args[1]];
        var pddls = state.pddl.toArray();
        var count = 0;
        var samePile:boolean = false;

        if(cond.rel == "ontop" || cond.rel == "inside"){
            //if a above b, take #objects on b * 4 + (ifnotinsamepile)#objects on a*4 + distancefromcrane to a + distancefromatob
            if(state.holding == a && countOnTop(b,pddls) == 0){//check if a's stack is full
                return 1 + Math.abs(findPosition(b,state,pddls) - state.arm);
            }
            else if(state.holding == b){
                return 1+ countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm)*2;
            }
            
            var z = b;
            //traverse up through b;
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(x == z){
                    if(pddl.args[0]== a){
                        if(pddl.args[1]==b)
                            return 0;
                        samePile = true;

                    }
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            //if a is not in the same pile as b, check how many objects on top of a
            if(!samePile){
                z=a;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[1];
                    if(x == z){
                       
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    
                    }

                }
                //check distance from crane to a + distance from a to b, also multiply count by 4(number of moves for each object)
                count = count * 4 + Math.abs(findPosition(a,state,pddls)-state.arm) + Math.abs(findPosition(a,state,pddls)
                 - findPosition(b,state,pddls));
                

            }
            else{
               count = count*4 + Math.abs(findPosition(a,state,pddls) - state.arm) + 3;//if they are in the same pile but not finished, a will require 3 more moves to get back
            }
            return count; 

        }
        else if(cond.rel == "above"){
            if(state.holding == a){//check if a's stack is full
                return 1 + Math.abs(findPosition(b,state,pddls) - state.arm);
            }
            else if(state.holding == b){
                return 1+ countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm)*2;
            }
            if(findPosition(a,state,pddls) == findPosition(b,state,pddls) && countOnTop(b,pddls) > countOnTop(a,pddls))//check if completed
                return 0;
            var z = a;
            //traverse up through a;
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(x == z){
                    if(pddl.args[0]== b)
                        samePile = true;
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            count = count*4;
            if(findPosition(a,state,pddls) == findPosition(b,state,pddls))
                   count += 3 + Math.abs(findPosition(b,state,pddls) - state.arm);
            else{
                count += Math.abs(findPosition(a,state,pddls)-state.arm) + Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls));
            }

            return count;
        }
        else if(cond.rel == "under"){
            if(state.holding == b){//check if a's stack is full
                return 1 + Math.abs(findPosition(a,state,pddls) - state.arm);
            }
            else if(state.holding == a){
                return 1+ countOnTop(b,pddls)*4 + Math.abs(findPosition(b,state,pddls)-state.arm)*2;
            }
            if(findPosition(a,state,pddls) == findPosition(b,state,pddls) && countOnTop(b,pddls) < countOnTop(a,pddls))
                return 0;
            var z = b;
            //traverse up through b;
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(x == z){
                    if(pddl.args[0]== a)
                        samePile = true;
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            count = count*4;
            if(findPosition(a,state,pddls) == findPosition(b,state,pddls))
                count += 3 + Math.abs(findPosition(b,state,pddls) - state.arm);
            else{
                count += Math.abs(findPosition(b,state,pddls)-state.arm) + Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls));
            }

            return count;
        }
        else if(cond.rel == "rightof"){//currently not handling if B is in holding

            if(state.holding == a && findPosition(b,state,pddls) != amountOfTiles(b,state,pddls)){
                return Math.abs(findPosition(b,state,pddls)-state.arm+1); // currently not checking if stack next to b is full

            }
            else if(state.holding == b){
                return 1+ countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm)*2;
            }

            if(findPosition(b,state,pddls) == amountOfTiles(b,state,pddls)){//not perfect
                count = countOnTop(a,pddls)*4 + countOnTop(b,pddls) + Math.abs(findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls)-1))+2;//not working if both in the last stack?
            }

            if(countOnTop(b,pddls)>countOnTop(a,pddls)){

                count = countOnTop(b,pddls)*4 + Math.abs(findPosition(b,state,pddls)-state.arm) + (Math.abs(findPosition(a,state,pddls)
                -findPosition(b,state,pddls)+1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm) + (Math.abs(findPosition(a,state,pddls)
                    -findPosition(b,state,pddls)+1))+2;
            }

        }
        else if(cond.rel == "leftof"){
            if(state.holding == a && findPosition(b,state,pddls) != 0){
                return Math.abs(findPosition(b,state,pddls)-state.arm-1); // currently not checking if stack next to b is full

            }
            else if(state.holding == b){
                if(amountOfTiles(a,state,pddls) == state.arm)
                    return 2+ countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm)*2;
                return 1+ countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm)*2;
            }

            if(findPosition(b,state,pddls) == 0){//not perfect
                count = countOnTop(a,pddls)*4 + countOnTop(b,pddls) + Math.abs(findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls)-1))+2;
            }

            else if(countOnTop(b,pddls)>countOnTop(a,pddls)){

                count = countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm) 
                + (Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls)-1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move B
                count = countOnTop(b,pddls)*4 + Math.abs(findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls)-1))+2;
            }

        }
        else if(cond.rel == "beside"){
            if(state.holding == a){
                return Math.abs(findPosition(b,state,pddls)-state.arm)-1; // currently not checking if stack next to b is full
            }
             else if(state.holding == b){
                return 1 + Math.abs(findPosition(a,state,pddls)-state.arm)-1;
            }
            if(countOnTop(b,pddls)>countOnTop(a,pddls)){

                count = countOnTop(b,pddls)*4 + Math.abs(findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls))-1)+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = countOnTop(a,pddls)*4 + Math.abs(findPosition(a,state,pddls)-state.arm)
                 + (Math.abs(findPosition(a,state,pddls)-findPosition(b,state,pddls))-1)+2;
            }
            // a on floor? #objects on top of b + #objects leftofA < rightofA

        }
        console.log("Path length: " + count);
        return count;

    }
    //counts objects on top of given object
    function countOnTop(a:string, pddls:predicate[]):number{
        var counter = 0;
        var z = a;
         for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(x == z){
                z = pddl.args[0];
                index = -1;
                counter++;
            }
        }
        return counter;
    }

    function amountOfTiles(a:string, state:WorldState, pddls:predicate[]){
        var counter = 0;
        counter += findPosition(a,state, pddls);
        
        var floor;
        var x = a;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(pddl.args[0] == x){
                if(state.objects[pddl.args[1]].form == "floor") {
                    //found floor
                    floor = state.objects[pddl.args[1]];//----------------------------------
                }
                else{
                    x = pddl.args[1];
                    index = -1;
                }
            }
        }
        //time to move rightwards along the floors
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(pddl.rel == "righttof" &&  pddl.args[1] == floor){
                floor = pddl.args[0];
                index = -1;
                counter ++;
            }
        }
        return counter;
    }


    //returns x-pos (0->x) for object a
    function findPosition(a:string, state:WorldState, pddls:predicate[]):number{
       var x = a;
       var position = 0;
       var floor;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(pddl.args[0] == x){
                if(state.objects[pddl.args[1]].form == "floor") {
                    //found floor
                    floor = state.objects[pddl.args[1]];
                }
                else{
                    x = pddl.args[1];
                    index = -1;
                }
            }
        }
        //time to move leftwards along the floors
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(pddl.rel == "leftof" &&  pddl.args[1] == floor){
                floor = pddl.args[0];
                index = -1;
                position ++;
            }
        }
        return position;
    }
    
    function reachedGoal(current: number, cond : number[]):boolean{
       var state = this._nodeValues[current];
        for(var i = 0; cond.length; i++ ){
            if(!checkGoal(cond[i], state))
                return false;
        }
        return true;
    }

    function checkGoal(current:number, goal:number):boolean {
        var cond = this._nodeValues[goal];
        var state = this._nodeValues[current];
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
