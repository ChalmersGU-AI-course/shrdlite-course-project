
var stage = 0;
//var blocked_nodes = [];
var graph= [];
var startId="";
var goalId="";
var w=0;
var h=0;
var goalNode;
var startNode;

function createGrid(form) {
    w = form.width.value;
	h = form.height.value;
	
	if(h == 0 || w == 0 || h % 1 != 0 || w % 1 != 0 || w*h<=1){ 
		alert ("Please insert a valid grid size"); 
		return;
	}
	
	var grid= "<div id='tableWrapper'><table id='myTable'>";
	for (var i = 0; i < w; i++) {   grid+="<tr>";
		for (var j = 0; j < h; j++) { grid+="<td id='" + i + "_" + j + "' class='free' onClick='chooseBlock(this.id)' >  </td>";  };
		grid+="</tr>";
	};
	grid+="</table></div><div id='nextStage'><p><input type='button' name='Try' value='Click' onClick='changeStage()'></p></div>";
	document.getElementById('initialForm').innerHTML = "<h2>Grid of " + w + " by " + h +"</h2>" ;
	document.getElementById('gridPlacement').innerHTML = grid ;
	changeStage();
	
	return;
};

function changeStage(){
	switch (stage){
		case 0: 	
			stage++;
			document.getElementById('messageStage').innerHTML = "<p>Please select the start node</p>" ;
			startId="0_0";
			var mystart=document.getElementById(startId);
			mystart.className="start";
			mystart.innerHTML = "S" ;
			return;
		case 1: 
			stage++;
			document.getElementById('messageStage').innerHTML = "<p>Please select the goal node</p>" ;
			if(startId=="0_0"){ 
				if(w>1) goalId="0_1";
				else goalId="1_0";
			}else{ goalId="0_0"; }
			var mygoal=document.getElementById(goalId);
			mygoal.innerHTML = "G" ;
			mygoal.className="goal";
			return;
		case 2: 
			stage++;
			document.getElementById('messageStage').innerHTML = "<p>Please select the invalid nodes</p>" ;
			return;
		case 3: 
			stage++;
			document.getElementById('messageStage').innerHTML = "<p>Press the button to compute path</p>" ;
			document.getElementById('nextStage').innerHTML = "<input type='button' name='Try' value='A*' onClick='changeStage()'></p>" ;
			createGraph("myTable");
			return;
		case 4:
			document.getElementById('nextStage').innerHTML = "<p> </p>";
			path=astar(startNode, goalNode, grid_heuristic);
			if(path!=null) printPath(path.reverse());
			else document.getElementById('nextStage').innerHTML = "<p> The goal is not reachable </p>";
			return;
	}
};
	
function chooseBlock(cellId) {
	var mygoal=document.getElementById(goalId);
	var mystart=document.getElementById(startId);
	var mycell=document.getElementById(cellId);
	switch (stage){
	case 0: return;
	case 1:
		if ( mycell.className.match(/(?:^|\s)free(?!\S)/) ){ 
			mystart.className="free";
			mystart.innerHTML = "" ;
			mycell.className="start";
			mycell.innerHTML = "S" ;
			startId=cellId;
		}
		return;
		
	case 2: 
		if ( mycell.className.match(/(?:^|\s)free(?!\S)/) ){ 
			mygoal.className="free";
			mygoal.innerHTML = "" ;
			mycell.className="goal";
			mycell.innerHTML = "G" ;
			goalId=cellId;
		}
		return;
	
	case 3: 
		if ( mycell.className.match(/(?:^|\s)blocked(?!\S)/) ){ 
			mycell.className="free";
		//	blocked_nodes.concat(blocked_nodes.slice(0,blocked_nodes.indexOf(cellId)),blocked_nodes.slice(blocked_nodes.indexOf(cellId),blocked_nodes.length()));
		}else{ 
			if ( mycell.className.match(/(?:^|\s)free(?!\S)/) ){ 
				mycell.className="blocked";
			//	blocked_nodes.push(cellId);
			}
		}
		return;
		
	case 4: 	
		return;
	}
};

function createGraph(table_id){
    var table = document.getElementById(table_id);
	
	if (table != null) {
		for (var i = 0; i < table.rows.length; i++) {
			for (var j = 0; j < table.rows[i].cells.length; j++){
				var c=table.rows[i].cells[j];
				var mycell=document.getElementById(c.id);
					if ( mycell.className.match(/(?:^|\s)blocked(?!\S)/) ){ 
					}else{			
						str=c.id;
						nums= str.match(/\d+/g);
						x=parseInt(nums[0]);y=parseInt(nums[1]);
						var cont= new State_def(x,y);
						var node= new Node(cont);
						graph.push(node);
						if ( mycell.className.match(/(?:^|\s)start(?!\S)/) ) startNode=node;
						if ( mycell.className.match(/(?:^|\s)goal(?!\S)/) ) goalNode=node;
					}
			}
		}

		var len = graph.length;
		
		for(var i=0;i<len;i++){
			var node=graph[i];
			var x=node.content.x; var y=node.content.y;
			var k1=x-1; var k2=x+1; var l1=y-1; var l2=y+1;
			var newcont=[]; 
			
			if( k1>=0) newcont[0]=new State_def(k1,y);
			if( k2<w ) newcont[1]=new State_def(k2,y);
			if( l1>=0) newcont[2]=new State_def(x,l1);
			if( l2<h ) newcont[3]=new State_def(x,l2);
			
			for(var a=0; a<4; a++){
				if(newcont[a]!=null){ 
				newx=newcont[a].x; newy=newcont[a].y;
					for(var b=0;b<len;b++){
						var nnode=graph[b];
						var nx=nnode.content.x; var ny=nnode.content.y;
						if(nx==newx && ny==newy) node.addNeighbour(nnode,1);
					}
				}
			}		
		}
		
		//printGraph();
	}
	return;
};

function printGraph(){

	var text="";
	var glen = graph.length;
	for(var i=0;i<glen;i++){
		var gnode=graph[i];
		text+="<p>";
		text+="Node " + i + ": <br>";
		
		var gcont=gnode.content;
		var gx=gcont.x;
		var gy=gcont.y;
		
		text+="with " + "( x=" + gx + ",y=" + gy + " ) ;<br>";
		text+="and neighbours:<br>";
			
	    var nb=gnode.neighbours;
		var len_n=nb.length;
		for(var j=0;j<len_n;j++){ 
			arc_j=nb[j];
			nei=arc_j.destination;
			nei_cont=nei.content;
			nei_x=nei_cont.x;
			nei_y=nei_cont.y;
			wei=arc_j.weight;
			text+="    ( x=" + nei_x + ", y=" + nei_y + " ) with weight = " + wei + " <br>";
		}			
		text+="</p>";
	}
	document.getElementById('ids').innerHTML = text ;
	return;
};

function printPath(path_array){
		
		var path_len=path_array.length;
		for( var e=1;e<path_len-1;e++){
			no=path_array[e];
			ident="" + no.content.x + "_" + no.content.y;
			mynode=document.getElementById(ident);
			mynode.className="path";
			mynode.innerHTML = e ;
		}
	return;
};

function State_def(x,y) {
    this.x = x;
    this.y = y;
};

function grid_heuristic(actual,goal){
	return (goal.content.x-actual.content.x)+(goal.content.y-actual.content.y);
}