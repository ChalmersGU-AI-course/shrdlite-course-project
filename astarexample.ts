/// <references path="graph.ts" />
/// <references path="astar.ts" />

var myGraph = new graph.Graph<string>();


var noHeuristics = AStar.AStarSearch(myGraph, "start", "goal",
		function(x) {return 0;});

var withHeuristics = AStar.AStarSearch(myGraph, "start", "goal",
		function(x) { return 1;});
