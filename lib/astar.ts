/// <reference path="collections.ts" />
/// <reference path="../World.ts" />
// A-Star A-team implementation by Team Dandelion

module aStar {
	export function aStar(fromState : WorldState, toState : WorldState) : number {
		var evaluatedStates = new collections.Set<WorldState>(); 
		var statesToEvalute = new collections.PriorityQueue<WorldState>(compareStates);
		var pathToState = new collections.Dictionary<WorldState, WorldState>();
		var g_score = new collections.Dictionary<WorldState, number>();
		var f_score = new collections.Dictionary<WorldState, number>();
		//var costToState : int[];
		//var optimalCost : int = getDistance(fromState, toState);
		//costToState[0] = 0;
		statesToEvalute.add(fromState);
		g_score.setValue(fromState, 0);
		f_score.setValue(fromState, g_score.getValue(fromState) + getDistance(fromState, toState));


		while(!statesToEvalute.isEmpty()) {
			var currentState = statesToEvalute.dequeue();
			if(currentState == toState) {

			}
		}
		// (Check that worlds are compatible.)

		// Populate set with states reachable from from-state.
		// 

		// Do search with heuristic

		// Return path found with search
		return -1;
	}

	// Takes two worldstates and returns the abstract distance between them.
	function getDistance(from: WorldState, to: WorldState) : number {
		return 1;
	}

	function compareStates(a : WorldState, b : WorldState) : number {
		return 1;
	}
}