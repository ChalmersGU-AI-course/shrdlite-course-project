///<reference path="lib/collections.ts"/>
///<reference path="lib/node.d.ts"/>
///<reference path="Graph.ts"/>

var fs = require('fs');


class TestNode {
    constructor(public pos : Coordinate) {}

    add(delta : Coordinate) : TestNode {
        return new TestNode({
            x: this.pos.x + delta.x,
            y: this.pos.y + delta.y
        });
    }


    compareTo(other : TestNode) : number {
        return (this.pos.x - other.pos.x) || (this.pos.y - other.pos.y);
    }
    
    toString() : string {
        return "(" + this.pos.x + "," + this.pos.y + ")";
    }
}


class TestGrid implements Graph<TestNode> {
    private walls : collections.Set<TestNode>;

    constructor(
        public size : Coordinate,
        public obstacles : Coordinate[]
    ) {
        this.walls = new collections.Set<TestNode>();
        for (var pos of obstacles) {
            this.walls.add(new TestNode(pos));
	    //console.log(pos);
        }
        for (var x = -1; x <= size.x; x++) {
            this.walls.add(new TestNode({x:x, y:-1}));
            this.walls.add(new TestNode({x:x, y:size.y}));
        }
        for (var y = -1; y <= size.y; y++) {
            this.walls.add(new TestNode({x:-1, y:y}));
            this.walls.add(new TestNode({x:size.x, y:y}));
        }
    }

    outgoingEdges(node : TestNode) : Edge<TestNode>[] {
        var outgoing : Edge<TestNode>[] = [];
        for (var dx = -1; dx <= 1; dx++){ 
            for (var dy = -1; dy <= 1; dy++) {
	    if (! (dx*dx == dy*dy)) {
                    var next = node.add({x:dx, y:dy});
                    if (! this.walls.contains(next)) {
                        outgoing.push({
                            from: node,
                            to: next,
                            cost: 1 //Math.sqrt(dx*dx + dy*dy)
                        });
                    }
             }
            }
        }
        return outgoing;
    }

    compareNodes(a : TestNode, b : TestNode) : number {
        return a.compareTo(b);
    }

    toString(start : TestNode, goal : TestNode) : string {
        var borderRow = "+" + new Array(this.size.x + 1).join("--+");
        var betweenRow = "+" + new Array(this.size.x + 1).join("  +");
        var str = "\n" + borderRow + "\n";
        for (var y = this.size.y-1; y >= 0; y--) {
            str += "|";
            for (var x = 0; x < this.size.x; x++) {
                str += this.walls.contains(new TestNode({x:x,y:y})) ? "## " :
		    (x == start.pos.x && y == start.pos.y ? " S " :
		     (x == goal.pos.x && y == goal.pos.y ? " G " : "   "));
            }
            str += "|\n";
            if (y > 0) str += betweenRow + "\n";
        }
        str += borderRow + "\n";
        return str;
    }

    drawPath(start : TestNode, goal : TestNode, path : TestNode[]) : string {
	function pathContains(path : TestNode[], n : TestNode) : boolean {
	    for (var p of path) {
		if (p.pos.x == n.pos.x && p.pos.y == n.pos.y)
		    return true;
	    }
	    return false;
	}
	var borderRow = "+" + new Array(this.size.x + 1).join("--+");
        var betweenRow = "+" + new Array(this.size.x + 1).join("  +");
        var str = "\n" + borderRow + "\n";
        for (var y = this.size.y-1; y >= 0; y--) {
            str += "|";
            for (var x = 0; x < this.size.x; x++) {
                str += this.walls.contains(new TestNode({x:x,y:y})) ? "## " :
		    (x == start.pos.x && y == start.pos.y ? " S " :
		     (x == goal.pos.x && y == goal.pos.y ? " G " :
		      ((pathContains(path, new TestNode({x:x,y:y})) ? ' * ' : "   "))));
            }
            str += "|\n";
            if (y > 0) str += betweenRow + "\n";
        }
        str += borderRow + "\n";
        return str;
    }    
}

interface TestCase {
    grid_size : number;
    walls : Coordinate[];
    path : TestNode[];
    cost : number
}

function isPath<Node>(g: Graph<Node>,
		      start: Node,
		      goalf: (n:Node) => boolean,
		      ns : Node[]) : boolean
{
//    console.log("isPath " + start + " : " + ns);
    if (ns === [])
	return false;
    if (ns.length == 1)
	return (goalf(start) && g.compareNodes(ns[0],start) == 0);
    var found = false;
    for (var edge of g.outgoingEdges(ns[0])) {

	if (g.compareNodes(ns[1],edge.to) == 0) {
	    found = true;
	    break;
	}
    }
    if (!found)
	return false;
    else
	return isPath(g, ns[1], goalf, ns.slice(1,ns.length));
}

function test(c: TestCase) : boolean {
    var g = new TestGrid({x:c.grid_size, y:c.grid_size}, c.walls);
    var start = new TestNode({x: 0, y: 0});
    var goal = new TestNode({x: g.size.x-1, y: g.size.y-1});
    var goalf = (n: TestNode) => n.compareTo(goal) == 0;
    var h = (n: TestNode) => 0; //Math.abs(n.pos.x - goal.pos.x) + Math.abs(n.pos.y - goal.pos.y);

//    console.log(g.toString(start,goal))

    try {
	var result  = aStarSearch(g, start, goalf, h, 1000);

	if (JSON.stringify(c.path) === JSON.stringify(result.path))
	    return true;
	else {
	    // may be a different path to the goal node of the same length
	    if (isPath(g, start, goalf, result.path) && result.cost == c.cost)
		return true;
	    else
		console.log("The result is not a path of optimal length from " + start + " to the goal!");
	    
	    console.log("Test failed!");
	    
	    console.log("Start: " + start.toString());
	    console.log("Goal: " + goal.toString());
	    console.log(g.drawPath(start, goal, result.path));
	    console.log("Result: " + result.path);
	    console.log("Cost: " + result.cost);
	    
	    console.log("Expected path: ")
	    var s = "";
	    for (var i of c.path) {
		s = s + (new TestNode(i.pos)).toString();
	    }
	    console.log(s);
	    console.log("Expected cost: " + c.cost);
	    return false;
	}
    } catch (e) {
	console.log("Test failed! No path found");
	
	console.log("Start: " + start.toString());
	console.log("Goal: " + goal.toString());
	console.log(g.toString(start, goal));
	
	console.log("Expected path: " + c.path);
	console.log("Expected cost: " + c.cost);
    }
    return false;
}

function runTests() : void {
    var cs = <TestCase[]>JSON.parse(fs.readFileSync('aStarTestCases.json','utf8'));
    var n = 0;
    var total = cs.length;
    for (var c of cs) {
	if (test(c))
	    n++;
	else
	    continue;
    }
    console.log("Summary: " + n + " tests passed out of " + total);
}

runTests();
