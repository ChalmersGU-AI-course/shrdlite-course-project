///<reference path='collections.d.ts'/>
module AStar {
    

    interface Test
    {
        id: number;
        hweight: number;
        neighbours: [number,number][];
    }
    
    //TBD
    function compareT(a:Test,b:Test)
    {
        if(1) // a is greater than b
        {
            return 1
        }
        if(-1) //a is less than b
        {
            return -1
        }
        
        return 0
    }
    
    export function asdasdJarnaMain ()
    {
        var queue = new collections.PriorityQueue<Test>(compareT);
        var graph: { [key:number] : Test; } = {};
        graph[0] = {id:0,hweight:0,neighbours:[[2,1] ,[4,2]]};
        graph[1] = {id:1,hweight:15,neighbours:[[2,0],[2,2],[2,3]]};
        graph[2] = {id:2,hweight:30,neighbours:[[2,0],[2,1],[2,3]]};  
        graph[3] = {id:3,hweight:5,neighbours:[[2,1],[2,2]]};
        
        return astar(1,2,graph);
    }
    
    function astar(start,goal,graph:{ [key:number] : Test; })
    {
        var closedSet : number[] = [];
        var openSet = new  collections.PriorityQueue<Test>();
        openSet.add(graph[start]);
        var came_from : {[key:number]:number} = {};
        

        //g_score[start] = 0;
        //f_score[start]
        
        while(!openSet.isEmpty())
        {
            var current = openSet.dequeue();
            if (current.id == goal)
            {
                return reconstruct_path(came_from, goal);
            }
            
            closedSet.push(current.id); 
            console
            for(var e in current.neighbours)
            {
                if (!arrayIsMember(e[1],closedSet))
                {
                    //var tentative_g_score = g_score[current] + e[0];
                    
                    //if(openSet. e[1]
                }
            }
        }
        
    }
    
    function reconstruct_path (came_from, current)
    {
        var total_path : number[] = [];
        while(came_from[current] != null)
        {
            current = came_from[current];
            total_path.push(current);
        }
        return total_path;
    }

    function arrayIsMember (e , array)
    {
        for(var v in array)
        {
            if(e==v)
            {
                return true;
            }
        }
        return false;
    }
}



