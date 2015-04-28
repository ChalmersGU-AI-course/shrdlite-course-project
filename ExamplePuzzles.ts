///<reference path="Puzzle.ts"/>

var ExamplePuzzles : {[s:string]: PuzzleState} = {};


ExamplePuzzles["8queens"] = {
    "InitialCost": 0,
    "stacks": [["a"],["b"],["c"],["d"],["e"],["f"],["g"],["h"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "a": { "form":"ball",   "size":"large",  "color":"white" },
        "b": { "form":"ball",   "size":"large",  "color":"white" },
        "c": { "form":"ball",   "size":"large",  "color":"white" },
        "d": { "form":"ball",   "size":"large",  "color":"white" },
        "e": { "form":"ball",   "size":"large",  "color":"white" },
        "f": { "form":"ball",   "size":"large",  "color":"white" },
        "g": { "form":"ball",   "size":"large",  "color":"white" },
        "h": { "form":"ball",   "size":"large",  "color":"white" },
        "x": { "form":"brick",   "size":"large", "color":"green" },
    },
    "examples": [
        "solve",
//        "random",
    ]
};

ExamplePuzzles["4queens"] = {
    "InitialCost": 0,
    "stacks": [["a"],[],["b"],[],["c"],[],["d"],[]],
    "holding": null,
    "arm": 0,
    "objects": {
        "a": { "form":"ball",   "size":"large",  "color":"white" },
        "b": { "form":"ball",   "size":"large",  "color":"white" },
        "c": { "form":"ball",   "size":"large",  "color":"white" },
        "d": { "form":"ball",   "size":"large",  "color":"white" },
        "x": { "form":"brick",   "size":"large", "color":"green" },
    },
    "examples": [
        "solve",
//        "random",
    ]
};
