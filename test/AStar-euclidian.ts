///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts"/>
///<reference path="../typings/chai/chai.d.ts"/>

import chai = require('chai');
import A = require('../astar/AStar-tryout');

export module AStarEuclidian {
  export class PuzzleState implements A.AS.Heuristic {
    puzzle: number[][];
    h: number;
    heuristic(goal: PuzzleState) {
      var sum = 0;
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          var nr = this.puzzle[i][j];
          var x = this.puzzle[i][j] % 3;
          var y = this.puzzle[i][j] / 3;
          sum += Math.abs(i - x) + Math.abs(j - y); 
        }
      }
      return sum;
    }
    match(goal: PuzzleState) {
	return this.puzzle == goal.puzzle;
    }
    constructor(matrix: number[][]) {
      this.puzzle = matrix;
    }
  }

  var firstMatrix = [[7, 2, 4], [5, 0, 6], [8, 3, 1]];
  var firstState = new PuzzleState(firstMatrix);
}
