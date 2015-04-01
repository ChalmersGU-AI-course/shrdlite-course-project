"use strict";

// loljavascript
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}


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
    ," X                     X                          "
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
    // return 0;
    return Math.abs(v1[0]-v2[0]) + Math.abs(v1[1] - v2[1])
    // return Math.sqrt(  pow(v1[0]-v2[0], 2) + pow(v1[1]-v2[1], 2) )
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


function bfs(G, start, end) {
    var visited = {};
    var Q = [];
    Q.push(start);
    while (Q.length > 0) {
        var v = Q.shift()
        if (v in visited) {
            continue;
        }
        visited[v] = true;
        if (v == end) {
            return true
        } else {
            for (var neigh of G[v]) {
                Q.push(neigh);
            }
            // console.log(G[v]);
            // G[v].forEach(Q.push);
        }
    }
    return false
}


function astar(start, goal) {
    var front = {};
    var evaluated = {};
    var previous = {}
    var d = {}; // Actual distance
    d[start] = 0; 
    front[start] = {node: start, approx: h(start, goal)};

    while (Object.keys(front).length > 0) {
        // Get min distance element
        var approx = Infinity;
        var node = null;
        for (var k in front) {
            if (front[k].approx < approx) {
                approx = front[k].approx;
                node = front[k].node;
            }
        }
        delete front[node];
        evaluated[node] = true;


        // Finished, start backtracking
        if (arraysEqual(node, goal)) {
            var ret = [];
            var bs = previous[goal];
            while (!arraysEqual(bs, start)) {
                ret.unshift(bs)
                bs = previous[bs];
            }
            console.log('Nodes evaluated: ' + Object.keys(evaluated).length);
            return ret;
        }


        for (var neigh of neighbours(node)) {
            if (neigh in evaluated) {
                continue;
            }
            if (!(neigh in d) || d[node] + cost(node, neigh) < d[neigh]) {
                d[neigh] = d[node] + cost(node, neigh);
                front[neigh] = {node: neigh, approx: d[neigh] + h(neigh, goal)};
                previous[neigh] = node;
            }
        }
    }
    return undefined;
}


var path = astar(search_2d(map, 'S'), search_2d(map, 'G'));
console.log('Length: ' + path.length);
path_map(map, path);
print_map(map);