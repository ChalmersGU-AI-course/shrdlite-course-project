"use strict";

var astar = require("./astar.js");

function setCharAt(str,index,chr) {
    if(index > str.length-1)
        return str;
    return str.substr(0, index) + chr + str.substr(index+1);
}


// 25x50
// S = start, G = goal, X = cannot pass
var map = [
     "                            X                     "
    ,"  S    XX                   X                     "
    ," XXXXXXX                    X                     "
    ," X                     X    X                     "
    ," X                     X    X                     "
    ," X                     XXXXXX                     "
    ," X                     X                          "
    ," X                     X                          "
    ," X                     X       X                  "
    ," X                     XXXXXX                     "
    ," X    XXXXX                 X                     "
    ," X                          X                     "
    ," X                          X                     "
    ," X                          X                     "
    ," X                          X        G            "
    ," X                          X                     "
    ," X                          X                     "
    ," X                                                "
    ," X                                                "
    ," X                                                "
    ," X                                                "
    ," X                                                "
    ," X                                                "
    ," X                                                "
    ," X                                                "
    ];

function print_map(arr) {
    var delim = Array(arr[0].length+3).join("-")
    console.log(delim);
    for (var line of arr) {
        console.log('|' + line + '|');
    }
    console.log(delim);
}


function path_map(arr, path) {
    for (var v of path) {
        var x = v[0];
        var y = v[1];
        arr[y] = setCharAt(arr[y], x, '.');

    }
    return arr;
}

// Returns coordinates of first occurance of character
function search_2d(arr, chr) {
    for (var i=0; i < arr.length; i++) {
        var j = arr[i].indexOf(chr);
        if (j !== -1) {
            return [j, i];
        }
    }
    return undefined;
}

// Heuristic function, manhattan
function h(v1, v2) {
    return Math.abs(v1[0]-v2[0]) + Math.abs(v1[1] - v2[1])
}

function neighbours(v) {
    var x = v[0];
    var y = v[1];
    var ret = [];
    var possibilities = [[x-1, y], [x+1, y], [x, y-1], [x, y+1] ]

    // Avoid X or out of bound
    for (var p of possibilities) {
        if (map[p[1]] === undefined)
            continue;
        if (map[p[1]][p[0]] === undefined)
            continue;
        if (map[p[1]][p[0]] == 'X')
            continue;
        ret.push(p)
    }
    return ret;
}

// 1 cost to go to any OK neighbour, undefined for non neighbouring nodes
function cost(a, b) {
    return 1;
}


var path = astar(cost, h, neighbours, search_2d(map, 'S'), search_2d(map, 'G'));
console.log('Length: ' + path.length);
path_map(map, path);
print_map(map);


