/// <reference path="Datastructures/PriorityQueue.ts"/>
var AStar;
(function (AStar) {
    function asdasd() {
        var PriorityQueue = require('./libstl').PriorityQueue;
        var queue = new PriorityQueue();
    }
    AStar.asdasd = asdasd;
    function reconstruct_path(came_from, current) {
        var total_path = [];
        while (current in came_from) {
            current = came_from;
            total_path = total_path[current];
        }
        return total_path;
    }
})(AStar || (AStar = {}));
