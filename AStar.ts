///<reference path='collections.ts'/>
///<reference path='World.ts'/>


module AStar {
 

    export interface Node
    {
        wState : string;
        neighbours: [string,string] [];
        fscore?: number;
        hweight? : number;
        id?: number;
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
    
    export function astar(startObject,goalFunction,huerFunction,getNode) : string[]
    {
        var closedSet : Node[] = [];
        var openSet = new collections.PriorityQueue<Node>(compareT);
        
        var startNode : Node = getNode(startObject)
        openSet.add(startNode);
        
        var came_from : {[key:string]:[Node,string]} = {};
        
        var g_score : {[key:string]:number} = {};
        g_score[startObject] = 0;
        
        var f_score : number [] = [];
        f_score[startObject] = g_score[startObject] + huerFunction(startObject);
        
        while(!openSet.isEmpty())
        {
            var current = openSet.dequeue();
            if (goalFunction(current))
            {
                return reconstruct_path(came_from, current);
            }
            
            closedSet.push(current);
            for(var ei in current.neighbours)
            {
                var e : [string,string] = current.neighbours[ei];
                
                var eNeigh : [Node,string] = [getNode(e[0]),e[1]];
                
                if (!arrayIsMember(e[0],closedSet))
                {
                    var tentative_g_score :number = g_score[current.wState] + 1;
                    
                    if(!openSet.contains(eNeigh[0]) || tentative_g_score < g_score[e[0]])
                    {
                        came_from[e[0]] = [current,eNeigh[1]];
                        g_score[e[0]] = tentative_g_score;
                        f_score[e[0]] = g_score[e[0]] + huerFunction(e[0]);
                        eNeigh[0].fscore = f_score[e[0]];
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
        while(came_from[current[0].wState] != null)
        {
            current = came_from[current[0].wState];
            total_path.push(current[1]);
        }
        return total_path;
    }

    function arrayIsMember (e : string, array) : boolean
    {
        for(var i in array)
        {
            var v : string = array[i].wState;
            if(e===v) // functionsanropet ska ändras lite
            {
                return true;
            }
        }
        return false;
    }
}
