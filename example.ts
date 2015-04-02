/// <reference path="AStar.ts" />

////////////////////////////////////////////////////////////////////////

// Simple example

function cityTest(){
	var n1 : AStar.Nod = new AStar.Nod("1");
	var n2 : AStar.Nod = new AStar.Nod("2");
	var n3 : AStar.Nod = new AStar.Nod("3");

	n1.setArcList ([new AStar.Arc (1, n2 ), new AStar.Arc (1,n3)]);
	n2.setArcList ([new AStar.Arc (1, n3 )]);

	var nodeList1 : AStar.Nod[]=[];
	nodeList1.push(n1);
	nodeList1.push(n2);
	nodeList1.push(n3);

	var ans = AStar.runAStar(nodeList1, n1, n3, function(x){return 0});

	document.getElementById('test').innerHTML = ans.toString();


}

////////////////////////////////////////////////////////////////////////



// Example1, from lecture slide, chapter 3, slide 49 (of 80) and forward 

function cityTest1(){

	// The different nodes in the example
	var arad 	  		: AStar.Nod = new AStar.Nod("Arad");
	var sibiu 	  		: AStar.Nod = new AStar.Nod("Sibiu");
	var timisoara 		: AStar.Nod = new AStar.Nod("Timisoara");
	var zerind   		: AStar.Nod = new AStar.Nod("Zerind");
	var fagaras   		: AStar.Nod = new AStar.Nod("Fagaras");
	var oradea 			: AStar.Nod = new AStar.Nod("Oradea");
	var rimicu_vilcea 	: AStar.Nod = new AStar.Nod("Rimicu_Vilcea");
	var craiova   		: AStar.Nod = new AStar.Nod("Craiova");
	var pitesti 		: AStar.Nod = new AStar.Nod("Pitesti");
	var bucharest 		: AStar.Nod = new AStar.Nod("Bucharest");

	// The different arches from each node (the minus is for subracting the earlier total arch values)
	arad.setArcList 		 ([new AStar.Arc (140, sibiu), 		new AStar.Arc (118,timisoara), 		new AStar.Arc (75, zerind)]);
	sibiu.setArcList 		 ([new AStar.Arc (280-140, arad), 	  	new AStar.Arc (239-140, fagaras),	new AStar.Arc (291-140, oradea), new AStar.Arc (220-140, rimicu_vilcea)]);
	rimicu_vilcea.setArcList ([new AStar.Arc (366-220, craiova),   new AStar.Arc (317-220, pitesti),	new AStar.Arc (300-220, sibiu)]);
	fagaras.setArcList 		 ([new AStar.Arc (338-239, sibiu), 	new AStar.Arc (450-239, bucharest)]);
	pitesti.setArcList 		 ([new AStar.Arc (418-317, bucharest), new AStar.Arc (455-317, craiova),	new AStar.Arc (414-317, rimicu_vilcea)]);

	// Adds all nodes to the nodelist
	var nodeList: AStar.Nod[]=[];
	nodeList.push(arad, sibiu, timisoara, zerind, fagaras, oradea, rimicu_vilcea, craiova, pitesti, bucharest);

	// The printing, which makes the call to the AStar function where everything is calculated, heuristics used
	var ans = AStar.runAStar(nodeList, arad, bucharest, function(x){
		if (x=="Arad") 		return 366;
		if (x=="Sibiu") 	return 253;
		if (x=="Timisoara") return 329;
		if (x=="Zerind") 	return 374;
		if (x=="Fagaras") 	return 176;
		if (x=="Oradea") 	return 380;	
		if (x=="Rimicu_Vilcea") return 193;												
		if (x=="Craiova") 	return 160;
		if (x=="Pitesti") 	return 100;															
		if (x=="Bucharest") return 0;												
	});

	// The printing, which makes the call to the AStar function where everything is calculated, heuristics 0 
	var ans1 = AStar.runAStar(nodeList, arad, bucharest, function(x){ return 0; });

	document.getElementById('test1').innerHTML = "<strong>With heuristics : </strong><br>" +ans.toString() + "<br><br><strong>Without heuristics : </strong><br>" + ans1.toString();
}

////////////////////////////////////////////////////////////////////////

// Example2

function cityTest2(){

	var n1 : AStar.Nod  = new AStar.Nod("Göteborg");
	var n2 : AStar.Nod  = new AStar.Nod("Boras");
	var n3 : AStar.Nod  = new AStar.Nod("Floda");
	var n4 : AStar.Nod  = new AStar.Nod("Vaxjo");
	var n5 : AStar.Nod  = new AStar.Nod("happaranda");
	var n6 : AStar.Nod  = new AStar.Nod("Vasteras");
	var n7 : AStar.Nod  = new AStar.Nod("Malmo");
	var n8 : AStar.Nod  = new AStar.Nod("Stockholm");
	var n9 : AStar.Nod  = new AStar.Nod("Valda");
	var n10 : AStar.Nod = new AStar.Nod("Helsinki");
	var n11 : AStar.Nod = new AStar.Nod("Södertälje");
	
	n1.setArcList ([new AStar.Arc (5, n2), new AStar.Arc (4,n3)]);
	n2.setArcList ([new AStar.Arc (6, n4)]);	
	n3.setArcList ([new AStar.Arc (8, n4), new AStar.Arc (14,n8), new AStar.Arc (17,n5), new AStar.Arc (12,n9)]);
	n4.setArcList ([new AStar.Arc (4, n6)]);
	n5.setArcList ([new AStar.Arc (12, n8),new AStar.Arc (21, n11)]);
	n6.setArcList ([new AStar.Arc (13, n7),new AStar.Arc (5, n8)]);
	n7.setArcList ([]);
	n8.setArcList ([new AStar.Arc (60, n10),new AStar.Arc (3, n11)]);
	n9.setArcList ([]);
	n10.setArcList ([]);
	n11.setArcList ([]);
	
	var nodeList: AStar.Nod[]=[];
	nodeList.push(n1);
	nodeList.push(n2);
	nodeList.push(n3);
	nodeList.push(n4);
	nodeList.push(n5);
	nodeList.push(n6);
	nodeList.push(n7);
	nodeList.push(n8);
	nodeList.push(n9);

	var ans = AStar.runAStar(nodeList, n1, n8, function(x){ 
 		if (x=="Göteborg") return 10;
		else if (x=="Boras") return 8;
		else if (x=="Floda") return 7;
		else if (x=="Vaxjo") return 5;
		else if (x=="happaranda") return 10;
		else if (x=="Vasteras") return 4;
		else if (x=="Malmo") return 8;
		else if (x=="Stockholm") return 0;
		else if (x=="Valda") return 13;
		else if (x=="Södertälje") return 4;
		else if (x=="Helsinki") return 50;
		else return 0;
	});

	// The printing, which makes the call to the AStar function where everything is calculated, heuristics 0 
	var ans1 = AStar.runAStar(nodeList, n1, n8, function(x){ return 0; });

	document.getElementById('test2').innerHTML = "<strong>With heuristics : </strong><br>" +ans.toString() + "<br><br><strong>Without heuristics : </strong><br>" + ans1.toString();

}

function clearTest(){
	document.getElementById('test').innerHTML = "";
	document.getElementById('test1').innerHTML = "";
	document.getElementById('test2').innerHTML = "";
}