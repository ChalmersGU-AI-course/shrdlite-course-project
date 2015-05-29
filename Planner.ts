///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
/// <reference path="graph/graph.ts" />
/// <reference path="graph/astar.ts" />
/// <reference path="graph/permutate.ts"/>
/// <reference path="heuristic/Heuristic.ts"/>
///<reference path="Utils.ts"/>

module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];
        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            if(plan.plan != undefined && plan.plan != null && plan.plan.length > 0 && plan.plan[0].indexOf("!") !== 0){
                plans.push(plan);
            }
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

    /*
    {cmd: "move",
      ent: {quant: "the",
            obj: {obj: {size: null, color: "white", form: "ball"},
                  loc: {rel: "inside",
                        ent: {quant: "any",
                              obj: {size: null, color: null, form: "box"}}}}},
      loc: {rel: "ontop",
            ent: {quant: "the",
                  obj: {size: null, color: null, form: "floor"}}}}
    
    
    export interface Literal {pol:boolean; rel:string; args:string[];}
    */

    //////////////////////////////////////////////////////////////////////
    // private functions

    // HERE IS THE PLACE WHERE WE SHOULD IMPLEMENT OUR PLANNER!
    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
    
        console.log("------------planInterpretation start------------");
        
        if(intprt == undefined || intprt.length == 0){
            //No interpretation was found
            return ["! - No valid interpretation was found. Please try again"];
        }
        
        var plan : string[] = [];
        
        var startStacks = state.stacks;
        var arm = state.arm;
        
        var holding = state.holding;
        
        var dropPlan: string[] = [];
       
        var objectDropIndex: number = undefined;
        var armPositionWithoutDropPlan: number = state.arm;
       
        //Check if the arm is holding anything
        if(holding != null){
            //hack to not do anything, if we want to hold what we are already holding.
            if(intprt.length == 1 && intprt[0].length == 1 &&
               intprt[0][0].rel == "holding" && intprt[0][0].args[0] == holding){
                plan.push("Done");
                return plan;
            }
            //The arm holds something. "Drop" it at the first available place
            for(var i = 0; i < startStacks.length; i++){
                //console.log("Looping: " + i);
                var bottomElement: string = undefined;
                
                if(startStacks[i].length > 0){
                    bottomElement = startStacks[i][startStacks[i].length-1];
                }
                
                if(validPlacement(holding, bottomElement, state.objects)){
                    dropPlan.push("dropping " + getObject(state.objects,holding));
                    moveArmTo(dropPlan, arm, i);
                    arm = i;
                    dropPlan.push("d");
                    startStacks[i].push(holding);
                    objectDropIndex = i;
                    break;
                }
            }
        }
        
        //Create the graph
        var graph = new graphmodule.Graph<string[][]>();
        
        //Convert the startStacks and starId to a node
        var startId = generateID(startStacks);
        var startNode = new graphmodule.GraphNode<string[][]>(startId, startStacks);
        
        //Add start node to the graph
        graph.addNode(startNode);
        
        var usedIntprt;
        
        
        //Compute the shortest path!
        var path = astar.compute(graph, startId,
            //Satisfying state function.
            (node: graphmodule.GraphNode<string[][]>) => {
                var ret = false;
                for(var i=0; i<intprt.length; i++){
                    for(var j=0; j<intprt[i].length; j++){
                        var int = intprt[i][j];
                        var n = 1;
                        if(int.rel == "holding"){
                            n = 0;
                        }
                        if(check(int.args[0], int.rel, int.args[n], node.data)){
                            ret = true;
                        }else{
                            ret = false;
                            break;
                        }
                    }
                    if(ret){
                        usedIntprt = intprt[i];
                        break;
                    }
                }
                return ret;
            }
        ,    //Heuristics
            (node:  string[][]) => {
                var minH = Number.POSITIVE_INFINITY;
                for(var i=0; i<intprt.length; i++){
                    var totalH = 0;
                    for(var j=0; j<intprt[i].length; j++){
                        var int = intprt[i][j];
                        if(int.rel == "holding"){
                            totalH += heuristics.heuristics(int.args[0], int.rel, int.args[0], node);
                        }
                        totalH += heuristics.heuristics(int.args[0], int.rel, int.args[1], node);
                    }
                    minH = Math.min(minH,totalH);
                }
                return minH;
            }
        ,
            (basedOn: graphmodule.GraphNode<string[][]>, prevNode: graphmodule.GraphNode<string[][]>) => {
                return permutateBasedOn(basedOn, prevNode, state.objects, graph);
            }
        );
        
        //console.log("A* done!");
         
        if(path == undefined){
            plan.push("No path found. (ノ ゜Д゜)ノ ︵ ┻━┻");
            return plan;
        } else if(path.isEmpty()) {
            console.log("path is empty adding drop plan");
            //Now only do the dropPlan
            plan = plan.concat(dropPlan);
        }
        
        var first = true;
        
        //For each edge in the found path...
        path.path.forEach(
            (edge: graphmodule.Edge<string[][]>) => {
                var fromState = edge.from.data;
                var toState = edge.to.data;
                var from = movedFrom(fromState, toState)
                var to = movedTo(fromState, toState)
                
                //ID for the object that was moved
                var objectID = fromState[from][fromState[from].length-1];
                var objectStr = getObject(state.objects, objectID);
                
                if(first){
                    first = false;
                    if(objectID == holding){
                        console.log("fancy drop plan");
                        //The dropPlan was not executed, so reset the arm position
                        arm = armPositionWithoutDropPlan;
                        
                        moveArmTo(plan, arm, to);
                        arm = to;
                        plan.push("Dropping the " + objectStr);
                        plan.push("d");
                    } else {
                        console.log("regular drop plan");
                        plan = plan.concat(dropPlan);
                        arm = moveObject(plan, arm, from, to, objectStr);
                    }
                } else {
                    arm = moveObject(plan, arm, from, to, objectStr);
                }
                    
                return true;
            }
        );
        
        var endStacks = startStacks;
        if(!path.isEmpty()){
            endStacks = path.path.last().to.data;
        }
        //Add pick up to plan if needed
        for(var i=0; i<usedIntprt.length; i++){
            if(usedIntprt[i].rel == "holding"){
                console.log("needs to do a pick up");
                var j=0;
                console.log("first top object " + endStacks[j][endStacks[j].length-1]);
                while(++j<endStacks.length && endStacks[j-1][endStacks[j-1].length-1] != usedIntprt[i].args[0]);
                j--;
                plan.push("Picking up the " + getObject(state.objects, usedIntprt[i].args[0]));
                moveArmTo(plan, arm, j);
                arm = j;
                plan.push("p");
                break;
            }
        }
        plan.push("Done");
        
        //If we added the held object to the stacks, remove it
        // from the worldstate, since we've cheated by putting it 
        // there while doing the A* search.
        if(objectDropIndex != undefined){
            //The object is now at column objectDropIndex
            startStacks[objectDropIndex].pop();
        }
        return plan;
        
    }
    
    /** Move an object from the 'from' column index to the 'to' column index.
     *  Returns the updated arm location */
    function moveObject(plan: string[], arm: number, from: number, to: number, objectStr: string){
        //Move the arm to the pick-up point
        moveArmTo(plan, arm, from);
        //Say that the arm is now there
        arm = from;
        //Pick up the object
        plan.push("Picking up the " + objectStr);
        plan.push("p");
        //Move the arm to the drop-off point
        plan.push("Moving the " + objectStr + " to the " + (to-from > 0 ? "right" : "left"));
        moveArmTo(plan, arm, to);
        //Say that the arm is now there
        arm = to;
        //Drop the object
        plan.push("Dropping the " + objectStr);
        plan.push("d");
        return to;
    }
    
    /** Finds from which stack (index) an object was moved */
    function movedFrom(from: string[][], to: string[][]){
        for(var i = 0; i < from.length; i++){
            if(from[i].length>to[i].length){
                return i;
            }
        }
        return undefined;
    }
    
    function movedTo(from: string[][], to: string[][]){
        return movedFrom(to, from);
    }
    
    function moveArmTo(plan: string[], arm: number, to: number){
        if(arm == undefined || to == undefined){
            throw new Planner.Error("moveArmTo: arm or to is undefined!");
        }
        
        while(arm!=to){
            if(arm < to){
                arm++;
                plan.push("r")
            }else{
                arm--;
                plan.push("l")
            }
        }
    }
    
    function matrixEquality(first: string[][], second: string[][]):boolean{
        for(var i = 0; i < first.length; i++){
            if(first[i].length != second[i].length){
                return false;
            }
            for(var j = 0; j < first[i].length; j++){
                if(first[i][j] != second[i][j]){
                    return false;
                }
            }
        }
        return true;
    }

}
