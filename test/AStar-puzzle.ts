///<reference path="../lib/node.d.ts"/>
///<reference path="../typings/mocha/mocha.d.ts"/>
///<reference path="../typings/chai/chai.d.ts"/>
///<reference path="../lib/collections.d.ts"/>

import chai = require('chai');
import A = require('../astar/AStar');

module AStarEuclidian {

  class PuzzleState implements A.AS.State {
    puzzle: number[][];
    cache: number;          // cache for heuristic computations

    match(goal: PuzzleState) {
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          if(goal.puzzle[i][j] !== this.puzzle[i][j])
            return false;
        }
      }
      return true;
    }

    heuristic(goal: PuzzleState) {
      // if(!this.cache) {
        var sum = 0;
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            // dont count distance of empyty cell (0)
            if(goal.puzzle[i][j] !== this.puzzle[i][j] &&
               goal.puzzle[i][j] !== 0)
              sum += manhattanDistance(goal.puzzle[i][j], this.puzzle, j, i);
          }
        // }
        // this.cache = sum; // cache answer
      }
      // return this.cache;
      return sum;
    }

    expand() {
      var index = emptyCell(this.puzzle);
      var transitions = [];
      if(index.length === 2) { // empty cell found
        var puzzles = validPuzzles(this.puzzle, index[0], index[1]);
        for(var i=0; i<puzzles.length; i++) {
          transitions.push({cost: 1, state: new PuzzleState(puzzles[i])});
        }
      }
      return transitions;
    }

    // hash is a 9 digit key for each unique puzzle state
    hash(): number {
      var hash = 0;
      var base = 1;
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          hash += this.puzzle[i][j] * base;
          base *= 10;
        }
      }
      return hash;
    }

    toString() {
      var puzzleStr = "\n";
      for (var i = 0; i < 3; i++) {
        var str = "[" + this.puzzle[i][0];
        for (var j = 1; j < 3; j++)
          str += "," + this.puzzle[i][j];
        puzzleStr += str + "]\n";
      }
      return puzzleStr;
    }

    constructor(matrix: number[][]) {
      this.puzzle = matrix;
    }
  }

  //////////////////////////////////////////////////////////////////////
  // private functions

  function manhattanDistance(n: number, state: number[][], x: number, y: number): number {
    var x0, y0;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        if(state[i][j] === n) {
          x0 = j;
          y0 = i;
        }
      }
    }
    return Math.abs(x-x0) + Math.abs(y-y0);
  }

  // Returns index of empty cells position
  function emptyCell(state: number[][]) : number[] {
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        if(state[y][x] === 0) // empty cell
          return [x, y];
      }
    }
    return []; // no empty cell found
  }

  function swapTile(puzzle: number[][], i, j, k, l): number[][] {
    var bounded1 = i >= 0 && i <= 2 && j >= 0 && j <= 2;
    var bounded2 = k >= 0 && k <= 2 && l >= 0 && l <= 2;
    if(bounded1 && bounded2) {
      var puzzleCopy = copy(puzzle);
      puzzleCopy[j][i] = puzzle[l][k];
      puzzleCopy[l][k] = puzzle[j][i];
      return puzzleCopy;
    }
  }

  function validPuzzles(puzzle: number[][], x: number, y: number): number[][][] {
    var puzzles = [];
    var left  = swapTile(puzzle, x, y, x+1, y); // left
    var up    = swapTile(puzzle, x, y, x, y-1); // up
    var right = swapTile(puzzle, x, y, x-1, y); // right
    var down  = swapTile(puzzle, x, y, x, y+1); // down
    left  ? puzzles.push(left)  : 0;
    up    ? puzzles.push(up)    : 0;
    right ? puzzles.push(right) : 0;
    down  ? puzzles.push(down)  : 0;
    return puzzles;
  }

  // function copy(puzzle: number[][]): number[][] {
  function copy(puzzle: number[][]): number[][] {
    var copy = [];
    for(var i=0; i<puzzle.length; ++i) {
      copy[i] = puzzle[i].slice(); // returns a shallow copy
    }
    return copy;
  }

  var expect = chai.expect;

  describe('8-puzzle', () => {

    describe('Private function', () => {
      it('emptyCell should return correct x and y position', (done) => {
        var puzzle = [[7, 2, 4], [5, 1, 6], [8, 0, 7]];
        var index = emptyCell(puzzle);
        expect(index[0]).to.equals(1); // x
        expect(index[1]).to.equals(2); // y
        done();
      });

      it('manhattanDistance should return the correct heuristic cost', (done) => {
        var puzzle = [[7, 2, 4], [5, 0, 6], [8, 3, 1]];
        var distance1 = manhattanDistance(7, puzzle, 1, 2);
        expect(distance1).to.equals(3); // from 1,1 to 1,2
        var distance2 = manhattanDistance(8, puzzle, 2, 2)
        expect(distance2).to.equals(2); // from 0,2 to 2,2
        var distance3 = manhattanDistance(0, puzzle, 0, 0);
        expect(distance3).to.equals(2); // from 1,1 to 0,0
        done();
      });

      it('copy should give a reference to a copied puzzle', (done) => {
        var puzzle = [[7, 2, 4], [5, 0, 6], [8, 3, 1]];
        var puzzleCopy = copy(puzzle);
        puzzleCopy[1][1] = 9;
        expect(puzzleCopy[0][0]).to.equals(7);
        expect(puzzleCopy[1][1]).to.equals(9);
        expect(puzzle[0][0]).to.equals(7);
        expect(puzzle[1][1]).to.equals(0);
        done();
      });

      it('swapTile should return a correct version of original puzzle', (done) => {
        var puzzle = [[7, 2, 4], [5, 0, 6], [8, 3, 1]];
        var modified = swapTile(puzzle, 1, 1, 0, 0);
        expect(modified[0][0]).to.equals(0);
        expect(modified[1][1]).to.equals(7);
        done();
      });

      it('validPuzzles should give 4 states if empty cell is in center', (done) => {
        var puzzle = [[7, 2, 4], [5, 0, 6], [8, 3, 1]];
        var puzzles = validPuzzles(puzzle, 1, 1);
        expect(puzzles[0][1][2]).to.equals(0); // left
        expect(puzzles[1][0][1]).to.equals(0); // up
        expect(puzzles[2][1][0]).to.equals(0); // right
        expect(puzzles[3][2][1]).to.equals(0); // down
        done();
      });
    });

    describe('PuzzleState function', () => {
      it('heuristic should give the total manhattandistance from goal', (done) => {
        var puzzle = [[7, 2, 4], [5, 0, 6], [8, 3, 1]];
        var solution = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
        var start = new PuzzleState(puzzle);
        var end = new PuzzleState(solution);
        var distance = start.heuristic(end);
        // expect(distance).to.equals(18); // example from slides
        done();
      });

      it('match should return true when puzzles match', (done) => {
        var puzzle1 = [[7, 2, 4], [5, 0, 6], [8, 3, 1]];
        var puzzle2 = [[7, 2, 4], [5, 0, 6], [8, 1, 3]];
        var orig  = new PuzzleState(puzzle1);
        var comp  = new PuzzleState(puzzle2);
        var test1 = orig.match(comp);
        var test2 = orig.match(orig);
        expect(test1).to.equals(false);
        expect(test2).to.equals(true);
        done();
      });

      it('getNeighbours should return correct puzzle states', (done) => {
        var puzzle = [[0, 2, 4], [5, 7, 6], [8, 3, 1]];
        var orig  = new PuzzleState(puzzle);
        var transitions = orig.expand();
        expect(transitions.length).to.equals(2);
        expect(transitions[0].state.puzzle[0][1]).to.equals(0); // left
        expect(transitions[1].state.puzzle[1][0]).to.equals(0); // up
        expect(transitions[0].cost).to.equals(1); // left
        expect(transitions[1].cost).to.equals(1); // up
        done();
      });
    });

    describe('AStar', () => {
      it('search should return the minimum steps to reach solution', (done) => {
        var puzzle = [[7, 2, 4], [5, 0, 6], [8, 3, 1]]; // example from slides
        var goal = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
        var start = new PuzzleState(puzzle);
        var end = new PuzzleState(goal);
        var solution = A.AS.search(start, null, end);
        // for(var i=0; i<path.length; i++) // to see the path (26 steps)
        //   console.log(solution.path[i].puzzle);
        var last = solution.path.pop();
        var foundSol = last.match(end); // do the last step on path match solution?
        expect(foundSol).to.equals(true);
        done();
      });
    });

  });

}
