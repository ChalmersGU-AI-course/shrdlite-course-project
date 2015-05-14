/*jslint node: true, esnext: true */
"use strict";

Array.prototype.contains = function(e) {
    return this.indexOf(e) !== -1;
};

Array.prototype.last = function() {
    return this[this.length-1];
};

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

// If top can be placed on bottom
// Forms: Bricks, planks, balls, pyramids, boxes and tables.
// Colors: Red, black, blue, green, yellow, white.
// Sizes: Large, small.
SearchGraph.prototype.can_place = function(top, stack) {
    if (stack.length === 0) {
        return true;
    }
    var objArm = this.objects[top];
    var objTop = this.objects[stack.last()];
    // Balls must be in boxes or on the floor, otherwise they roll away.
    // Balls cannot support anything.
    // Small objects cannot support large objects.
    // Boxes cannot contain pyramids, planks or boxes of the same size.
    // Small boxes cannot be supported by small bricks or pyramids.
    // Large boxes cannot be supported by large pyramids.
    return !(objTop.form == "ball" ||
        (objArm.form == "ball"  && objTop.form != "box") ||
        (objArm.size == "large" && objTop.size == "small") ||
        (objTop.form == "box" && ["pyramid", "plank", "box"].contains(objArm.form) &&  objArm.size == objTop.size) ||
        (objArm.form == "box" && objArm.size == "small" && objTop.size == "small" && ["brick", "pyramid"].contains(objTop.form)) ||
        (objArm.form == "box" && objArm.size == "large" && objArm.form == "pyramid" && objArm.size == "large")
    );
};



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
        if (this.can_place(state.holding, state.stacks[state.arm])){
            var new_stacks = state.stacks.slice();
            new_stacks[state.arm] = new_stacks[state.arm].slice();
            new_stacks[state.arm].push(state.holding);
            yield {arm: state.arm, holding: null, stacks: new_stacks};
        }
    } else if (state.stacks[state.arm].length > 0) {
        // Pick up if possible
        var new_stacks = state.stacks.slice();
        new_stacks[state.arm] = new_stacks[state.arm].slice();
        yield {arm: state.arm, holding: new_stacks[state.arm].pop(), stacks: new_stacks};
    }
};


SearchGraph.prototype.cost = function(from, to) {
    return 1;
};



// If a constraint is satisfied for a given object
SearchGraph.prototype.binds = function(constr, obj) {
    if (typeof constr == 'string') {
        return constr == obj;
    }
    var desc = this.objects[obj];
    return (constr.form  === null || constr.form  == desc.form) &&
           (constr.size  === null || constr.size  == desc.size) &&
           (constr.color === null || constr.color == desc.color);
};

// If one PDDL rule is satisfied for a state
SearchGraph.prototype.rule_satisfied = function(rule, state) {
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of state.stacks) {
        j = stack.indexOf(rule.args[0]);
        if (j !== -1) {
            break;
        }
        i++;
    }

    switch (rule.rel) {
        case "holding":
            return state.holding == rule.args[0];

        case "floor":
            return j === 0;

        case "ontop":
            return j > 0 && this.binds(rule.args[1], stack[j-1]);

        case "beside":
            if (j === -1) {
                return false;
            }
            var check = [];
            if (i !== 0) {
                check.push.apply(check, state.stacks[i-1]);
            }
            if (i !== state.stacks.length) {
                check.push.apply(check, state.stacks[i+1]);
            }
            for (var obj of check) {
                if (this.binds(rule.args[1], obj)) {
                    return true;
                }
            }
            return false;

        case "left":
            if (j === -1) {
                return false;
            }
            for (i=i+1; i < state.stacks.length; i++) {
                if (this.binds(rule.args[1], obj)) {
                    return true;
                }
            }
            return false;

        case "right":
            if (j === -1) {
                return false;
            }
            for (i=i-1; i >= 0; i--) {
                if (this.binds(rule.args[1], obj)) {
                    return true;
                }
            }
            return false;

        default:
            throw "ERRORRRR";
    }

};


// Check if all PDDL goals are satisfied.
SearchGraph.prototype.isgoal = function(state) {
    for (var rule of this.pddl) {
        if (!this.rule_satisfied(rule, state)) {
            return false;
        }
    }
    return true;
};



SearchGraph.prototype.closest_legal_putdown = function(obj, state) {
    var dist = state.stacks.length;
    var i = 0;
    for (var stack of state.stacks) {
        if (this.can_place(obj, state.stacks[i])) {
            dist = Math.min(dist, Math.abs(i-state.arm));
        }
        i++;
    }
    return dist;
};

SearchGraph.prototype.h = function () {
    return 0;
};

// SearchGraph.prototype.h = function(state) {
//     var estimate = 0;
//     return 0;
//     for (var rule of this.pddl) {
//         if (object_ok(rule, state)) {
//             continue;
//         }
//         var obj = rule[0];
//         var constraints = rule[1];

//         // Find and pick up
//         if (state.holding != obj) {
//             var i=0, j;
//             // Find position of object.
//             for (var stack of state.stacks) {
//                 j = stack.indexOf(obj);
//                 if (j !== -1) {
//                     break;
//                 }
//                 i++;
//             }
//             estimate += Math.abs(i-state.arm) + 1;
//             estimate += (stack.length-1-j)*4;
//             estimate += putdown_dist(i, )

//         }

//         // Put down somewhere


//     }
//     return estimate;
// };



SearchGraph.prototype.state_hash = function(state) {
    return JSON.stringify(state.stacks) + state.arm + state.holding;
};

SearchGraph.prototype.isPossible = function() {
    // for (var rule of this.pddl) {
    //     // TODO: check that each object exists.?
    //     if (!this.valid_substack(rule[0], rule[1])) {
    //         return false;
    //     }
    // }
    return true;
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
    if (!g.isPossible()) {
        return "impossible";
    }
    var res = astar(g, g.startNode);
    if (res === undefined) {
        return undefined;
    } else {
        return backlink(res);
    }
};
