/// <reference path="collections.ts" />

// A-Star A-team implementation by Team Dandelion

module aStar {
	export function aStar(fromState : WorldState, toState : WorldState) : int {
		var evaluatedStates = new collections.Set<WorldState>(); 
		var statesToEvalute = new collections.PriorityQueue<WorldState>(compareStates : ICompareFunction<WorldState>);
		var pathToState = new collections.Map<WorldState, WorldState>();
		var g_score = new collections.Map<WorldState, int>();
		var f_score = new collections.Map<WorldState, int>();
		//var costToState : int[];
		//var optimalCost : int = getDistance(fromState, toState);
		//costToState[0] = 0;
		statesToEvalute.add(fromState);
		g_score.add(fromState, 0);
		f_score.add(fromState, g_score.getValue(fromState) + getDistance(fromState, toState);


		while(!statesToEvalute.isEmpty()) {
			currentState = statesToEvalute.dequeue();
			if(currentState == toState) {

			}
		}
		// (Check that worlds are compatible.)

		// Populate set with states reachable from from-state.
		// 

		// Do search with heuristic

		// Return path found with search
	}

	// Takes two worldstates and returns the abstract distance between them.
	function getDistance(from: WorldState, to: WorldState) : int {
		return 1;
	}

	function comparestates(a : wo)
}