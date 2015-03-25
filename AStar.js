///<reference path='collections.d.ts'/>
var AStar;
(function (AStar) {
    var IGraph = (function () {
        function IGraph() {
        }
        return IGraph;
    })();
    //TBD
    function compareT(a, b) {
        if (1) {
            return 1;
        }
        if (-1) {
            return -1;
        }
        return 0;
    }
    function asdasdJarnaMain() {
        var queue = new collections.PriorityQueue(compareT);
        var graph = {};
        graph[0] = { id: 0, hweight: 0, neighbours: [[2, 1], [4, 2]] };
        graph[1] = { id: 1, hweight: 15, neighbours: [[2, 0], [2, 2], [2, 3]] };
        graph[2] = { id: 2, hweight: 30, neighbours: [[2, 0], [2, 1], [2, 3]] };
        graph[3] = { id: 3, hweight: 5, neighbours: [[2, 1], [2, 2]] };
        return astar(1, 2, graph);
    }
    AStar.asdasdJarnaMain = asdasdJarnaMain;
    function astar(start, goal, graph) {
        var closedSet = [];
        var openSet = new collections.PriorityQueue();
        openSet.add(graph[start]);
        var came_from = {};
        while (!openSet.isEmpty()) {
            var current = openSet.dequeue();
            if (current.id == goal) {
                return reconstruct_path(came_from, goal);
            }
            closedSet.push(current.id);
            console;
            for (var e in current.neighbours) {
                if (!arrayIsMember(e[1], closedSet)) {
                }
            }
        }
    }
    function reconstruct_path(came_from, current) {
        var total_path = [];
        while (came_from[current] != null) {
            current = came_from[current];
            total_path.push(current);
        }
        return total_path;
    }
    function arrayIsMember(e, array) {
        for (var v in array) {
            if (e == v) {
                return true;
            }
        }
        return false;
    }
})(AStar || (AStar = {}));
