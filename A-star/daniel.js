'use strict';

var SortedSet = require('collections/sorted-set');
var Set = require('collections/set');

// TODO: Represent neighbours as edges instead?
var g = { id: "g", x: 8, y: 8,  neighbours: [] };
var f = { id: "f", x: 7, y: 7,  neighbours: [g] };
var e = { id: "e", x: 6, y: 6,  neighbours: [g] };
var d = { id: "d", x: 5, y: 5,  neighbours: [f] };
var c = { id: "c", x: 4, y: 4,  neighbours: [] };
var b = { id: "b", x: 3, y: 3,  neighbours: [e] };
var a = { id: "a", x: 2, y: 2,  neighbours: [c, d] };
var s = { id: "s", x: 1, y: 1,  neighbours: [a, b] };
s.g = 0;
s.f = h(s, g);

console.log(astar(s, g));

function h(from, to) {
	return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

function rebuild_path(a) {
	var i = a;
	var res = [i.id];

	while(i.parent) {
		i = i.parent;
		res.push(i.id);
	}
	return res.reverse();
}


function astar(start, goal) {
	var frontier = new SortedSet([start], function(a, b) {
		return a === b;
	}, function(a, b) {
		return a.f - b.f;
	});
	var visited = new Set();

	while(frontier.length > 0) {
		var current = frontier.shift(); // Shift pops the minimal value

		if(current === goal) {
			return rebuild_path(goal);
		}

		visited.add(current);

		for(var i = 0; i < current.neighbours.length; i++) {
			var neighbour = current.neighbours[i];
			var cost = current.g + 1; // FIXME: move cost is not always 1


			if(frontier.contains(neighbour) && cost < neighbour.g) {
				// New path is better, remove neighbour from frontier
				frontier.delete(neighbour);
			}

			if(!frontier.contains(neighbour) && !visited.contains(neighbour)) {
				neighbour.g = cost;
				neighbour.f = neighbour.g + h(neighbour, goal);
				frontier.push(neighbour);
				neighbour.parent = current;
			}
		}
	}
	return false;
}
