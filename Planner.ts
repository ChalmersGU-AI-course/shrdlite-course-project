///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
/// <reference path="graph/graph.ts" />
/// <reference path="graph/astar.ts" />
/// <reference path="graph/permutate.ts"/>
///<reference path="Utils.ts"/>

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
        
        //console.log("Stacks1: " + prettyMat(state.stacks));
        
        if(intprt != undefined && intprt.length > 0){
            var intList1 = intprt[0];
            //console.log("Planner INT1: " + intList1.toString());
            if(intList1.length > 0){
                var intList2 = intList1[0];
                //console.log("Planner INT2: " + intList2.toString());
                //console.log("Planner INT21: " + intList2.pol.toString());
                //console.log("Planner INT22: " + intList2.rel.toString());
                //console.log("Planner INT23: " + intList2.args.toString());
            }
        }
        
        var plan : string[] = [];
        
        var startStack = state.stacks;
        var arm = state.arm;
        
        var holding = state.holding;
        
        var dropPlan: string[] = []
       
        //console.log("holding: " + holding);
       
        var objectDropIndex: number = undefined;
        var armPositionWithoutDropPlan: number = state.arm;
       
        //Check if the arm is holding anything
        if(holding != null){
            //The arm holds something. "Drop" it at the first available place
            //TODO: kanske är dumt att bara lägga ner den, kan förvärra slutresultatet
            //console.log("starting to loop...");
            for(var i = 0; i < startStack.length; i++){
                //console.log("Looping: " + i);
                var bottomElement: string = undefined;
                
                if(startStack[i].length > 0){
                    bottomElement = startStack[i][startStack[i].length-1];
                }
                //console.log("bottomElement: " + bottomElement);
                
                if(validPlacement(holding, bottomElement, state.objects)){
                    //console.log("found valid placement! at index=" + i);
                    moveArmTo(dropPlan, arm, i);
                    arm = i;
                    dropPlan.push("d");
                    startStack[i].push(holding);
                    objectDropIndex = i;
                    break;
                }
            }
        } 
        //console.log("Stacks2.1: " + prettyMat(state.stacks));
        //console.log("Stacks2.2: " + prettyMat(startStack));
        
        var endStack = [[],["g","l", "e"],[],["k","m","f"],[]];
        
        //Create the graph
        var graph = new graphmodule.Graph<string[][]>();
        
        //Convert the startStack and starId to a node
        var startId = generateID(startStack);
        var startNode = new graphmodule.GraphNode<string[][]>(startId, startStack);
        
        //Add start node to the graph
        graph.addNode(startNode);
        
        //console.log("graph before A*: " + graph.toString());
        
        //Compute the shortest path!
        var path = astar.compute(graph, startId, 
            (node: graphmodule.GraphNode<string[][]>) => {
                var ret = false;
                for(var i=0; i<intprt.length; i++){
                    for(var j=0; j<intprt[i].length; j++){
                        var int = intprt[i][j];
                        if(check(int.args[0], int.rel, int.args[1], node.data)){
                            ret = true;
                        }else{
                            ret = false;
                            break;
                        }
                    }
                    if(ret){
                        break;
                    }
                }
                return ret;
            }
        ,
            (node:  string[][]) => {
                var minH = Number.POSITIVE_INFINITY;
                for(var i=0; i<intprt.length; i++){
                    var totalH = 0;
                    for(var j=0; j<intprt[i].length; j++){
                        var int = intprt[i][j];
                        totalH += heuristics(int.args[0], int.rel, int.args[1], node)
                    }
                    minH = Math.min(minH,totalH);
                }
                return minH;
            }
        ,
            (basedOn: graphmodule.GraphNode<string[][]>) => {
                return permutateBasedOn(basedOn, state.objects);
            }
        );
        
        //console.log("A* done!");
        
        if(path == undefined){
            plan.push("No path found. (ノ ゜Д゜)ノ ︵ ┻━┻");
            //console.log("------------planInterpretation returns 2------------");
            return plan;
        } else if(path.isEmpty()) {
            //console.log("The path is empty, meaning we're already in the final state.");
            //First we need to remove the object with ID objectID
            // from the worldstate, since we've cheated by putting it 
            // there while doing the A* search.
            if(objectDropIndex != undefined){
                //The object is now at column objectDropIndex
                startStack[objectDropIndex].pop();
            }
            //Now only do the dropPlan
            return dropPlan;
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
                
                var message: string = "Moving the " + getObject(state, objectID) + " to stack " + to
                plan.push(message);
                    
                if(first){
                    first = false;
                    
                    //First we need to remove the object with ID objectID
                    // from the worldstate, since we've cheated by putting it 
                    // there while doing the A* search.
                    if(objectDropIndex != undefined){
                        //The object is now at column objectDropIndex
                        startStack[objectDropIndex].pop();
                    }
                    
                    if(objectID == holding){
                        //The dropPlan was not executed, so reset the arm position
                        arm = armPositionWithoutDropPlan;
                        
                        moveArmTo(plan, arm, to);
                        arm = to;
                        plan.push("d");
                    } else {
                        plan.concat(dropPlan);
                        arm = moveObject(plan, arm, from, to);
                    }
                }else{
                    arm = moveObject(plan, arm, from, to);
                }
                    
                return true;
            }
        );
        
        //console.log("------------planInterpretation returns 3------------");
        return plan;
        
    }
    
    /** Move an object from the 'from' column index to the 'to' column index.
     *  Returns the updated arm location */
    function moveObject(plan: string[], arm: number, from: number, to: number){
        //Move the arm to the pick-up point
        moveArmTo(plan, arm, from);
        //Say that the arm is now there
        arm = from;
        //Pick up the object
        plan.push("p");
        //Move the arm to the drop-off point
        moveArmTo(plan, arm, to);
        //Say that the arm is now there
        arm = to;
        //Drop the object
        plan.push("d");
        return to;
    }
    
    function prettyMat(mat: string[][]){
        var prettyString = "[";
        for(var i=0; i<mat.length; i++){
            prettyString+="[";
            for(var j=0; j<mat[i].length; j++){
                prettyString+= mat[i][j] + "";
                if(j!=mat[i].length-1){
                    prettyString+=",";
                }
            }
            prettyString+="]";
            if(i!=mat.length-1){
                prettyString+=",";
            }
        }
        prettyString+="]";
        return prettyString;
    }
    
    function getObject(world: WorldState, id: string){
        var object =  world.objects[id];
        return object.size + " " + object.color + " " + object.form;
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
        //console.log("Planner.moveArmTo: ______________________");
        //console.log("Planner.moveArmTo: arm=" + arm);
        //console.log("Planner.moveArmTo: to=" + to);
        //console.log("Planner.moveArmTo: ----------------------");
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
        //console.log("Planner.moveArmTo: arm=" + arm);
        //console.log("Planner.moveArmTo: to=" + to);
        //console.log("Planner.moveArmTo: ______________________");
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
