class Graph
{
    nodes : list;
    edges : list;
    
    constructor(nodes,edges)
    {
	this.nodes=nodes;
	this.edges=edges;
    }

    function findPath(start,goal)
    {
	var closedset = []; //list
	var openset = start; //list
	var came_from = []; //matris typ

	var g_score = ; //array of same length as nodes list
	g_score[start]=0;

	//min heap på f_score
	f_score[start]=g_score[start] + heuristicCost(start,goal);

	While(openset.size() != 0)
	{
	    current=//hitta elementet med lägst värde i f_score, sätt current till dess index

	    if(current==goal)
	    {
		//hurray
		//returnera
	    }

	    //find current in openset and remove that element and add to closed
	    it=openset.find(current);
	    closedset.add(openset(it));
	    openset.remove(it);

	    current_neighbour=getNeighbours(current);

	    for(var i = 0; i< current_neighbour.length ; ++i)
	    {
		if(closedSet.contains(current_neighbour[i]))
		    continue;

		var tentative_g_score=g_score[current] + edge_between_cost;

		if( !openset.contains(current_neighbour[i]) || tenative_g_score < g_score[current_neighbour[i]] )
		{
		    //spara undan hur du kom hit
		    g_score[current_neighbour[i]]=tenative_g_score;
		    f_score[current_neighbour[i]]=g_score[current_neighbour[i]] + heuristicCost[current_neighbour[i],goal];
		    if(openset.contains(current_neighbour[i]))
			openset.add(current_neighbour[i]);
		}
	    }

	    return null;
	    
	}
	
    }

    function heuristicCost(current,goal)
    {
    }

    function getNeighbours(node)
    {
    }
    
}



function Astar(start, goal,nodes,edges)
{
    var evaluated_node=[];
    var open_set=start;
}
