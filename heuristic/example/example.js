// Interface definitions for worlds
///<reference path="../World.ts"/>
var heuristics;
(function (_heuristics) {
    function heuristicOntop(first, second, stacks) {
        var foundF = -1;
        var foundS = -1;
        var h = 0;
        if (second == "floor") {
            h = Number.POSITIVE_INFINITY;
            for (var i = 0; i < stacks.length; i++) {
                if (stacks[i].length < h) {
                    foundS = i;
                    h = stacks[i].length * (pickDropCost + 1);
                }
            }
        }
        for (var i = 0; i < stacks.length; i++) {
            for (var j = 0; j < stacks[i].length; j++) {
                if (stacks[i][j] == second) {
                    foundS = i;
                    if (stacks[i].length - 1 > j && stacks[i][j + 1] == first) {
                        return 0;
                    }
                    h += (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
                if (stacks[i][j] == first) {
                    if (j == 0 && second == "floor") {
                        return 0;
                    }
                    foundF = i;
                    h += (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
                if (foundF != -1 && foundS != -1) {
                    return h + Math.abs(foundS - foundF) + pickDropCost;
                }
            }
        }
        return h + Math.abs(foundS - foundF) + pickDropCost;
    }
    function heuristicAbove(first, second, stacks) {
        var foundF = -1;
        var foundS = -1;
        var h = 0;
        for (var i = 0; i < stacks.length; i++) {
            for (var j = 0; j < stacks[i].length; j++) {
                if (stacks[i][j] == second) {
                    foundS = i;
                    for (var k = j; k < stacks[i].length; k++) {
                        if (stacks[i][k] == first) {
                            return 0;
                        }
                    }
                }
                if (stacks[i][j] == first) {
                    foundF = i;
                    h = (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
                if (foundF != -1 && foundS != -1) {
                    return h + Math.abs(foundS - foundF) + pickDropCost;
                }
            }
        }
        return h + Math.abs(foundS - foundF) + pickDropCost;
    }
    function heuristicUnder(first, second, stacks) {
        return heuristicAbove(second, first, stacks);
    }
    function heuristicBeside(first, second, stacks) {
        var foundF = -1;
        var foundS = -1;
        var hF = 0;
        var hS = 0;
        for (var i = 0; i < stacks.length; i++) {
            for (var j = 0; j < stacks[i].length; j++) {
                if (stacks[i][j] == second) {
                    foundS = i;
                    if (!foundF && stacks.length - 1 > i) {
                        for (var k = 0; k < stacks[i + 1].length; k++) {
                            if (stacks[i + 1][k] == first) {
                                return 0;
                            }
                        }
                    }
                    hS = (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
                if (stacks[i][j] == first) {
                    foundF = i;
                    if (!foundS && stacks.length - 1 > i) {
                        for (var k = 0; k < stacks[i + 1].length; k++) {
                            if (stacks[i + 1][k] == first) {
                                return 0;
                            }
                        }
                    }
                    hF = (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
                if (foundF && foundS) {
                    return Math.min(hF, hS) + Math.abs(foundS - foundF) + pickDropCost;
                }
            }
        }
        return Math.min(hF, hS) + Math.abs(foundS - foundF) + pickDropCost;
    }
    function heuristicLeft(first, second, stacks) {
        var foundF = -1;
        var foundS = -1;
        var hF = 0;
        var hS = 0;
        for (var i = 0; i < stacks.length; i++) {
            for (var j = 0; j < stacks[i].length; j++) {
                if (stacks[i][j] == second) {
                    foundS = i;
                    hS = (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
                if (stacks[i][j] == first) {
                    foundF = i;
                    if (!foundS) {
                        for (var k = 0; k < stacks[i + 1].length; k++) {
                            if (stacks.length - 1 > i && stacks[i + 1][k] == first) {
                                return 0;
                            }
                        }
                    }
                    hF = (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
                if (foundF && foundS) {
                    return Math.min(hF, hS) + Math.abs(foundS - foundF) + pickDropCost;
                }
            }
        }
        return Math.min(hF, hS) + Math.abs(foundS - foundF) + pickDropCost;
    }
    function heuristicRight(first, second, stacks) {
        return heuristicLeft(second, first, stacks);
    }
    function heuristicHold(first, stacks) {
        for (var i = 0; i < stacks.length; i++) {
            for (var j = 0; j < stacks[i].length; j++) {
                if (stacks[i][j] == first) {
                    return (stacks[i].length - 1 - j) * (pickDropCost + 1);
                }
            }
        }
        return 0;
    }
    function heuristics(first, rel, second, stacks) {
        switch (rel) {
            case "ontop":
                return heuristicOntop(first, second, stacks);
            case "inside":
                return heuristicOntop(first, second, stacks);
            case "above":
                return heuristicAbove(first, second, stacks);
            case "under":
                return heuristicUnder(first, second, stacks);
            case "beside":
                return heuristicBeside(first, second, stacks);
            case "leftof":
                return heuristicLeft(first, second, stacks);
            case "rightof":
                return heuristicRight(first, second, stacks);
            case "holding":
                return heuristicHold(first, stacks);
            default:
                ////console.log("heuristics no match");
                return 0;
        }
    }
    _heuristics.heuristics = heuristics;
})(heuristics || (heuristics = {}));
/// <reference path="../Heuristic.ts" />
function state1() {
    return {
        "stacks": [["e"], ["a", "l"], [], [], ["i", "h", "j"], [], [], ["k", "g", "c", "b"], [], ["d", "m", "f"]],
        "holding": null,
        "arm": 0,
        "objects": {},
        "examples": []
    };
}
function state2() {
    return {
        "stacks": [["e"], ["a", "l"], [], [], ["i", "h", "j"], [], [], ["k", "g", "c", "b"], [], ["d", "m", "f"]],
        "holding": null,
        "arm": 0,
        "objects": {},
        "examples": []
    };
}
function runExample(element) {
    element.innerHTML += "Example to check heuristic for worlds";
    element.innerHTML += "<br><br>";
    var h = heuristics.worldHeuristics(state1(), state2());
    element.innerHTML += "The Value is: ";
    element.innerHTML += h;
    element.innerHTML += "<br>";
}
window.onload = function () {
    var el = document.getElementById('content');
    runExample(el);
};
