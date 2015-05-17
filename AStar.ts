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
        if(a.fscore > b.fscore) // a is greater than b
        {
            return 1
        }
        if(a.fscore < b.fscore) //a is less than b
        {
            return -1
        }
        
        return 0
    }
    
    export function astar(lit:Interpreter.Literal[],startObject,goalFunction,huerFunction,getNode) : string[]
    {
        var closedSet : Node[] = [];
        var openSet = new collections.PriorityQueue<Node>(compareT);
        
        var startNode : Node = getNode(startObject);
        openSet.add(startNode);
        
        var came_from : {[key:string]:[Node,string]} = {};
        
        var g_score : {[key:string]:number} = {};
        g_score[startObject] = 0;
        
        var f_score : number [] = [];
        f_score[startObject] = g_score[startObject] + huerFunction(lit,startNode.wState);
        
        while(!openSet.isEmpty())
        {
            var current = openSet.dequeue();
            if (goalFunction(lit,current.wStateId))
            {
                return reconstruct_path(came_from, current);
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
    
    function reconstruct_path (came_from, current) : string[]
    {
        var total_path : string[] = [];
        total_path.push(current[1]);
        while(came_from[current[0].wStateId] != null)
        {
            current = came_from[current[0].wStateId];
            total_path.push(current[1]);
        }
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
