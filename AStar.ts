///<reference path='collections.ts'/>
///<reference path='World.ts'/>
///<reference path='Interpreter.ts'/>

//Implementation of A* alogithm that fits Shrdlite
module AStar {
 
    //Interface for holding important information of a state.
    export interface Node
    {
        wStateId : string;
        wState: Object;
        neighbours: Neighbour [];
        fscore?: number;
        hweight? : number;
        id?: number;
    }
    
    //Interface for holding information of a states neighbour.
    export interface Neighbour
    {
        wState: Object;
        cmd: string;
    }
    
    //Compare function that is needed for the priority queue.
    function compareT(a:Node,b:Node)
    {
        if(a.fscore == null || b.fscore == null)
        {
            return 1
        }
        if(a.fscore < b.fscore)
        {
            return 1
        }
        if(a.fscore > b.fscore)
        {
            return -1
        }
        
        return 0
    }
    
    //A* function that needs a start object, goal function, hueristic function, a function to create nodes, and a map of the objects least needed attributes.
    export function astar(lit:Interpreter.Literal[][],startObject,goalFunction,huerFunction,getNode,uniqueAttr) : string[]
    {
        var closedSet : Node[] = [];
        var openSet = new collections.PriorityQueue<Node>(compareT);
        
        var startNode : Node = getNode(startObject);
        openSet.add(startNode);
        
        var came_from : {[key:string]:[Node,string]} = {};
        
        var g_score : {[key:string]:number} = {};
        g_score[startNode.wStateId] = 0;
        
        var f_score : number [] = [];
        f_score[startNode.wStateId] = g_score[startNode.wStateId] + huerFunction(lit,startNode.wState);
        
        while(!openSet.isEmpty())
        {
            var current = openSet.dequeue();
            if (goalFunction(lit,current.wStateId))
            {
                return reconstruct_path(came_from, current, uniqueAttr);
            }
            
            closedSet.push(current);
            for(var ei in current.neighbours)
            {
                var e : Neighbour = current.neighbours[ei];
                
                var eNeigh : [Node,string] = [getNode(e.wState),e.cmd];
                
                if (!arrayIsMember(eNeigh[0].wStateId,closedSet))
                {
                    var tentative_g_score :number = g_score[current.wStateId] + 1;
                    
                    if(!openSet.contains(eNeigh[0]) || tentative_g_score < g_score[eNeigh[0].wStateId])
                    {
                        came_from[eNeigh[0].wStateId] = [current,eNeigh[1]];
                        g_score[eNeigh[0].wStateId] = tentative_g_score;
                        f_score[eNeigh[0].wStateId] = g_score[eNeigh[0].wStateId] + huerFunction(lit,eNeigh[0].wState);
                        eNeigh[0].fscore = f_score[eNeigh[0].wStateId];
                        openSet.enqueue(eNeigh[0]);
                    }
                }
            }
        }
        return [];
    }
    
    //Reconstructs the path, converts the edges to shrdlite instructions and get description for the AI's movements.
    function reconstruct_path (came_from, current, uniqueAttr) : string[]
    {
        var total_path : string[] = [];
        var obj1 : string; 
        var obj2 : string; 
        var result : string ="";
        var sugar : string;  
        var derp : string;
        var i : number = 0; 
        var curr2 = current;
        
        while(came_from[current.wStateId] != null)
        {
            if(result !== "" && came_from[current.wStateId][1] === "d" )
            {
                total_path.push(sugar + result);
                result = "";
            }
            
            total_path.push(came_from[current.wStateId][1]);
            
            if (total_path[total_path.length-1] === "d")
            {
                if(i == 0)
                {
                    sugar = "Finally ";
                    i = 1;
                }
                else
                    sugar = "Then ";
                var obj = current.wState.stacks[current.wState.arm][current.wState.stacks[current.wState.arm].length-1];
                obj1 = uniqueAttr[obj].slice().reverse().join(" ");
                
                if( i == 1 && curr2.wState.holding !== null && (typeof (curr2.wState.holding) !== "undefined") )
                {
                    result = uniqueAttr[curr2.wState.holding].slice().reverse().join(" ");
                    total_path.push(sugar + "I pick up the " + result);
                    i = 2; 
                    sugar = "Then ";
                }
                
                if(current.wState.stacks[current.wState.arm].length >1)
                {
                    var objs = current.wState.stacks[current.wState.arm][current.wState.stacks[current.wState.arm].length-2];
                    obj2 = uniqueAttr[objs].slice().reverse().join(" ");
                    result = ("I move the " + obj1 + " on the " + obj2);
                }
                else
                {
                    result = ("I move the " + obj1 + " on the floor");
                }
            }
            current = came_from[current.wStateId][0];
        }
        
        if(result.length > 1)
            total_path.push("Firstly " + result);
            
        return total_path;
    }

    //Function for checking if a given string exist in a given array.
    function arrayIsMember (e : string, array) : boolean
    {
        for(var i in array)
        {
            var v : string = array[i].wStateId;
            if(e===v)
            {
                return true;
            }
        }
        return false;
    }
}
