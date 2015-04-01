
 
function O_Node(content) {
    this.content = content;
    this.neighbour_nodes=[];
	
	this.getContent = function() {
	return this.content;
	};
	
	this.addNeighbour = function(destination, weight) {
		var arc = new O_Arc(destination,weight);
		var n= this.neighbour_nodes;
		var len=n.length;
		this.neighbour_nodes[len] = arc; 
		return;
	};
	
	this.getNeighbours = function(){
	return this.neighbour_nodes;
	};
	
};

function O_Arc(destination, weight) {
	this.destination=destination;
	this.weight=weight;
	
	this.getWeight = function() {
    return this.weight;
	};
	
	this.getNext = function() {
    return this.destination;
	};
	
};

 //example of set of nodes and edges
 var node1=new O_Node( "state1" );
 var node2=new O_Node( "state2" );
 var node3=new O_Node( "state3" );
 node1.addNeighbour(node2, 1);
 node1.addNeighbour(node3, 2);
 node2.addNeighbour(node3, 3);
 node3.addNeighbour(node2, 4);
 
 //confirmation
 document.write('Content of node1: ' + node1.getContent() + '<br>');
 document.write('Content of node2: ' + node2.getContent() + '<br>');
 document.write('Content of node3: ' + node3.getContent() + '<br>');
 
 var i=0;
 var n=node1.getNeighbours();
 var len=n.length;
 var text='<br>List of neighbours for node 1:<br>';
 for (i = 0; i < len; i++) { 
 text += 'Destination: ' + n[i].getNext().getContent() + '; ' + 'Weight: ' + n[i].getWeight() + '<br>'; 
 };
 document.write(text);
 
 n=node2.getNeighbours();
 len=n.length;
 text='<br>List of neighbours for node 2:<br>';
 for (i = 0; i < len; i++) { 
 text += 'Destination: ' + n[i].getNext().getContent() + '; ' + 'Weight: ' + n[i].getWeight() + '<br>'; 
 };
 document.write(text);
 
 n=node3.getNeighbours();
 len=n.length;
 text='<br>List of neighbours for node 3:<br>';
 for (i = 0; i < len; i++) { 
 text += 'Destination: ' + n[i].getNext().getContent() + '; ' + 'Weight: ' + n[i].getWeight() + '<br>'; 
 };
 document.write(text);
 