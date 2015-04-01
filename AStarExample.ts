///<reference path='AStar.ts'/>

module AStarExample 
{
    export function example1(a : number, b : number)
    {
        var graph: { [key:number] : AStar.Node; } = {};
        graph[0] = {id:1,hweight:10,neighbours:[[2,1] ,[4,2],[1,3]]};
        graph[1] = {id:2,hweight:15,neighbours:[[2,0],[1,2],[2,3]]};
        graph[2] = {id:3,hweight:30,neighbours:[[2,0],[2,1],[2,3]]};  
        graph[3] = {id:4,hweight:5,neighbours:[[2,1],[2,2]]};
        var ret = AStar.astar(a,b,example1HeurFunction,graph);
        console.log(ret)
        return ret;
    }
    
    function example1HeurFunction(t : AStar.Node) : number
    {
        return t.hweight;
    }
    
    export function example2(input:number)
    {
        var graph2: { [key:number] : AStar.Node; } = {};
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
        
        var optPath : number[] = AStar.astar(input,City.Bucharest,example2HeurFunction,graph2);
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
}