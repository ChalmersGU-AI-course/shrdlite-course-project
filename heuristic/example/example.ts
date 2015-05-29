/// <reference path="../Heuristic.ts" />


function state1():WorldState{
    return {
        "stacks": [["e"],["a","l"],[],[],["i","h","j"],[],[],["k","g","c","b"],[],["d","m","f"]],
        "holding": null,
        "arm": 0,
        "objects": {},
        "examples": []
    };
}

function state2():WorldState{
    return {
        "stacks": [["e"],["a","l"],[],[],["i","h","j"],[],[],["k","g","c","b"],[],["d","m","f"]],
        "holding": null,
        "arm": 0,
        "objects": {},
        "examples": []
    };
}
        
function runExample(element: HTMLElement) {
    element.innerHTML += "Example to check heuristic for worlds";
    element.innerHTML += "<br><br>";
    
    var h = heuristics.worldHeuristics(state1(), state2());
    
    element.innerHTML += "The Value is: ";
    element.innerHTML += h;
    
    element.innerHTML += "<br>";
}

window.onload = () => {
    var el = document.getElementById('content');
    runExample(el);
};
