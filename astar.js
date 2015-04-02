/// <reference path="collections.ts" />
/// <reference path="graph.ts" />
var AStar;
(function (AStar) {
    function AStarSearch(graph, start, goal, h) {
        var cameFrom = new collections.Dictionary();
        var costSoFar = new collections.Dictionary();
        var frontier = new collections.PriorityQueue(function (a, b) {
            if ((costSoFar.getValue(a) + h(a)) < (costSoFar.getValue(b) + h(b))) {
                return -1;
            }
            if ((costSoFar.getValue(a) + h(a)) > (costSoFar.getValue(b) + h(b))) {
                return 1;
            }
            return 0;
        });
        cameFrom.setValue(start, start);
        costSoFar.setValue(start, 0);
        frontier.enqueue(start);
        while (!frontier.isEmpty()) {
            var cur = frontier.dequeue();
            if (cur === goal) {
                break;
            }
            for (var next in cur.neighbors) {
                var newCost = costSoFar.getValue(cur) + graph.cost(cur, next);
                if (!costSoFar.containsKey(next) || newCost < costSoFar.getValue(next)) {
                    costSoFar.setValue(next, newCost);
                    frontier.enqueue(next);
                    cameFrom.setValue(next, cur);
                }
            }
        }
    }
    AStar.AStarSearch = AStarSearch;
})(AStar || (AStar = {}));
