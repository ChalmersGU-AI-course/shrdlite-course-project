/// <reference path="./lib/node.d.ts"/>
var PriorQueue = require('libstl').PriorityQueue;
var Queue = require('libstl').Queue;
var Heap  = require('libstl').Heap;

//stub to represent a state in the graph of states.
//
class State {
    neighbors = new Queue();
    weight: number;
    previous: State;
}


//a-star implementation
//start: the start state
//goal: the state we want to reach
//heuristic: a function guessing which state should be analyzed next
function astar(start: State, goal: State, heuristic: (current: State, goal:
						    State) => number) {
    //list for all nodes visited at least one time
    var openlist = new PriorQueue();
    //list for all nodes where we have the shortest path to
    var closedlist= new Heap();

    //in the beginning, only the start state is known
    openlist.enqueue(start, 0);
    
    //iterate through the open list
    do {
	currentNode = openlist.dequeue();
	if(currentNode == goal) {
	    //TODO: return path
	}	
	closedlist.add(currentNode);
	expandNode(currentNode);
    } while (! openlist.isEmpty())
    //TODO: return no path found
}

//function that analyzes a state and put its neighbours to the openlist
//according to their astimated distance to the goal
function expandNode(currentNode: State) {
    var neighbor = currentNode.neighbors.bottom();
    while(neighbor != null ) {
	if(! findInHeap(neighbor, closedlist)){
	    tentative_g = currentNode.g + heuristic(currentNode, neighbor);
	    if (findInHeap(goal, openlist) && tentative_g >= neighbour.g) {
		continue;
	    }
	    neighbour.previous = currentNode;
	    neighbour.g = tentative_g;
	    f = tentative_g + heuristic(neighbour, goal);
	    if(findInHeap(neighbour, openlist) ) {
		//TODO update priority
	    } else {
		openlist.enqueue(neighbour, f);
	    }
	}
    }
}

//checks if an object is in a heap
function findInHeap(obj, heap : Heap) {
    var elem = heap.top();
    while(heap.valid()) {
	if(elem == obj) {
	    return true;
	}
	elem = heap.next();
    }
    return false;
}