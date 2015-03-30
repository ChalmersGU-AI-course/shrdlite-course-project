/// <reference path ="Astar.ts" />

var grid = 
[
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];


class Cell implements Astar.Node
{
	x : number;
	y : number;

	constructor(x : number, y :number)
	{
		this.x = x;
		this.y = y;
	}

	equals(object : Astar.Node) : boolean
	{
		var cell = <Cell>object;
		return cell.x == this.x &&
			   cell.y == this.y;
	}

	toString() : string
	{
		return this.x.toString() + "|" + this.y.toString();
	}
}

function generator(cell : Cell) : Cell[]
{
	var cells:Cell[] = [];
	if(cell.x > 0)
	{
		cells.push(new Cell(cell.x - 1, cell.y));
		if(cell.y > 0)
			cells.push(new Cell(cell.x - 1, cell.y - 1));

		if(cell.y < 9)
			cells.push(new Cell(cell.x - 1, cell.y + 1))
	}

	if(cell.x < 9)
	{
		cells.push(new Cell(cell.x + 1, cell.y));
		if(cell.y > 0)
			cells.push(new Cell(cell.x + 1, cell.y - 1));

		if(cell.y < 9)
			cells.push(new Cell(cell.x + 1, cell.y + 1))
	}

	if(cell.y > 0)
		cells.push(new Cell(cell.x, cell.y - 1));

	if(cell.y < 9)
		cells.push(new Cell(cell.x, cell.y + 1))

	return cells;
}

function pCell(cell : Cell) : void
{ 
	console.log("X: ", cell.x, " Y: " , cell.y);
}

function abs(a : number)
{
	if(a >= 0)
		return a;
	else 
		return -a;
}

function manhatan(cell : Cell, goal : Cell) : number
{
	return abs(goal.x - cell.x) + abs(goal.y - cell.y);
}

function pointDist(a : Cell, b : Cell) : number
{
	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

function nullheuristic(cell : Cell, goal : Cell) : number
{
	return 0;
}

function rand(m : number)
{
	return Math.floor(Math.random() * m);
}

function enforce(exp : boolean, msg : string)
{
	if(!exp)
	{
		msg = msg || "Failed";
		throw msg; 
	}
}

function testHeuristic(numTests : number, heur : (a : Cell, b : Cell) => number, heurName : string)
{
	console.log("\nStarting tests for", heurName);
	for(var i = 0; i < numTests; i++)
	{
		var start = new Cell(rand(10), rand(10));
		var end   = new Cell(rand(10), rand(10));

		var apath = Astar.findPath(start, end, generator, heur);
		var dpath = Astar.findPath(start, end, generator, nullheuristic);



		enforce(apath.success == dpath.success && apath.success, "Astar failed.");
		enforce(apath.nodes.length == dpath.nodes.length, "Length differs")
		enforce(apath.nodes[0].equals(start), "Does not start at the start node!");
		enforce(apath.nodes[apath.nodes.length - 1].equals(end), "Does not end at the end node!");
		enforce(dpath.nodes[0].equals(start), "Does not start at the start node!");
		enforce(dpath.nodes[dpath.nodes.length - 1].equals(end), "Does not end at the end node!");

		console.log("\nTest", i, "\n");
		console.log("Between ", start, " and ", end);
		console.log("Nodes visited Astar:", apath.nodesVisited, "Dijkstra's algorithm:", dpath.nodesVisited);			
	}
}

testHeuristic(10, manhatan, "Manhatan");
testHeuristic(10, pointDist, "Point distance");