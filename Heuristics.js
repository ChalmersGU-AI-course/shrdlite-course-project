///<reference path="World.ts"/>
var Heuristics;
(function (Heuristics) {
    function simple(start, end) {
        return 0;
    }
    Heuristics.simple = simple;
})(Heuristics || (Heuristics = {}));
