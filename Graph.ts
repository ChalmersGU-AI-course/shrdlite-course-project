interface GraphNode {
    name: string;
    x: number;
    y: number;
}

class Graph {
    nodes: GraphNode[];
    edges: [number, number][][]; //A list of tuples for every node

    constructor(nodes: GraphNode[], edges: [number, number][][]) {
        this.nodes = nodes;
        this.edges = edges;
    }

    findPath(start: number, goal: number): [number, number][] //Returns a list of edges
    {
        if (start > this.nodes.length || start < 0 || goal > this.nodes.length || goal < 0)
            throw new RangeError("Node does not exist");

        var closedset = []; //list
        var openset = []
	openset[0]=start; //list
        var came_from = []; //matris typ

        //can't get stl to work
        //var f_score: minheap = new MinHeap();
	var f_score = []

	//fill array with -1 to indicate nodes not yet calculated
	for(var i=0; i < this.nodes.length ; ++i)
	    f_score[i]=-1;

	var g_score = []; //could maybe use = new int[f_score.length] for pre allocation
	g_score[start]=0;

	//min heap på f_score
	f_score[start] = g_score[start] + this.heuristicCost(start,goal);

	//loop commented out to not get stuck in inf loop
        //while (openset.length != 0) {
            var current: number = this.indexOfSmallest(f_score);//hitta elementet med lägst värde i f_score, sätt current till dess index
	    
            if (current == goal) {
                //hurray
		return came_from;
            }

            //find current in openset and remove that element and add to closed
            var it:number = this.find(openset,current);
            closedset.push(openset[it]);
	    openset.splice(it,1); //splice removes the element at index

	   
	    current_neighbours = this.getNeighbours(current);
	
	    /*
            for (var i = 0; i < current_neighbours.length; ++i) {
                if (closedSet.contains(current_neighbours[i]))
                    continue;

                var tentative_g_score = g_score[current] + edge_between_cost;

                if (!openset.contains(current_neighbours[i]) || tenative_g_score < g_score[current_neighbours[i]]) {
                    //spara undan hur du kom hit
                    g_score[current_neighbours[i]] = tenative_g_score;
                    f_score[current_neighbours[i]] = g_score[current_neighbours[i]] + heuristicCost[current_neighbour[i], goal];
                    if (openset.contains(current_neighbour[i]))
                        openset.add(current_neighbour[i]);
                }
            }
        }
        */

        //Dummy: Just a test path for the view
        return [[start, 9], [10, 13], [13, 12], [12, goal]];

        return undefined; //No path was found
    }

    heuristicCost(current: number, goal: number): number {
        return 0;
    }

    getNeighbours(node: number): [number, number][] {
        if (node < 0 || node >= this.nodes.length)
            throw new RangeError("Node does not exist");

        return this.edges[node];
    }

    //returns index of smallest non negative element
    indexOfSmallest(arr:number[]) {
	var lowest = 0;
	for (var i = 1; i < arr.length; ++i) {
	    if ( (arr[i] < arr[lowest] && arr[i]>=0 ) || (arr[i]>=0 && arr[lowest]==-1) ) lowest = i;
	}
	return lowest;
    }
    find(arr:number[],value:number) {
	var index = -1;
	for (var i = 0; i < arr.length; ++i) {
	    if ( arr[i] == value ) index = i;
	}
	return index;
    }

    get NoOfNodes(): number {
        return this.nodes.length;
    }
}