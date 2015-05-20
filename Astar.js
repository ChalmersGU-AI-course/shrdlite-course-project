///<reference path="lib/collections.ts"/>
var Neighbour = (function () {
    function Neighbour(Node, Cost, Operation) {
        this.Node = Node;
        this.Cost = Cost;
        this.Operation = Operation;
    }
    return Neighbour;
})();
var Path = (function () {
    function Path(Nodes, Steps, Cost, HeuristicCost) {
        this.Nodes = Nodes;
        this.Steps = Steps;
        this.Cost = Cost;
        this.HeuristicCost = HeuristicCost;
    }
    Path.prototype.Add = function (node, operation, cost, heuristicCost) {
        var nodes = this.Nodes.slice();
        nodes.push(node);
        var steps = this.Steps.slice();
        steps.push(operation);
        return new Path(nodes, steps, this.Cost + cost, heuristicCost);
    };
    Path.prototype.Last = function () {
        return this.Nodes[this.Nodes.length - 1];
    };
    return Path;
})();
var AstarResult = (function () {
    function AstarResult(Path, NumExpandedNodes) {
        this.Path = Path;
        this.NumExpandedNodes = NumExpandedNodes;
    }
    AstarResult.prototype.IsValid = function () {
        return Path !== null;
    };
    return AstarResult;
})();
var TimeoutException = (function () {
    function TimeoutException() {
    }
    return TimeoutException;
})();
function PathCompare(p0, p1) {
    var p0Cost = p0.Cost + p0.HeuristicCost;
    var p1Cost = p1.Cost + p1.HeuristicCost;
    if (p0Cost < p1Cost) {
        return 1;
    }
    else if (p0Cost == p1Cost) {
        return 0;
    }
    return -1;
}
function Astar(start, isGoal, heuristic, timeout) {
    var frontier = new collections.PriorityQueue(PathCompare);
    var visited = new collections.Dictionary();
    var startTime = Date.now();
    var numExpandedNodes = 0;
    var startPath = new Path([start], [], 0, 0);
    frontier.enqueue(startPath);
    while (!frontier.isEmpty()) {
        var path = frontier.dequeue();
        var currentNode = path.Last();
        if (isGoal(currentNode)) {
            return new AstarResult(path, numExpandedNodes);
        }
        var neighbours = currentNode.Neighbours();
        for (var i = 0; i < neighbours.length; ++i) {
            var neighbour = neighbours[i];
            var visitedCost = visited.getValue(neighbour.Node);
            if (visitedCost === undefined || visitedCost > path.Cost + neighbour.Cost) {
                var heuristicCost = heuristic(currentNode, neighbour.Node);
                var newPath = path.Add(neighbour.Node, neighbour.Operation, neighbour.Cost, heuristicCost);
                visited.setValue(neighbour.Node, newPath.Cost);
                frontier.enqueue(newPath);
                ++numExpandedNodes;
            }
        }
        if (timeout && (Date.now() - startTime) > timeout) {
            throw new TimeoutException();
        }
    }
    return new AstarResult(null, numExpandedNodes);
}
