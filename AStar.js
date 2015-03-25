/// <reference path="Datastructures/PriorityQueue.ts"/>
var AStar;
(function (AStar) {
    var PriorityQueue = require('PriorityQueue');
    function asdasdJarnaMain() {
        var queue = new PriorityQueue();
        var came_from = {};
    }
    AStar.asdasdJarnaMain = asdasdJarnaMain;
    function reconstruct_path(came_from, current) {
        var total_path = [];
        while (current in came_from) {
            current = came_from;
            total_path.push(current);
        }
        return total_path;
    }
})(AStar || (AStar = {}));
