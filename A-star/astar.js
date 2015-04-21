"use strict";

var Heap = require("collections/heap");
var Map = require("collections/map");
var Set = require("collections/set");

function front_cmp (a, b) {
    return b.approx - a.approx;
}

// A-star algorithm. Should have optimal complexity
// Terminates if the graph is finite or has a solution
// Arguments:
// h: heuristic function from one node to another
// cost: cost from one node to an adjacent node
// neighbours: returns the neighbours from any given node
// start, goal: obvious
// Returns list of an optimal path or undefined if there is none.
module.exports = function (cost, h, neighbours, start, goal) {
    // Frontier, heap map sorted by lowest approximated distance
    var front = new Heap([], Object.equals, front_cmp);
    // Map of the elements to their object in the front.
    // Needed to update priority in O(log n)
    var reverseMap = new Map([], Object.equals, String);
    // Nodes that are already completely evaluated to prevent reevaluation
    var evaluated = new Set([], Object.equals, String);
    // Map of backlinks of best path.
    var previous = new Map([], Object.equals, String);
    // Map of actual distances from the start node;
    var d = new Map([], Object.equals, String);

    // Start exploring
    d.set(start, 0);
    var tmp = {node: start, approx: h(start, goal)};
    front.push(tmp);
    reverseMap.set(start, tmp);

    // When there are elements in the frontier, get the one with the lowest heuristic distance
    while (front.length > 0) {
        var elem = front.pop();
        reverseMap.delete(elem.node);
        evaluated.add(elem.node);

        // Finished, follow backlinks to reconstruct path.
        if (Object.equals(elem.node, goal)) {
            var ret = [];
            var bs = previous.get(goal);
            while (!Object.equals(bs, start)) {
                ret.unshift(bs)
                bs = previous.get(bs);
            }
            console.log('Nodes evaluated: ' + evaluated.length);
            return ret;
        }

        // Check every neighbour and see if this path improves the distance to it.
        for (var neigh of neighbours(elem.node)) {
            if (evaluated.has(neigh)) {
                continue;
            }

            var old_distance = d.get(neigh, Infinity);
            var new_distance = d.get(elem.node) + cost(elem.node, neigh);
            if (new_distance < old_distance) {
                d.set(neigh, new_distance);
                previous.set(neigh, elem.node);

                // Update front
                var new_approx = new_distance + h(neigh, goal);
                var upd = reverseMap.get(neigh);
                if (upd === undefined) {
                    var tmp = {node: neigh, approx: new_approx};
                    front.push(tmp);
                    reverseMap.set(neigh, tmp);
                } else {
                    var idx = front.indexOf(upd);
                    upd.approx = new_approx;
                    front.float(idx);
                }
            }
        }
    }
    return undefined;
}