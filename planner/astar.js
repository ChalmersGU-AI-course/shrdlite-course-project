/*jslint node: true, esnext: true */
"use strict";

function Set(tostring) {
    this.tostring = tostring;
    this.store = {};
}

Set.prototype.add = function(elem) {
    this.store[this.tostring(elem)] = true;
};

Set.prototype.has = function(elem) {
    return this.tostring(elem) in this.store;
};

Set.prototype.size = function(elem) {
    return Object.keys(this.store).length;
};


function Map(tostring) {
    this.tostring = tostring;
    this.store = {};
}

Map.prototype.get = function(key, def) {
    var ret = this.store[this.tostring(key)];
    if (ret === undefined) {
        return def;
    } else {
        return ret;
    }
};

Map.prototype.set = function(key, val) {
    this.store[this.tostring(key)] = val;
};


var Heap = require("./binary-heap-hash/binary-heap-hash");


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
    // var evaluated = new Set([], Object.equals, G.state_hash);
    var evaluated = new Set(G.state_hash);
    // Map of backlinks of best path.
    var previous = new Map(G.state_hash);
    // Map of actual distances from the start node;
    var d = new Map(G.state_hash);

    // Start exploring
    d.set(start, 0);
    front.add(start, G.h(start));

    // When there are elements in the frontier, get the one with the lowest heuristic distance
    while (front.length > 0) {
        var elem = front.pop().obj;
        evaluated.add(elem);

        // Finished, follow backlinks to reconstruct path.
        if (G.isgoal(elem)) {
            var ret = [];
            var bs = elem;
            while (G.state_hash(bs) != G.state_hash(start)) {
                ret.unshift(bs);
                bs = previous.get(bs);
            }
            ret.unshift(bs);
            console.log('Nodes evaluated: ' + evaluated.size());
            console.log('Goal steps: ' + (ret.length-1));
            return ret;
        }

        // Check every neighbour and see if this path improves the distance to it.
        for (var neigh_container of G.neighbours(elem)) {
            var neigh = neigh_container.state;
            if (evaluated.has(neigh)) {
                continue;
            }

            var old_distance = d.get(neigh, Infinity);
            var new_distance = d.get(elem) + neigh_container.cost;
            if (new_distance < old_distance) {
                d.set(neigh, new_distance);
                previous.set(neigh, elem);

                // Update front
                var new_approx = new_distance + G.h(neigh);
                if (!front.changePriority(neigh, new_approx)) {
                    front.add(neigh, new_approx);
                }
            }
        }
    }
    console.log('Nodes evaluated: ' + evaluated.size());
    return undefined;
};
