///<reference path='collections.ts'/>
///<reference path='World.ts'/>
///<reference path='Interpreter.ts'/>


module AStar {
 

    export interface Node
    {
        wStateId : string;
        wState: Object;
        neighbours: Neighbour [];
        fscore?: number;
        hweight? : number;
        id?: number;
    }
    
    export interface Neighbour
    {
        wState: Object;
        cmd: string;
    }
    
    
    //TBD
    function compareT(a:Node,b:Node)
    {
        if(a.fscore == null || b.fscore == null)
        {
            return 1
        }
        if(a.fscore < b.fscore) // a is greater than b
        {
            return 1
        }
        if(a.fscore > b.fscore) //a is less than b
        {
            return -1
        }
        
        return 0
    }
    
    export function astar(lit:Interpreter.Literal[],startObject,goalFunction,huerFunction,getNode,uniqueAttr) : string[]
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
                //console.log(openSet);
                console.log("NU ÄR JAG FÄRDIG!")
                return reconstruct_path(came_from, current, uniqueAttr);
            }
            //console.log(current.neighbours)
            
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
                        //console.log(g_score[eNeigh[0].wStateId]);
                        openSet.enqueue(eNeigh[0]);
                        //console.log(eNeigh[0].wStateId);
                    }
                }
            }
            //console.log(openSet);
        }
        return [];
    }
    
    function reconstruct_path (came_from, current, uniqueAttr) : string[]
    {
        //console.log(current);
        var total_path : string[] = [];
        //total_path.push(current);
        var obj1 : string; 
        var obj2 : string; 
        var result : string = "";
        var sugar : string;  
        var derp : string;
        var i : number = 0; 
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
                    i++;
                }
                else
                    sugar = "Then ";
                var obj = current.wState.stacks[current.wState.arm][current.wState.stacks[current.wState.arm].length-1];
                obj1 = uniqueAttr[obj].slice().reverse().join(" ");
                if(current.wState.stacks[current.wState.arm].length >1)
                {
                    var objs = current.wState.stacks[current.wState.arm][current.wState.stacks[current.wState.arm].length-2];
                    obj2 = uniqueAttr[obj].slice().reverse().join(" ");
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

    function arrayIsMember (e : string, array) : boolean
    {
        for(var i in array)
        {
            var v : string = array[i].wStateId;
            if(e===v) // functionsanropet ska ändras lite
            {
                return true;
            }
        }
        return false;
    }
}
