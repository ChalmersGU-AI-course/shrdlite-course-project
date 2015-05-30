/// <reference path ="Astar.ts" />

//This example consists of navigating a grid from a start position to a goal position
//The dimensions of the grid is 10x10

//Class representing a position on the grid
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

//Returns true if the argument cells are the same
function cellEquals(a : Cell, b : Cell) : boolean
{
	return a.x == b.x && a.y == b.y;
}

function cellString(c : Cell) : string
{
	return c.x.toString() + "|" + c.y.toString();
}

//Generates all cells adjacent to the input cell
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

//A dummy heuristic incapable of differentiating between cells
function nullheuristic(cell : Cell) : number
{
	return 0;
}

//The absolute value function
function abs(a : number)
{
	if(a >= 0)
		return a;
	else 
		return -a;
}

//Returns a random integer between zero and the input
function rand(m : number)
{
	return Math.floor(Math.random() * m);
}

//Throws an exception with message msg if exp is false
function enforce(exp : boolean, msg : string)
{
	if(!exp)
	{
		msg = msg || "Failed";
		throw msg; 
	}
}

//Returns true if we can move between "from" and "to"
function validMove(from : Cell, to : Cell)
{
	return abs(from.x - to.x) <= 1 && 
		   abs(from.y - to.y) <= 1;
}

//Ensures that the A* result is valid
//If if it isn't, it throws an exception
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

//Tests the input heuristic "heur" using Dijkstra's algorithm and the A* search algorithm
//Prints the result to the console
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

    //Test A*
    var apath = Astar.findPath(start, generator, wrappedHeur, goal, cellString, 20000);

    //Test Dijkstra's
    //(without a valid heuristic, our A* implementation will use
		// the distance from the start as heuristic).
		var dpath = Astar.findPath(start, generator, nullheuristic, goal, cellString, 20000);

		enforceAstarResult(start, end, apath);
		enforceAstarResult(start, end, dpath);
		enforce(apath.nodes.length == dpath.nodes.length, "Length differs")


		console.log("\nTest", i, "\n");
		console.log("Between ", start, " and ", end);
		console.log("Nodes visited:");
		console.log("Astar:", apath.nodesVisited);
		console.log("Dijkstra's algorithm:", dpath.nodesVisited);
		console.log("NL", apath.nodes.length);
	}
}


//Returns the manhattan distance between the input cells
function manhatan(cell : Cell, goal : Cell) : number
{
	return abs(goal.x - cell.x) + abs(goal.y - cell.y);
}

//Returns the flight distance between the two cells
function pointDist(a : Cell, b : Cell) : number
{
	return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
}

//Test the Manhattan distance heuristic
testHeuristic(10, manhatan, "Manhatan");

//Test the point distance heuristic
testHeuristic(10, pointDist, "Point distance");
