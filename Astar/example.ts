///<reference path="graph.ts"/>
///<reference path="astar.ts"/>


//-------------- Example 1: Romania graph example from lecture
var graph = new Graph.Graph();


graph.addVertex("Arad",[{from:"Arad",to:"Zerind",cost:75}
							,{from:"Arad",to:"Sibiu",cost:140}
							,{from:"Arad",to:"Timisoara",cost:118}],366);

graph.addVertex("Zerind",[{from:"Zerind",to:"Oradea",cost:71}
							,{from:"Zerind",to:"Arad",cost:75}],374);

graph.addVertex("Oradea",[{from:"Oradea",to:"Zerind",cost:71}
							,{from:"Oradea",to:"Sibiu",cost:151}],380);

graph.addVertex("Sibiu",[{from:"Sibiu",to:"Arad",cost:140}
							,{from:"Sibiu",to:"Oradea",cost:151}
							,{from:"Sibiu",to:"Fagaras",cost:99}
							,{from:"Sibiu",to:"Rimnicu",cost:80}],253);

graph.addVertex("Timisoara",[{from:"Timisoara",to:"Arad",cost:118}
								,{from:"Timisoara",to:"Lugoj",cost:111}],329);

graph.addVertex("Lugoj",[{from:"Lugoj",to:"Timisoara",cost:111}
							,{from:"Lugoj",to:"Mehadia",cost:75}],244);


graph.addVertex("Mehadia",[{from:"Mehadia",to:"Lugoj",cost:70}
							,{from:"Mehadia",to:"Dobreta",cost:75}],241);

graph.addVertex("Rimnicu",[{from:"Rimnicu",to:"Sibiu",cost:111}
							,{from:"Rimnicu",to:"Pitesti",cost:75}
							,{from:"Rimnicu",to:"Craiova",cost:146}],193);

graph.addVertex("Dobreta",[{from:"Dobreta",to:"Mehadia",cost:75}
							,{from:"Dobreta",to:"Craiova",cost:120}],242);

graph.addVertex("Fagaras",[{from:"Fagaras",to:"Sibiu",cost:99}
							,{from:"Fagaras",to:"Bucharest",cost:211}],178);


graph.addVertex("Pitesti",[{from:"Pitesti",to:"Rimnicu",cost:97}
							,{from:"Pitesti",to:"Craiova",cost:138}
							,{from:"Pitesti",to:"Bucharest",cost:101}],98);

graph.addVertex("Craiova",[{from:"Craiova",to:"Dobreta",cost:120}
							,{from:"Craiova",to:"Rimnicu",cost:146}
							,{from:"Craiova",to:"Pitesti",cost:138}],160);

graph.addVertex("Bucharest",[{from:"Bucharest",to:"Pitesti",cost:101}
							,{from:"Bucharest",to:"Fagaras",cost:211}],0);



var astar = new AStar.AStarSearch(graph);

//starting from Arad to Bucharest 
var result = astar.runSearchAStar("Arad","Bucharest");

//------------------------------------------------
//------- Example 2 : Another representation of graph using Grid

var grid = new Graph.Graph();
var blocks = [[1,1,1,1,0,1,1] 	//row A0 - A6
			 ,[0,0,0,1,0,0,1] 	//row B0 - B6
			 ,[0,1,1,1,1,1,1] 	//row C0 - C6
			 ,[1,1,0,1,0,0,1] 	//row D0 - D6
			 ,[1,1,1,1,1,1,1]]; //row E0 - E6

grid.addGrid(blocks);

var astar2 = new AStar.AStarSearch(grid);

//starting from A0 to E0
var result2 = astar2.runSearchAStar("A0","E0");

//print 2 results on html
document.body.innerHTML = astar.printPath(result) +"</br></br>" + astar2.printPath(result2);

