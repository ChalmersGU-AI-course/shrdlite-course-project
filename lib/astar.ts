/// <reference path="typescript-collections.ts" />

// A-Star A-team implementation by Team Dandelion

module aStar {
	export function aStar(fromState : WorldState, toState : WorldState) : int {
		// Initialization
		var evaluatedStates = new collections.Set<WorldState>(); 
		var statesToEvalute = new collections.PriorityQueue<WorldState>();
		var pathToState = new collections.Map<WorldState, WorldState>();
		var costToState : int[];
		var optimalCost : int = getDistance(fromState, toState);

		costToState[0] = 0;
		statesToEvalute.add(fromState);

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

	interface ExtendedWorldState extends World.WorldState {
		costToState : int;
		pathToState : WorldState[];
		abstractDist : int;

		function boolean compareTo(first : ExtendedWorldState, second : ExtendedWorldState) {
			
		}
	}
}