/*jslint node: true, esnext: true */
"use strict";

var Heap = require("./binary-heap-hash/binary-heap-hash");
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
    var front = new Heap(String);
    // Nodes that are already completely evaluated to prevent reevaluation
    var evaluated = new Set([], Object.equals, String);
    // Map of backlinks of best path.
    var previous = new Map([], Object.equals, String);
    // Map of actual distances from the start node;
    var d = new Map([], Object.equals, String);

    // Start exploring
    d.set(start, 0);
    front.add(start, h(start, goal));

    // When there are elements in the frontier, get the one with the lowest heuristic distance
    while (front.length > 0) {
        var elem = front.pop();
        evaluated.add(elem.obj);

        // Finished, follow backlinks to reconstruct path.
        if (Object.equals(elem.obj, goal)) {
            var ret = [];
            var bs = previous.get(goal);
            while (!Object.equals(bs, start)) {
                ret.unshift(bs);
                bs = previous.get(bs);
            }
            console.log('Nodes evaluated: ' + evaluated.length);
            return ret;
        }

        // Check every neighbour and see if this path improves the distance to it.
        for (var neigh of neighbours(elem.obj)) {
            if (evaluated.has(neigh)) {
                continue;
            }

            var old_distance = d.get(neigh, Infinity);
            var new_distance = d.get(elem.obj) + cost(elem.obj, neigh);
            if (new_distance < old_distance) {
                d.set(neigh, new_distance);
                previous.set(neigh, elem.obj);

                // Update front
                var new_approx = new_distance + h(neigh, goal);
                if (!front.changePriority(neigh, new_approx)) {
                    front.add(neigh, new_approx);
                }
            }
        }
    }
    return undefined;
};
