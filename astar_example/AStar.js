
    function astar(start, goal, heuristic) {
        var closedset = new Set(); // The set of nodes already evaluated
        var openset = new Set(); // The set of nodes to be evaluated, initially containing only the start node
        openset.add(start);
		
        var came_from = new Map();  // node(key) --> parent_node(value)
        var g_score = new Map();	// node(key) --> score G (value)
        var f_score = new Map();	// node(key) --> score F (value) = score G + heuristic H
		
        g_score.set(start, 0); // Cost from start along best known path.
		f_score.set(start, g_score.get(start) + heuristic(start, goal));
		
		// We want to iterate in the openset until it is empty 
        while (openset.size() > 0) {
		
			// choose the "best" neighbour - the one with lowest F score
            var current = lowestFScoreNode(openset, g_score, heuristic, goal);
			
			// If we reached the goal we reconstruct the path through analysis of parent_nodes in the mapping came_from
            if (current == goal) { return reconstruct_path(came_from, goal); }
			
            openset.delete(current); // remove current from openset
            closedset.add(current); // add current to closedset
			
			// Analyze neighbours of current node and for each of them perform
			// a function  
            current.neighbours.forEach( function (arc){
			
                var neighbor = arc.destination;
                var weight = arc.weight;
                if (closedset.has(neighbor))
                    return; // continue
                var tentative_g_score = g_score.get(current) + weight;
                if (!openset.has(neighbor) || tentative_g_score < g_score.get(neighbor)) {
                    came_from.set(neighbor, current);
                    g_score.set(neighbor, tentative_g_score);
                    f_score.set(neighbor, g_score.get(neighbor) + heuristic(neighbor, goal));
                    if (!openset.has(neighbor)) {
                        openset.add(neighbor);
                    }
                }
				
            });
        }
		
		// if the cycle ends, this is, if the openset is empty and no solution was found, then
		// there is no solution
        return null;
    }
	

    var Arc = (function () {
        function Arc(destination, weight) {
            this.destination = destination;
            this.weight = weight;
        }
        return Arc;
    })();

    var Node = (function () {
        function Node(content) {
            this.content = content;
            this.neighbours = [];
        }
        Node.prototype.addNeighbour = function (node, weight) {
            var arc = new Arc(node, weight);
            this.neighbours.push(arc);
        };
        Node.prototype.neighbourNodes = function () {
            return this.neighbours.map(function (arc) { return arc.destination; });
        };
        return Node;
    })();

	
    function lowestFScoreNode(set, g_score, heuristic, goal) {
	
        // using the previous objects (nodes) returns new objects, composed by:
		//		-- score (heuristic)
		//		-- node
        var scoreFn = function (node) {
            return { score: g_score.get(node)+heuristic(node, goal), node: node };
        };
		
		// Function for comparison of two scores
		// 		-- we want it to return a number less than zero if a<b
		// 		-- we want it to return a number bigger than zero if a>b
		// 		for integers a simple a-b suffices (which is the case of scores)
		var sortFn = function (a, b) {
           return a.score - b.score;
        };
		
		// 1) set --> array ; 
		// 2) array(nodes) --> array(scores,nodes);
		// 3) array(scores,nodes) sorted by scores (from smallest to greatest);
		// 4) shift returns the 1st object, hence the smallest;
		// 5) we return the  element node from the object;
        return set.toArray().map(scoreFn).sort(sortFn).shift().node;
    }
	
    function reconstruct_path(came_from, current) {
        var total_path = [current];
        while (came_from.has(current)) {
            current = came_from.get(current);
            total_path.push(current);
        }
        return total_path;
    }

