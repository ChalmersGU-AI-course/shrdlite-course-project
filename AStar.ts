///<reference path='collections.ts'/>
module AStar {
    

    export interface Node
    {
        id: number;
        hweight?: number;
        neighbours: [number,number][];
        fscore?: number;
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
    
    export function astar(start,goal,huerFunction,graph:{ [key:number] : Node; }) : number[]
    {
        var closedSet : number[] = [];
        var openSet = new collections.PriorityQueue<Node>(compareT);
        
        openSet.add(graph[start]);
        
        var came_from : {[key:number]:number} = {};
        
        var g_score : number [] = [];
        g_score[start] = 0;
        
        var f_score : number [] = [];
        f_score[start] = g_score[start] + graph[start].hweight;
        
        var indextest : number = 0;
        while(!openSet.isEmpty())
        {
            var current = openSet.dequeue();
            if (current.id == goal)
            {
                return reconstruct_path(came_from, goal);
            }
            
            closedSet.push(current.id); 
            for(var ei in current.neighbours)
            {
                var e : number[] = current.neighbours[ei];
                
                if (!arrayIsMember(e[1],closedSet))
                {
                    var tentative_g_score :number = g_score[current.id] + e[0];
                    
                    if(!openSet.contains(graph[e[1]]) || tentative_g_score < g_score[e[1]])
                    {
                        came_from[e[1]] = current.id;
                        g_score[e[1]] = tentative_g_score;
                        f_score[e[1]] = g_score[e[1]] + huerFunction(graph[e[1]]);
                        graph[e[1]].fscore = f_score[e[1]];
                        openSet.enqueue(graph[e[1]]);
                    }
                }
            }
        }
        return [];
    }
    
    function reconstruct_path (came_from, current) : number[]
    {
        var total_path : number[] = [];
        total_path.push(current);
        while(came_from[current] != null)
        {
            current = came_from[current];
            total_path.push(current);
        }
        return total_path;
    }

    function arrayIsMember (e , array) : boolean
    {
        for(var i in array)
        {
            var v : number = array[i];
            if(e==v)
            {
                return true;
            }
        }
        return false;
    }
}



