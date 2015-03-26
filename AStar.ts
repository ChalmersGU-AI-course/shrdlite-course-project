///<reference path='collections.ts'/>
module AStar {
    

    interface Test
    {
        id: number;
        hweight: number;
        neighbours: [number,number][];
        fscore?: number;
    }
    
    //TBD
    function compareT(a:Test,b:Test)
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
    
    export function asdasdJarnaMain(a : number, b : number)
    {
        
        //var queue = new collections.PriorityQueue<Test>(compareT);
        
        var graph: { [key:number] : Test; } = {};
        graph[0] = {id:0,hweight:0,neighbours:[[2,1] ,[4,2],[1,3]]};
        graph[1] = {id:1,hweight:15,neighbours:[[2,0],[1,2],[10,3]]};
        graph[2] = {id:2,hweight:30,neighbours:[[2,0],[2,1],[2,3]]};  
        graph[3] = {id:3,hweight:5,neighbours:[[2,1],[2,2]]};
        var ret = astar(a,b,graph);
        return ret;
    }
    
    function astar(start,goal,graph:{ [key:number] : Test; }) : number[]
    {
        var closedSet : number[] = [];
        var openSet = new collections.PriorityQueue<Test>(compareT);
        
        openSet.add(graph[start]);
        
        var came_from : {[key:number]:number} = {};
        
        var g_score : number [] = [];
        g_score[start] = 0;
        
        var f_score : number [] = [];
        f_score[start] = g_score[start] + graph[start].hweight;
        
        var indextest : number = 0;
        while(!openSet.isEmpty())
        {   
            console.log(indextest++);
            var current = openSet.dequeue();
            if (current.id == goal)
            {
                return reconstruct_path(came_from, goal);
            }
            
            closedSet.push(current.id); 
            console.log(current.id);
            for(var ei in current.neighbours)
            {
                var e : number[] = current.neighbours[ei];
                //console.log("asdasdasd ",  e);
                //console.log(!arrayIsMember(e[1],closedSet));
                if (!arrayIsMember(e[1],closedSet))
                {
                    var tentative_g_score :number = g_score[current.id] + e[0];
                    if(!openSet.contains(graph[e[1]]))
                    {
                        g_score[e[1]] = 2147483647;
                    }
                    if(tentative_g_score < g_score[e[1]])
                    {
                        //console.log("asdasd");
                        came_from[e[1]] = current.id;
                        g_score[e[1]] = tentative_g_score;
                        f_score[e[1]] = g_score[e[1]] + graph[e[1]].hweight;
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

    function arrayIsMember (e , array)
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



