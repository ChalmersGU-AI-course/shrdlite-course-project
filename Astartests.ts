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

function cellString(cell : Cell) : string
{
	return cell.x.toString() + "|" + cell.y.toString();
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

function heuristic(cell : Cell, goal : Cell) : number
{
	return abs(goal.x - cell.x) + abs(goal.y - cell.y);
}

function nullheuristic(cell : Cell, goal : Cell) : number
{
	return 0;
}

function equals(a : Cell, b : Cell) : boolean
{
	return a.x === b.x && a.y === b.y;
}

var path = Astar.findPath<Cell>(new Cell(5,2), new Cell(5, 9), 
								generator, equals, cellString, 
								heuristic);

for(var i = 0; i < path.nodes.length; i++)
{

	pCell(path.nodes[i]);
}