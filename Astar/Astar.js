/// <reference path="lib/collections.ts" />
function postProcess(order, finish) {
    var stack = new collections.Stack();
    for (var x = finish; x >= 0; x = order[x].previous) {
        stack.push(order[x].state);
    }
    var result = Array();
    while (!stack.isEmpty()) {
        var s = stack.pop();
        result.push(s);
    }
    return result;
}
function oops(order) {
    var result = [];
    for (var n in order) {
        result.push(order[n].state);
    }
    return result;
}
function astar(f, c, h, start, isGoal, multiPathPruning) {
    if (multiPathPruning === void 0) { multiPathPruning = true; }
    var queue = new collections.PriorityQueue(function (a, b) {
        return b.cost + h(b.state) - a.cost - h(a.state);
    });
    var order = [];
    var visited = new collections.Set();
    queue.enqueue({
        state: start,
        cost: 0,
        previous: -1
    });
    for (var x = 0; !queue.isEmpty(); ++x) {
        if (x > 150000) {
            alert("Stopping early after " + x + " iterations. Size of queue: " + queue.size() + " current cost: " + current.cost);
            return oops(order);
        }
        var current = queue.dequeue();
        if (multiPathPruning) {
            if (visited.contains(current.state)) {
                continue;
            }
            visited.add(current.state);
        }
        order[x] = current;
        if (isGoal(current.state)) {
            if (x > 1000) {
                alert("Completed but it took " + x + " iterations!");
            }
            return postProcess(order, x);
        }
        var neighbours = f(current.state);
        for (var n in neighbours) {
            var next = neighbours[n];
            queue.enqueue({
                state: next,
                cost: current.cost + c(current.state, next),
                previous: x
            });
        }
    }
    alert("No solution found!");
    return [];
}
