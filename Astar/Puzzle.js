/// <reference path="Astar.ts" />
var PState = (function () {
    function PState(matr, iz, jz) {
        this.matr = matr;
        this.iz = iz;
        this.jz = jz;
    }
    PState.prototype.slice = function () {
        var newMatr = [];
        for (var i in this.matr) {
            newMatr.push(this.matr[i].slice());
        }
        return new PState(newMatr, this.iz, this.jz);
    };
    PState.prototype.toString = function () {
        var str = "";
        for (var i in this.matr) {
            str = str + "<p> [" + this.matr[i] + "]";
        }
        return "[" + str + "]<p>";
    };
    return PState;
})();
var pStart = new PState([
    [
        7,
        2,
        4
    ],
    [
        5,
        0,
        6
    ],
    [
        8,
        3,
        1
    ]
], 1, 1);
var pGoal = new PState([
    [
        0,
        1,
        2
    ],
    [
        3,
        4,
        5
    ],
    [
        6,
        7,
        8
    ]
], 0, 0);
function manhattan(i, j, x) {
    if (x == 0) {
        return 0;
    }
    return Math.abs((x % 3) - j) + Math.abs(Math.floor(x / 3) - i);
}
function puzzleHeuristic(a) {
    var sum = 0;
    for (var i in a.matr) {
        for (var j in a.matr[i]) {
            sum = sum + manhattan(i, j, a.matr[i][j]);
        }
    }
    return sum;
}
function puzzleGoal(a) {
    return puzzleHeuristic(a) === 0;
}
function swap(a, ix, jx) {
    var b = a.slice();
    b.matr[b.iz][b.jz] = b.matr[ix][jx];
    b.matr[ix][jx] = 0;
    b.iz = ix;
    b.jz = jx;
    return b;
}
function puzzleNeighbours(a) {
    var is = [
        -1,
        0,
        1,
        0
    ];
    var js = [
        0,
        -1,
        0,
        1
    ];
    var result = [];
    for (var n in is) {
        var ix = is[n] + a.iz;
        var jx = js[n] + a.jz;
        if (ix < 0 || jx < 0 || ix > 2 || jx > 2) {
            continue;
        }
        result.push(swap(a, ix, jx));
    }
    return result;
}
function puzzleCost(a, b) {
    return 1;
}
function runPuzzle() {
    return astar(puzzleNeighbours, puzzleCost, puzzleHeuristic, pStart, puzzleGoal, true);
}
