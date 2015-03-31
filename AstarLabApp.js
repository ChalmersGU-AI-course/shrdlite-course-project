'use strict';

var App = angular.module('AstarLab', []);

App.controller('AstarController', ['$scope', function($scope) {
	$scope.boardWidth = 3;
	$scope.boardHeight = 3;

	$scope.currentState = 0;
	$scope.boards = [];
	$scope.heuristics = [
		{name: "None", func: function(board) { return 0; }},
		{name: "Number of bricks out of place", func: NumBricksOutOfPlace},
		{name: "Total manhattan distance", func: TotalManhattanDistance},
	];
	$scope.selectedHeuristic = $scope.heuristics[0];

	$scope.numExpandedNodes = 0;

	$scope.randomize = function() {
		var board = RandomBoard($scope.boardWidth, $scope.boardHeight);
		$scope.currentState = 0;
		$scope.boards = [board];
	}

	$scope.plan = function() {
		var start = new Date().getTime();
		var astarResult = Astar($scope.boards[0], IsGoalBoard, $scope.selectedHeuristic.func);
		var end = new Date().getTime();
		$scope.timeTaken = end - start;
		$scope.numExpandedNodes = astarResult.NumExpandedNodes;
		$scope.boards = astarResult.Path.Nodes;
	}

	$scope.prev = function() {
		$scope.currentState = Math.max(0, $scope.currentState - 1);
	}

	$scope.next = function() {
		$scope.currentState = Math.min($scope.boards.length - 1, $scope.currentState + 1);
	}
	$scope.randomize();
}]);