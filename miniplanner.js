/*jslint node: true, esnext: true */
"use strict";


Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};


var currentState = {
  "stacks": [
    [
      "e"
    ],
    [
      "g",
      "l"
    ],
    [],
    [
      "k",
      "m",
      "f"
    ],
    []
  ],
  "holding": null,
  "arm": 0,
  "objects": {
    "a": {
      "form": "brick",
      "size": "large",
      "color": "green"
    },
    "b": {
      "form": "brick",
      "size": "small",
      "color": "white"
    },
    "c": {
      "form": "plank",
      "size": "large",
      "color": "red"
    },
    "d": {
      "form": "plank",
      "size": "small",
      "color": "green"
    },
    "e": {
      "form": "ball",
      "size": "large",
      "color": "white"
    },
    "f": {
      "form": "ball",
      "size": "small",
      "color": "black"
    },
    "g": {
      "form": "table",
      "size": "large",
      "color": "blue"
    },
    "h": {
      "form": "table",
      "size": "small",
      "color": "red"
    },
    "i": {
      "form": "pyramid",
      "size": "large",
      "color": "yellow"
    },
    "j": {
      "form": "pyramid",
      "size": "small",
      "color": "red"
    },
    "k": {
      "form": "box",
      "size": "large",
      "color": "yellow"
    },
    "l": {
      "form": "box",
      "size": "large",
      "color": "red"
    },
    "m": {
      "form": "box",
      "size": "small",
      "color": "blue"
    }
  },
  "examples": [
    "put the white ball in a box on the floor",
    "put the black ball in a box on the floor",
    "take a blue object",
    "take the white ball",
    "put all boxes on the floor",
    "move all balls inside a large box"
  ]
};



// Forms: Bricks, planks, balls, pyramids, boxes and tables.
// Colors: Red, black, blue, green, yellow, white.
// Sizes: Large, small.


// Move left or right, or put up or down
function *neighbors (state) {
    var objects = currentState.objects; //tmp
    // Move left
    if (state.arm !== 0) {
        yield {arm: state.arm-1, holding: state.holding, stacks: state.stacks};
    }
    // Move right
    if (state.arm !== state.stacks.length-1) {
        yield {arm: state.arm+1, holding: state.holding, stacks: state.stacks};
    }

    // Lower if possible
    if (state.holding !== null) {
        var ok = true;
        // Balls must be in boxes or on the floor, otherwise they roll away.
        // Balls cannot support anything.
        // Small objects cannot support large objects.
        // Boxes cannot contain pyramids, planks or boxes of the same size.
        // Small boxes cannot be supported by small bricks or pyramids.
        // Large boxes cannot be supported by large pyramids.
        if (state.stacks[state.arm].length > 0) {
            var objArm = objects[state.holding];
            var objTop = objects[state.stacks[state.arm].slice(-1)[0]];
            // var top = state.stacks[state.arm].slice(-1)[0];
            ok = !(objTop.form == "ball"
                ||    (objArm.form == "ball"  && objTop.form != "box")
                ||    (objArm.size == "large" && objTop.size == "small")
                ||    (objTop.form == "box" && ["pyramid", "plank", "box"].indexOf(objArm.form) !== -1 &&  objArm.size == objTop.size)
                ||    (objArm.form == "box" && objArm.size == "small" && objTop.size == "small" && ["brick", "pyramid"].indexOf(objTop.form) !== -1)
                ||    (objArm.form == "box" && objArm.size == "large" && objArm.form == "pyramid" && objArm.size == "large")
                );
        }
        if (ok) {
            var new_stacks = state.stacks.slice(0);
            new_stacks[state.arm] = new_stacks[state.arm].slice(0);
            new_stacks[state.arm].push(state.holding);

            yield {arm: state.arm, holding: null, stacks: new_stacks};
        }


    } else if (state.stacks[state.arm].length > 0) {
        // Pick up if possible
        var new_stacks = state.stacks.slice(0);
        new_stacks[state.arm] = new_stacks[state.arm].slice(0);
        yield {arm: state.arm, holding: new_stacks[state.arm].pop(), stacks: new_stacks};
    }
}

// TODO
function is_possible (rules) {
    // simple true false depending on the rules
}

    // e on top of k
var rules = [["e", "k"], ["l", "floor"]]; //TMP, TODO proper


function object_ok(rule, state) {
    var i, j;
    // Find position of object.
    for (i=0; i < state.stacks.length; i++) {
        j = state.stacks[i].indexOf(rule[0]);
        if (j !== -1) {
            break;
        }
    }
    // Either:
    //  * Arm holding it
    //  * object is on floor and should be
    //  * return if object is ontop of object it should be ontop of
    switch (j) {
        case -1: return false;
        case  0: return rule[1] == "floor";
        default: return state.stacks[i][j-1] == rule[1];
    }
}

function state_isgoal (state, this_should_be_rules) {
    return rules.every(function (rule) {return object_ok(rule, state);});
}


function cost(state) {
    return 1;
}

function closest_floor_dist(state) {
    var i = 0;
    var dist = Infinity;
    for (; i < state.length; i++) {
        if (state[i].length === 0) {
            dist = Math.min(dist, state.arm);
        }
    }
    return dist;
}

function h(state, this_should_be_rules) {
    var estimate = 0;
    var held_any = false;
    for (var rule of rules) {
        if (state.holding == rule[0]) {
            held_any = true;
            estimate += 1; // put down
        } else if (!object_ok(rule,state)) {
            estimate += 3; // pick up, move at least 1, put down
        }
    }
    // holding another object needs to be put away
    estimate += ((!held_any) & (!!state.holding));

    return estimate;
}

function hash_state(state) {
    return JSON.stringify(state.stacks) + state.arm + state.holding;
}

var astar = require("./A-star/astar.js");

var testgoal = {holding: null, arm: 3, stacks: [
    [
      "k", "e"
    ],
    [
      "g",
      "l"
    ],
    [],
    [
      "m",
      "f"
    ],
    []
  ]};

var startnode = {stacks: currentState.stacks, holding: currentState.holding, arm: currentState.arm};
console.log(astar(cost, h, neighbors, hash_state, startnode, undefined, state_isgoal).length);
//
