'use strict';

var Heap = require('collections/heap');
var Set = require('collections/set');


// sac
// b df
// e  g 

// TODO: Represent neighbours as edges instead?
var g = { id: "g", x: 3, y: 2,  neighbours: [] };
var f = { id: "f", x: 3, y: 1,  neighbours: [g] };
var e = { id: "e", x: 0, y: 2,  neighbours: [] };
var d = { id: "d", x: 2, y: 1,  neighbours: [f] };
var c = { id: "c", x: 2, y: 0,  neighbours: [d] };
var b = { id: "b", x: 0, y: 1,  neighbours: [e] };
var a = { id: "a", x: 1, y: 0,  neighbours: [c] };
var s = { id: "s", x: 0, y: 0,  neighbours: [a, b] };
s.g = 0;
s.f = h(s, g);

console.log(astar(s, g));

function manhattan(from, to) {
	return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

function h(from, to) {
	return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
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
	var frontier = new Heap([start], function(a, b) {
		return a === b;
	}, function(a, b) {
		return b.f - a.f;
	});
	var visited = new Set();

	debugger;
	while(frontier.length > 0) {
		var current = frontier.pop();

		if(current === goal) {
			return rebuild_path(goal);
		}

		visited.add(current);

		for(var i = 0; i < current.neighbours.length; i++) {
			var neighbour = current.neighbours[i];
			var cost = current.g + manhattan(current, neighbour);

			if(frontier.indexOf(neighbour) !== -1 && cost < neighbour.g) {
				// New path is better, remove neighbour from frontier
				frontier.delete(neighbour);
			}

			if(!frontier.indexOf(neighbour) !== -1 && !visited.contains(neighbour)) {
				neighbour.g = cost;
				neighbour.f = neighbour.g + h(neighbour, goal);
				frontier.push(neighbour);
				neighbour.parent = current;
			}
		}
	}
	return false;
}
