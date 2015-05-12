/*jslint node: true, esnext: true */
"use strict";

var Heap = require("./binary-heap-hash/binary-heap-hash");
var Map = require("collections/map");
var Set = require("collections/set");


// A-star algorithm. Should have optimal complexity
// Terminates if the graph is finite or has a solution
// Arguments:
// h: heuristic function from one node to another
// cost: cost from one node to an adjacent node
// neighbours: returns the neighbours from any given node
// start, goal: obvious
// Returns list of an optimal path or undefined if there is none.
module.exports = function (G, start) {
    // Frontier, heap map sorted by lowest approximated distance
    var front = new Heap(G.state_hash);
    // Nodes that are already completely evaluated to prevent reevaluation
    var evaluated = new Set([], Object.equals, G.state_hash);
    // Map of backlinks of best path.
    var previous = new Map([], Object.equals, G.state_hash);
    // Map of actual distances from the start node;
    var d = new Map([], Object.equals, G.state_hash);

    // Start exploring
    d.set(start, 0);
    front.add(start, G.h(start));

    // When there are elements in the frontier, get the one with the lowest heuristic distance
    while (front.length > 0) {
        var elem = front.pop();
        evaluated.add(elem.obj);

        // Finished, follow backlinks to reconstruct path.
        if (G.isgoal(elem.obj)) {
            var ret = [elem.obj];
            var bs = previous.get(elem.obj);
            while (!Object.equals(bs, start)) {
                ret.unshift(bs);
                bs = previous.get(bs);
            }
            ret.unshift(bs);
            console.log('Nodes evaluated: ' + evaluated.length);
            return ret;
        }

        // Check every neighbour and see if this path improves the distance to it.
        for (var neigh of G.neighbours(elem.obj)) {
            if (evaluated.has(neigh)) {
                continue;
            }

            var old_distance = d.get(neigh, Infinity);
            var new_distance = d.get(elem.obj) + G.cost(elem.obj, neigh);
            if (new_distance < old_distance) {
                d.set(neigh, new_distance);
                previous.set(neigh, elem.obj);

                // Update front
                var new_approx = new_distance + G.h(neigh);
                if (!front.changePriority(neigh, new_approx)) {
                    front.add(neigh, new_approx);
                }
            }
        }
    }
    console.log('Nodes evaluated: ' + evaluated.length);
    return undefined;
};
