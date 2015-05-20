/*jslint node: true, esnext: true */
"use strict";

/// Reinventing a decent standard library /////////////////////////////////////////////////////////

Array.prototype.contains = function(e) {
    return this.indexOf(e) !== -1;
};

Array.prototype.intersects = function(other) {
    for (var elem of this) {
        if (other.indexOf(elem) !== -1) {
            return true;
        }
    }
    return false;
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

Array.prototype.flatten = function() {
    var ret = [];
    for (var sub of this) {
        for (var nest of sub) {
            ret.push(nest);
        }
    }
    return ret;
};

/// A-star required prototype function  ///////////////////////////////////////////////////////////

var SearchGraph = function (currentState, pddl) {
    this.objects = currentState.objects;
    this.startNode = {stacks: currentState.stacks,
                      leftHolding: currentState.leftHolding,
                      rightHolding: currentState.rightHolding,
                      leftArm: currentState.leftArm,
                      rightArm: currentState.rightArm
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
    // Move left arm left
    if (state.leftArm !== 0) {
        // Move right arm left
        yield {
            leftArm: state.leftArm-1, leftHolding: state.leftHolding,
            rightArm: state.rightArm-1, rightHolding: state.rightHolding,
            stacks: state.stacks
        };
        // Move right arm right
        if(state.rightArm !== state.stacks.length-1) {
            yield {
                leftArm: state.leftArm-1, leftHolding: state.leftHolding,
                rightArm: state.rightArm+1, rightHolding: state.rightHolding,
                stacks: state.stacks
            };
        }
        // Lower right arm
        if(state.rightHolding !== null &&
           this.can_place(state.rightHolding, state.stacks[state.rightArm])) {
            var new_stacks = state.stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            new_stacks[state.rightArm].push(state.rightHolding);
            yield {
                leftArm: state.leftArm-1, leftHolding: state.leftHolding,
                rightArm: state.rightArm, rightHolding: null,
                stacks: new_stacks
            };
        }
        // Pick up with right arm
        else if (state.stacks[state.rightArm].length > 0) {
            var new_stacks = state.stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            yield {
                leftArm: state.leftArm-1, leftHolding: state.leftHolding,
                rightArm: state.rightArm, rightHolding: new_stacks[state.rightArm].pop(),
                stacks: new_stacks
            };
        }
    }

    // Move left arm right
    if (state.leftArm !== state.stacks.length-1) {
        // Move right arm left
        if(state.rightArm > state.leftArm+2) {
            yield {
                leftArm: state.leftArm+1, leftHolding: state.leftHolding,
                rightArm: state.rightArm-1, rightHolding: state.rightHolding,
                stacks: state.stacks
            };
        }
        // Move right arm right
        if(state.rightArm !== state.stacks.length-1) {
            yield {
                leftArm: state.leftArm+1, leftHolding: state.leftHolding,
                rightArm: state.rightArm+1, rightHolding: state.rightHolding,
                stacks: state.stacks
            };
        }
        // Lower right arm
        if(state.rightHolding !== null &&
           this.can_place(state.rightHolding, state.stacks[state.rightArm])) {
            var new_stacks = state.stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            new_stacks[state.rightArm].push(state.rightHolding);
            yield {
                leftArm: state.leftArm+1, leftHolding: state.leftHolding,
                rightArm: state.rightArm, rightHolding: null,
                stacks: new_stacks
            };
        }
        // Pick up with right arm
        else if (state.stacks[state.rightArm].length > 0) {
            var new_stacks = state.stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            yield {
                leftArm: state.leftArm+1, leftHolding: state.leftHolding,
                rightArm: state.rightArm, rightHolding: new_stacks[state.rightArm].pop(),
                stacks: new_stacks
            };
        }
    }

    // Lower left arm
    if (state.leftHolding !== null &&
        this.can_place(state.leftHolding, state.stacks[state.leftArm])) {
        var new_stacks = state.stacks.slice();
        new_stacks[state.leftArm] = new_stacks[state.leftArm].slice();
        new_stacks[state.leftArm].push(state.leftHolding);

        // Move right arm left
        if(state.rightArm > state.leftArm+2) {
            yield {
                leftArm: state.leftArm, leftHolding: null,
                rightArm: state.rightArm-1, rightHolding: state.rightHolding,
                stacks: new_stacks
            };
        }
        // Move right arm right
        if(state.rightArm !== state.stacks.length-1) {
            yield {
                leftArm: state.leftArm, leftHolding: null,
                rightArm: state.rightArm+1, rightHolding: state.rightHolding,
                stacks: new_stacks
            };
        }
        // Lower right arm
        if(state.rightHolding !== null &&
           this.can_place(state.rightHolding, new_stacks[state.rightArm])) {
            var new_stacks = new_stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            new_stacks[state.rightArm].push(state.rightHolding);
            yield {
                leftArm: state.leftArm, leftHolding: null,
                rightArm: state.rightArm, rightHolding: null,
                stacks: new_stacks
            };
        }
        // Pick up with right arm
        else if (state.stacks[state.rightArm].length > 0) {
            var new_stacks = new_stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            yield {
                leftArm: state.leftArm, leftHolding: null,
                rightArm: state.rightArm, rightHolding: new_stacks[state.rightArm].pop(),
                stacks: new_stacks
            };
        }
    }
    // Pick up with left arm
    else if (state.stacks[state.leftArm].length > 0) {
        var new_stacks = state.stacks.slice();
        new_stacks[state.leftArm] = new_stacks[state.leftArm].slice();

        // Move right arm left
        if(state.rightArm > state.leftArm+2) {
            yield {
                leftArm: state.leftArm, leftHolding: new_stacks[state.leftArm].pop(),
                rightArm: state.rightArm-1, rightHolding: state.rightHolding,
                stacks: new_stacks
            };
        }
        // Move right arm right
        if(state.rightArm !== state.stacks.length-1) {
            yield {
                leftArm: state.leftArm, leftHolding: new_stacks[state.leftArm].pop(),
                rightArm: state.rightArm+1, rightHolding: state.rightHolding,
                stacks: new_stacks
            };
        }
        // Lower right arm
        if(state.rightHolding !== null &&
           this.can_place(state.rightHolding, new_stacks[state.rightArm])) {
            var new_stacks = new_stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            new_stacks[state.rightArm].push(state.rightHolding);
            yield {
                leftArm: state.leftArm, leftHolding: new_stacks[state.leftArm].pop(),
                rightArm: state.rightArm, rightHolding: null,
                stacks: new_stacks
            };
        }
        // Pick up with right arm
        else if (state.stacks[state.rightArm].length > 0) {
            var new_stacks = new_stacks.slice();
            new_stacks[state.rightArm] = new_stacks[state.rightArm].slice();
            yield {
                leftArm: state.leftArm, leftHolding: new_stacks[state.leftArm].pop(),
                rightArm: state.rightArm, rightHolding: new_stacks[state.rightArm].pop(),
                stacks: new_stacks
            };
        }
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
        j = stack.indexOf(rule.item);
        if (j !== -1) {
            break;
        }
        i++;
    }

    switch (rule.rel) {
        case "holding":
            return state.leftHolding == rule.item || state.rightHolding == rule.item;

        case "floor":
            return j === 0;

        case "ontop":
            return j > 0 && rule.oneof.contains(stack[j-1]);

        case "beside":
            if (j === -1) {
                return false;
            }
            return  (i !== 0 && rule.oneof.intersects(state.stacks[i-1])) ||
                    (i !== state.stacks.length && rule.oneof.intersects(state.stacks[i+1]));

        case "left":
            return (j !== -1) && state.stacks.slice(i+1).flatten().intersects(rule.oneof);

        case "right":
            return (j !== -1) && state.stacks.slice(i-1).flatten().intersects(rule.oneof);

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

function* indices (start, min, max) {
    yield start;
    var i = 0;
    do {
        i++;
        if (start+i < max) {
            yield start+i;
        }
        if (start-i >= min) {
            yield start-i;
        }
    } while (start+i < max || start-i >= min);
}

// The distance to the nearest floor from the current arm position.
function closest_floor(armpos, state) {
    var candidate = 10000;
    for (var i of indices(armpos, 0, state.stacks.length)) {
        if (state.stacks[i].length === 0) {
            candidate = Math.min(candidate, Math.abs(armpos - i));
        } else {
            candidate = Math.min(candidate, Math.abs(armpos - i)*2 + 4*state.stacks[i].length);
        }
    }
    // 6 instead moving away objects from the closest stack
    // return Math.min(candidate, 6);
    return candidate;
}

// Cost to put an element on top of obj
function putOnTopOf(obj, state) {
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of state.stacks) {
        j = stack.indexOf(obj);
        if (j !== -1) {
            break;
        }
        i++;
    }
    if (j === -1) {
        return 1; // Arm is holding it, can just put it down (maybe :)
    }
    // Move the arm to the stack, put it down. (Plus remove all above objects if needed)
    return Math.abs(state.arm - i) + 1 + 4*(stack.length-j);
}

SearchGraph.prototype.h = function (state) {
    return 0;
};
/*
SearchGraph.prototype.h = function (state) {
    // return 0;
    var estimate = 0;
    for (var rule of this.pddl) {
        if (this.rule_satisfied(rule, state)) {
            continue;
        }
        // Find the object
        var i = 0;
        var j = -1;
        for (var stack of state.stacks) {
            j = stack.indexOf(rule.item);
            if (j !== -1) {
                break;
            }
            i++;
        }
        switch (rule.rel) {
            case "holding":
                // Move the arm to object, and pick up. Plus remove elements above (4 each naive estimate)
                estimate += Math.abs(state.arm - i) + 1 + 4*(stack.length-j);
                break;

            case "floor":
                // 10 theoretically smallest to rearange stack instead of finding closest free floor
                if (state.holding == rule.item) {
                    // Find closest floor and put down
                    estimate += closest_floor(state.arm, state) + 1;
                } else {
                    // Move to object, take, move to closest floor, put down
                    estimate += Math.abs(state.arm - i) + 2 +  closest_floor(i, state);
                }
                break;

            case "ontop":
                var least = 100000;
                for (var obj of rule.oneof) {
                    least = Math.min(least, putOnTopOf(obj,state));
                }
                if (state.holding != rule.item) {
                    estimate += Math.abs(state.arm - i) + 1; // Go pick it up.
                }
                estimate += least;
                break;

            // TODO
            case "beside":
                estimate += 1;
                break;
            //     if (j === -1) {
            //         return false;
            //     }
            //     return  (i !== 0 && rule.oneof.intersects(state.stacks[i-1])) ||
            //             (i !== state.stacks.length && rule.oneof.intersects(state.stacks[i+1]));

            case "left":
                estimate += 1;
                break;
            //     return (j !== -1) && state.stacks.slice(i+1).flatten().intersects(rule.oneof);

            case "right":
                estimate += 1;
                break;
            //     return (j !== -1) && state.stacks.slice(i-1).flatten().intersects(rule.oneof);

            default:
                throw "ERRORRRR";
        }

    }
    return estimate;
};
*/

SearchGraph.prototype.state_hash = function(state) {
    return JSON.stringify(state.stacks) + state.leftArm * 10 + state.rightArm * 100+
        state.leftHolding * 1000 + state.rightHolding * 10000;
};

//TODO
SearchGraph.prototype.isPossible = function(state) {
    var elems = state.stacks.flatten();
    if (state.holding !== null) {
        elems.push(state.holding);
    }

    //Check that each element exists, and that the rule is possible.
    for (var rule of this.pddl) {
        if (!elems.contains(rule.item)) {
            return false;
        }
        if (rule.rel == "holding" || rule.rel == "floor") {
            continue;
        }
        for (var sub of rule.oneof) {
            if (!elems.contains(sub)) {
                return false;
            }
            if (rule.rel == "ontop" && !this.can_place(rule.item, [sub])){
                return false;
            }
        }
    }
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
        link[i] = [];
        // Left arm
        if (a.leftArm == b.leftArm) {
            link[i].push(a.leftHolding === null ? 'p' : 'd');
        } else {
            link[i].push(a.leftArm < b.leftArm ? 'r' : 'l');
        }
        // Right arm
        if(a.rightArm == b.rightArm) {
            link[i].push(a.rightHolding === null ? 'p' : 'd');
        } else {
            link[i].push(a.rightArm < b.rightArm ? 'r' : 'l');
        }

    }

    return link;
}

var astar = require("./astar.js");

module.exports = function(currentState, pddl) {
    var g = new SearchGraph(currentState, pddl);
    if (!g.isPossible(g.startNode)) {
        return undefined;
    }
    var res = astar(g, g.startNode);
    if (res === undefined) {
        return undefined;
    } else {
        return backlink(res);
    }
};
