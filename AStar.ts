///<reference path='collections.ts'/>
module AStar {
    

    interface Test
    {
        id: number;
        hweight?: number;
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
    
    export function example1(a : number, b : number)
    {
        var graph: { [key:number] : Test; } = {};
        graph[0] = {id:1,hweight:10,neighbours:[[2,1] ,[4,2],[1,3]]};
        graph[1] = {id:2,hweight:15,neighbours:[[2,0],[1,2],[2,3]]};
        graph[2] = {id:3,hweight:30,neighbours:[[2,0],[2,1],[2,3]]};  
        graph[3] = {id:4,hweight:5,neighbours:[[2,1],[2,2]]};
        var ret = astar(a,b,example1HeurFunction,graph);
        console.log(ret)
        return ret;
    }
    
    function example1HeurFunction(t : Test) : number
    {
        return t.hweight;
    }
    
    export function example2(input:number)
    {
        var graph2: { [key:number] : Test; } = {};
        graph2[0] = {id:0,neighbours:[[75,19],[118,16],[140,15]]};
        graph2[1] = {id:1,neighbours:[[211,5],[85,18],[90,6],[101,13]]};
        graph2[2] = {id:2,neighbours:[[120,3],[146,14],[138,13]]};
        graph2[3] = {id:3,neighbours:[[75,10],[120,2]]};
        graph2[4] = {id:4,neighbours:[[86,7]]};
        graph2[5] = {id:5,neighbours:[[99,15],[80,14],[140,0],[151,12]]};
        graph2[6] = {id:6,neighbours:[[90,1]]};
        graph2[7] = {id:7,neighbours:[[98,17],[86,4]]};
        graph2[8] = {id:8,neighbours:[[87,11],[92,18]]};
        graph2[9] = {id:9,neighbours:[[111,16],[70,10]]};
        graph2[10] = {id:10,neighbours:[[70,9],[75,3]]};
        graph2[11] = {id:11,neighbours:[[87,8]]};
        graph2[12] = {id:12,neighbours:[[71,19],[151,15]]};
        graph2[13] = {id:13,neighbours:[[97,14],[101,1],[138,2]]};
        graph2[14] = {id:14,neighbours:[[80,15],[97,13],[146,2]]};
        graph2[15] = {id:15,neighbours:[[140,0],[151,12],[99,5],[80,14]]};
        graph2[16] = {id:16,neighbours:[[118,0],[111,9]]};
        graph2[17] = {id:17,neighbours:[[85,1],[142,18],[98,7]]};
        graph2[18] = {id:18,neighbours:[[92,8],[142,17]]};
        graph2[19] = {id:19,neighbours:[[71,12],[75,0]]};
        
        var optPath : number[] = astar(input,City.Bucharest,example2HeurFunction,graph2);
        for(var i in optPath)
        {
            console.log(i-(-1),City[optPath[(optPath.length-1)-i]]);
        }
        
    }
    enum City 
    {
        Arad,
        Bucharest,
        Chraiova,
        Dobreta,
        Eforie,
        Fagaras,
        Giurgiu,
        Hirsova,
        Iasi,
        Lugoj,
        Mehadia,
        Neamt,
        Oreada,
        Pitesti,
        RimnicuVilecea,
        Sibiu,
        Timisoara,
        Urziceni,
        Vaslui,
        Zerind
    };
        
        
    function example2HeurFunction(input:number):number
    {
        switch (input)
        {
        case 0: 
            return  366;
            break;
        case 1: 
            return  0;
            break;
        case 2: 
            return  160;
            break;
        case 3: 
            return  242;
            break;
        case 4: 
            return  161;
            break;
        case 5: 
            return  178;
            break;
        case 6: 
            return  77;
            break;
        case 7: 
            return  151;
            break;    
        case 8: 
            return  226;
            break;
        case 9: 
            return  244;
            break;
        case 10: 
            return  241;
            break;
        case 11: 
            return  234;
            break;
        case 12: 
            return  380;
            break;
        case 13: 
            return  98;
            break;
        case 14: 
            return  193;
            break;
        case 15: 
            return  253;
            break;
        case 16: 
            return  329;
            break;
        case 17: 
            return  80;
            break;
        case 18: 
            return  199;
            break; 
        case 19: 
            return  374;
            break;
        }
    }
    
    
    function astar(start,goal,huerFunction,graph:{ [key:number] : Test; }) : number[]
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



