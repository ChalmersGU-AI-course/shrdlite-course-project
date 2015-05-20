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


class Cell 
{
	x : number;
	y : number;

	constructor(x : number, y :number)
	{
		this.x = x;
		this.y = y;
	}
}

function cellEquals(a : Cell, b : Cell) : boolean
{
	return a.x == b.x && a.y == b.y;
}

function cellString(c : Cell) : string
{
	return c.x.toString() + "|" + c.y.toString();
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

function nullheuristic(cell : Cell) : number
{
	return 0;
}

function abs(a : number)
{
	if(a >= 0)
		return a;
	else 
		return -a;
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

function validMove(from : Cell, to : Cell)
{
	return abs(from.x - to.x) <= 1 && 
		   abs(from.y - to.y) <= 1;
}

function enforceAstarResult(start : Cell, end : Cell, sRes : Astar.SearchResult<Cell>)
{
	enforce(sRes.success, "Astar failed.");
	enforce(cellEquals(sRes.nodes[0], start), "Does not start at the start node!");
	enforce(cellEquals(sRes.nodes[sRes.nodes.length - 1], end), "Does not end at the end node!");
	
	//Walk the path.
	for(var i = 0; i < sRes.nodes.length - 1; i++)
	{
		enforce(validMove(sRes.nodes[i], sRes.nodes[i + 1]), "Invalid move in path!");
	}
}

function testHeuristic(numTests : number, heur : (a : Cell, b : Cell) => number, heurName : string)
{
	console.log("\nStarting tests for", heurName);
	for(var i = 0; i < numTests; i++)
	{
		var start = new Cell(rand(10), rand(10));
		var end   = new Cell(rand(10), rand(10));
		
		var goal = function(c : Cell)
		{
			return cellEquals(c, end);
		}
		
		var wrappedHeur = function(c : Cell)
		{
			return heur(c, end);
		}
		
		var apath = Astar.findPath(start, generator, wrappedHeur, cellEquals, goal, cellString);
		var dpath = Astar.findPath(start, generator, nullheuristic, cellEquals, goal, cellString);

		enforceAstarResult(start, end, apath);
		enforceAstarResult(start, end, dpath);
		enforce(apath.nodes.length == dpath.nodes.length, "Length differs")


		console.log("\nTest", i, "\n");
		console.log("Between ", start, " and ", end);
		console.log("Nodes visited Astar:", apath.nodesVisited, "Dijkstra's algorithm:", dpath.nodesVisited);	
		console.log("NL", apath.nodes.length);			
	}
}


function manhatan(cell : Cell, goal : Cell) : number
{
	return abs(goal.x - cell.x) + abs(goal.y - cell.y);
}

function pointDist(a : Cell, b : Cell) : number
{
	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

testHeuristic(10, manhatan, "Manhatan");
testHeuristic(10, pointDist, "Point distance");