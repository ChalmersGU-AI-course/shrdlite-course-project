///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>


class Shortestpath implements Graph<number[]>{   // index 0 = x, index 1 = y
     _nodeValues : Array<WorldState>;
    _nodeneighbors : Array<Array<WorldState>>;   //neighboring nodes to index node 
    _edges : Array<Array<WorldState>>;        //from index node a to index node b
    //_width : number;
    //_heigth : number;
    _heuristicWeight : number;

    constructor(heuristic:number){
        this._heuristicWeight = heuristic;
        //this._width = size;
        //this._heigth = size;
        this._nodeValues = [];
        var index = 0;
        //for(var i = 0; i < this._width; i++){
        //    for(var j = 0; j < this._heigth; j++){
          //      this._nodeValues[index] = [i,j];  
                index ++;  
        //    }
        //}  
        //this._nodeneighbors = [[1,2],[4],[3],[5],[]];
        //this._edges         = [[2,3],[2],[3],[3],[]];
        
    }

    
    getneighbors(node :number):Array<number>{
        var state : WorldState = this._nodeValues[node];
        //var cur = this._nodeValues[node];
        var neig :Array<WorldState> = [];
        var neigNumbers : Array<number>;
        //var found;
        //only if not it nodevalues
        if(state.arm > 1){
            neig.push(state);
            neig[neig.length].arm = state.arm-1;
        }
        if(state.arm < GetFloorSize(state)){
            neig.push(state);
            neig[neig.length].arm = state.arm+1;
        }
        if(state.holding != ""){
            neig.push(state);
            
            //Already holding, drop at position
             /* find object on top at positon, set as index, add relation on top between holding
             item and the current on top */ 
            var newobj : predicate;
             newobj.rel = "ontop";
             newobj.args = [neig[2].holding, state.pddl[index].args[0]];
             //neig[neig.length].holding = state.pddl.push(newobj)
             state.pddl.push(newobj);
             neig[neig.length].holding = "";
        }else if(false /* object in position */) {
            neig.push(state);
            //not holding, pick at position    
            /* find object on top at positon, set as index, remove relation, and add object to pddl.holding */ 
            var index:number=1;
            
            neig[neig.length].holding = state.pddl[index].args[0];
            neig[neig.length].pddl.splice(index, 1);
        }
        for(var i = 0; i < neig.length;i++){
            var bflag:boolean = false;
            for(var j = 0; j <  this._nodeValues.length;j++){
                if(neig[i].arm !=  this._nodeValues[j].arm && neig[i].holding !=  this._nodeValues[j].holding){
                    //if arm is different positon, no need to check rest????
                    for(var k = 0; k < state[j].pddl.length;k++){
                        if(neig[i].pddl==state[j].pddl[k]){
                            bflag=true;
                            break;
                        }
                    }
                }
                if(bflag){break;}
            }
            if(!bflag){
                //New node did not excist before, so add it
                //if new node exist, do not return that.(no need to go back)
                 this._nodeValues.push(neig[i]);
                neigNumbers.push( this._nodeValues.length);
            }   
        }
        //Add new to nodevalues, return new indexes
        return neigNumbers; 
    }
    
    getcost(from: number,to:number):number{
        return 1;
    }
    

    //counts objects on top of given object
    countOnTop(a:ObjectDefinition, pddls:predicate[]):number{
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

    amountOfTiles(a:ObjectDefinition, state:WorldState, pddls:predicate[]){
        var counter = 0;
        counter += this.findPosition(a,state, pddls);
        
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
    findPosition(a:ObjectDefinition, state:WorldState, pddls:predicate[]):number{
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

    heuristic_cost_estimate(current:number, goal:number):number{//some parts can be improved
        var cond = this._nodeValues[goal];
        var state = this._nodeValues[current];
        var a = state.objects[cond.args[0]];
        var b = state.objects[cond.args[1]];
        var pddls = state.pddl.toArray();
        var count = 0;
        var samePile:boolean = false;

        if(cond.rel == "ontop" || cond.rel == "inside"){
            //if a above b, take #objects on b * 4 + (ifnotinsamepile)#objects on a*4 + distancefromcrane to a + distancefromatob
            if(state.holding == a && this.countOnTop(b,pddls) == 0){//check if a's stack is full
                return 1 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            }
            else if(state.holding == b){
                return 1+ this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
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
                count = count * 4 + Math.abs(this.findPosition(a,state,pddls)-state.arm) + Math.abs(this.findPosition(a,state,pddls)
                 - this.findPosition(b,state,pddls));
                

            }
            else{
               count = count*4 + Math.abs(this.findPosition(a,state,pddls) - state.arm) + 3;//if they are in the same pile but not finished, a will require 3 more moves to get back
            }
            return count; 

        }
        else if(cond.rel == "above"){
            if(state.holding == a){//check if a's stack is full
                return 1 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            }
            else if(state.holding == b){
                return 1+ this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
            }
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls) && this.countOnTop(b,pddls) > this.countOnTop(a,pddls))//check if completed
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
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls))
                   count += 3 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            else{
                count += Math.abs(this.findPosition(a,state,pddls)-state.arm) + Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls));
            }

            return count;
        }
        else if(cond.rel == "under"){
            if(state.holding == b){//check if a's stack is full
                return 1 + Math.abs(this.findPosition(a,state,pddls) - state.arm);
            }
            else if(state.holding == a){
                return 1+ this.countOnTop(b,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm)*2;
            }
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls) && this.countOnTop(b,pddls) < this.countOnTop(a,pddls))
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
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls))
                count += 3 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            else{
                count += Math.abs(this.findPosition(b,state,pddls)-state.arm) + Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls));
            }

            return count;
        }
        else if(cond.rel == "rightof"){//currently not handling if B is in holding

            if(state.holding == a && this.findPosition(b,state,pddls) != this.amountOfTiles(b,state,pddls)){
                return Math.abs(this.findPosition(b,state,pddls)-state.arm+1); // currently not checking if stack next to b is full

            }
            else if(state.holding == b){
                return 1+ this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
            }

            if(this.findPosition(b,state,pddls) == this.amountOfTiles(b,state,pddls)){//not perfect
                count = this.countOnTop(a,pddls)*4 + this.countOnTop(b,pddls) + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;//not working if both in the last stack?
            }

            if(this.countOnTop(b,pddls)>this.countOnTop(a,pddls)){

                count = this.countOnTop(b,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm) + (Math.abs(this.findPosition(a,state,pddls)
                -this.findPosition(b,state,pddls)+1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm) + (Math.abs(this.findPosition(a,state,pddls)
                    -this.findPosition(b,state,pddls)+1))+2;
            }

        }
        else if(cond.rel == "leftof"){
            if(state.holding == a && this.findPosition(b,state,pddls) != 0){
                return Math.abs(this.findPosition(b,state,pddls)-state.arm-1); // currently not checking if stack next to b is full

            }
            else if(state.holding == b){
                if(this.amountOfTiles(a,state,pddls) == state.arm)
                    return 2+ this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
                return 1+ this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
            }

            if(this.findPosition(b,state,pddls) == 0){//not perfect
                count = this.countOnTop(a,pddls)*4 + this.countOnTop(b,pddls) + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;
            }

            else if(this.countOnTop(b,pddls)>this.countOnTop(a,pddls)){

                count = this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move B
                count = this.countOnTop(b,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;
            }

        }
        else if(cond.rel == "beside"){
            if(state.holding == a){
                return Math.abs(this.findPosition(b,state,pddls)-state.arm)-1; // currently not checking if stack next to b is full
            }
             else if(state.holding == b){
                return 1 + Math.abs(this.findPosition(a,state,pddls)-state.arm)-1;
            }
            if(this.countOnTop(b,pddls)>this.countOnTop(a,pddls)){

                count = this.countOnTop(b,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls))-1)+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = this.countOnTop(a,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)
                 + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls))-1)+2;
            }
            // a on floor? #objects on top of b + #objects leftofA < rightofA

        }
        console.log("Path length: " + count);
        return count;

    }
    specialIndexOf(obj:number[]):number {    
        for (var i = 0; i < this._nodeValues.length; i++) {
            if (this._nodeValues[i][0] == obj[0] && this._nodeValues[i][1] == obj[1]) {
                return i;
            }
        }
        return -1;
    }
    reachedGoal(current: number, cond : number[]):boolean{
       var state = this._nodeValues[current];
        for(var i = 0; cond.length; i++ ){
            if(!checkGoal(cond[i], state))
                return false;
        }
        return true;
    }

    checkGoal(current:number, goal:number):boolean {
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


function GetFloorSize(state : WorldState):number{
    var nFloors : number = 0;
    do{
        nFloors++;
        for(var i = 0; i < state.pddl.length; i++){
            var temp : collections.Set<predicate> = state.pddl[i];
            var found : boolean = (temp.args[0]=="f" + nFloors);
            if(found){
                break;
            }
        }
        
     }while(!found)           
    return nFloors;
}


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




    
    
    
}
