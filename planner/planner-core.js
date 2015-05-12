/*jslint node: true, esnext: true */
"use strict";


Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};


var SearchGraph = function (currentState, pddl) {
    this.objects = currentState.objects;
    this.startNode = {stacks: currentState.stacks,
                      holding: currentState.holding,
                      arm: currentState.arm
                 };
    this.pddl = pddl;
};


// Forms: Bricks, planks, balls, pyramids, boxes and tables.
// Colors: Red, black, blue, green, yellow, white.
// Sizes: Large, small.

// Move left or right, or put up or down
SearchGraph.prototype.neighbours = function* (state) {
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
            var objArm = this.objects[state.holding];
            var objTop = this.objects[state.stacks[state.arm].slice(-1)[0]];
            // var top = state.stacks[state.arm].slice(-1)[0];
            ok = !(objTop.form == "ball" ||
                  (objArm.form == "ball"  && objTop.form != "box") ||
                  (objArm.size == "large" && objTop.size == "small") ||
                  (objTop.form == "box" && ["pyramid", "plank", "box"].indexOf(objArm.form) !== -1 &&  objArm.size == objTop.size) ||
                  (objArm.form == "box" && objArm.size == "small" && objTop.size == "small" && ["brick", "pyramid"].indexOf(objTop.form) !== -1) ||
                  (objArm.form == "box" && objArm.size == "large" && objArm.form == "pyramid" && objArm.size == "large")
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
};


SearchGraph.prototype.cost = function(from, to) {
    return 1;
};

SearchGraph.prototype.h = function(state) {
    var estimate = 0;
    var held_any = false;
    for (var rule of this.pddl) {
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
};


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

SearchGraph.prototype.isgoal = function(state) {
    return this.pddl.every(function (rule) {return object_ok(rule, state);});

};


SearchGraph.prototype.state_hash = function(state) {
    return JSON.stringify(state.stacks) + state.arm + state.holding;
};


// d drop
// p pick up
// l left
// r right
function backlink(path) {
    var link = [];
    for (var i =0; i < path.length-1; i++) {
        var a = path[i];
        var b = path[i+1];
        if (a.arm == b.arm) {
            link.push(a.holding === null ? 'p' : 'd');
        } else {
            link.push(a.arm < b.arm ? 'r' : 'l');
        }
    }

    return link;
}

var astar = require("./astar.js");

module.exports = function(currentState, pddl) {
    var g = new SearchGraph(currentState, pddl);
    var res = astar(g, g.startNode);
    if (res === undefined) {
        return undefined;
    } else {
        return backlink(res);
    }
};
