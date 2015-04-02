/// <references path="graph.ts" />
/// <references path="astar.ts" />

var myGraph = new graph.Graph<string>();

myGraph.addNode("Arad");
myGraph.addNode("Bucharest");
myGraph.addNode("Craiova");
myGraph.addNode("Dobreta");
myGraph.addNode("Eforie");
myGraph.addNode("Fagaras");
myGraph.addNode("Giurgiu");
myGraph.addNode("Hirsova");
myGraph.addNode("Iasi");
myGraph.addNode("Lugoj");
myGraph.addNode("Mehadia");
myGraph.addNode("Neamt");
myGraph.addNode("Oradea");
myGraph.addNode("Pitesti");
myGraph.addNode("Rimnicu Vilcea");
myGraph.addNode("Sibiu");
myGraph.addNode("Timisoara");
myGraph.addNode("Urziceni");
myGraph.addNode("Vaslui");
myGraph.addNode("Zerind");

myGraph.addArc("Oradea","Zerind",71);
myGraph.addArc("Oradea","Sibiu",151);
myGraph.addArc("Zerind","Arad",75);
myGraph.addArc("Arad","Sibiu",140);
myGraph.addArc("Arad","Timisoara",118);
myGraph.addArc("Sibiu","Fagaras",99);
myGraph.addArc("Sibiu","Rimnicu Vilcea",80);
myGraph.addArc("Timisoara","Lugoj",111);
myGraph.addArc("Lugoj","Mehadia",70);
myGraph.addArc("Mehadia","Dobreta",75);
myGraph.addArc("Dobreta","Craiova",120);
myGraph.addArc("Rimnicu Vilcea","Craiova",146);
myGraph.addArc("Rimnicu Vilcea","Pitesti",97);
myGraph.addArc("Craiova","Pitesti",138);
myGraph.addArc("Pitesti","Bucharest",101);
myGraph.addArc("Fagaras","Bucharest",211);
myGraph.addArc("Bucharest","Giurgiu",90);
myGraph.addArc("Bucharest","Urziceni",85);
myGraph.addArc("Urziceni","Hirsova",98);
myGraph.addArc("Hirsova","Eforie",86);
myGraph.addArc("Urziceni","Vaslui",142);
myGraph.addArc("Vaslui","Iasi",92);
myGraph.addArc("Iasi","Neamt",87);



var noHeuristics = AStar.AStarSearch(myGraph, "Arad", "Bucharest",
		function(x) {return 0;});

var withHeuristics = AStar.AStarSearch(myGraph, "Arad", "Bucharest",
		function(x) { 
			if(x === "Arad") { return 366; }
			if(x === "Bucharest") { return 0; }
			if(x === "Craiova") { return 160; }
			if(x === "Dobreta") { return 242; }
			if(x === "Eforie") { return 161; }
			if(x === "Fagaras") { return 178; }
			if(x === "Giurgiu") { return 77; }
			if(x === "Hirsova") { return 151; }
			if(x === "Iasi") { return 226; }
			if(x === "Lugoj") { return 244; }
			if(x === "Mehadia") { return 241; }
			if(x === "Neamt") { return 234; }
			if(x === "Oradea") { return 380; }
			if(x === "Pitesti") { return 98; }
			if(x === "Rimnicu Vilcea") { return 193; }
			if(x === "Sibiu") { return 253; }
			if(x === "Timisoara") { return 329; }
			if(x === "Urziceni") { return 80; }
			if(x === "Vaslui") { return 199; }
			if(x === "Zerind") { return 374; }
			return 0;
		});

