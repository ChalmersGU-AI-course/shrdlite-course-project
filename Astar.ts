///<reference path="lib/collections.ts"/>

class Neighbour<T> {
	constructor (
		public Node: T,
		public Cost: number
	){}
}

interface INode<T> {
	Neighbours(): Neighbour<INode<T>>[];
}

interface GoalFunction<T> {
	(node: T): boolean;
}

interface HeuristicFunction<T> {
	(nodeFrom: T, nodeTo: T): number;
}

class Path<T> {
	constructor(
		public Nodes: T[],
		public Cost: number,
		public HeuristicCost: number
	){}
	Add(node: T, cost: number, heuristicCost: number): Path<T> {
		var nodes = this.Nodes.slice();
		nodes.push(node);
		return new Path(nodes, this.Cost + cost, heuristicCost);
	}
	Last(): T {
		return this.Nodes[this.Nodes.length - 1];
	}
}

class AstarResult<T> {
	constructor(
		public Path: Path<T>,
		public NumExpandedNodes: number
	){}
	IsValid(): boolean {
		return Path !== null;
	}
}

function PathCompare<T>(p0: Path<T>, p1: Path<T>): number {
	var p0Cost = p0.Cost + p0.HeuristicCost;
	var p1Cost = p1.Cost + p1.HeuristicCost;
	if (p0Cost < p1Cost) {
		return 1;
	} else if (p0Cost == p1Cost) {
		return 0;
	}
	return -1;
}

function Astar<T>(start: INode<T>, isGoal: GoalFunction<INode<T>>, heuristic: HeuristicFunction<INode<T>>): AstarResult<INode<T>> {
	var frontier = new collections.PriorityQueue<Path<INode<T>>>(PathCompare);
	var visited = new collections.Dictionary<INode<T>, number>();

	var numExpandedNodes = 0;
	var startPath : Path<INode<T>> = new Path<INode<T>>([start], 0, 0);
	frontier.enqueue(startPath);
	while (!frontier.isEmpty()) {
		var path = frontier.dequeue();
		var currentNode = path.Last();
		if (isGoal(currentNode)) {
			return new AstarResult<INode<T>>(path, numExpandedNodes);
		}
		var neighbours = currentNode.Neighbours();
		for (var i = 0; i < neighbours.length; ++i) {
			var neighbour = neighbours[i];
			var visitedCost = visited.getValue(neighbour.Node);
			if (visitedCost === undefined || visitedCost > path.Cost + neighbour.Cost) {
				var heuristicCost = heuristic(currentNode, neighbour.Node);
				var newPath = path.Add(neighbour.Node, neighbour.Cost, heuristicCost);

				visited.setValue(neighbour.Node, newPath.Cost);
				frontier.enqueue(newPath);

				++numExpandedNodes;
			}
		}
	}
	return new AstarResult<INode<T>>(null, numExpandedNodes);
}
