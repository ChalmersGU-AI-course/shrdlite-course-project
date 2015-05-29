/*jslint node: true, esnext: true */
"use strict";

var stdlib = require('./stdlib');

/// A-star required prototype function  ///////////////////////////////////////////////////////////

var SearchGraph = function (currentState, pddl) {
    this.objects = currentState.objects;
    this.startNode = { stacks: currentState.stacks,
                       arms: currentState.arms
                     };
    this.pddl = pddl;
    if (currentState.arms.length === 1) {
        this.h = this.h_1arm;
    } else {
        this.h = this.h_general;
    }
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


function collision(arr) {
    var look = {};
    for (var e of arr) {
        if (typeof e == 'string') {
            continue;
        }
        if (e in look) {
            return true;
        }
        look[e] = true;
    }
    return false;
}

SearchGraph.prototype.internal_neighbours =  function(state) {
    var combs = [];

    // Things that depend only on the arm itself
    for (var arm of state.arms) {
        var actions = ['-'];
        if (arm.holding === null) {
            if (state.stacks[arm.pos].length > 0) {
              actions.push('p');
            }
        } else {
            if (this.can_place(arm.holding, state.stacks[arm.pos])) {
                actions.push('d');
            }
        }
        if (arm.pos !== 0) {
            actions.push(-1);
        }
        if (arm.pos !== state.stacks.length-1) {
            actions.push(1);
        }
        combs.push(actions);
    }
    var candidates = stdlib.cartesian(combs);


    // Invalidating dependent actions
    var valid = [];
    outer: for (var cand of candidates) {
        // Candidate arm posisiton
        var next_armpos = new Array(cand.length);
        for (var i = 0; i < cand.length; i++) {
            if (typeof(cand[i]) == 'number') {
                next_armpos[i] = cand[i] + state.arms[i].pos;
            } else {
                next_armpos[i] = state.arms[i].pos;
            }
        }

        // No doing nothing
        if (cand.every(function(x) { return x == '-';})) {
            continue;
        }

        // Never arms on the same spot
        if (collision(next_armpos)) {
            continue;
        }

        // No crossing other arms
        // permutations :)
        for (var i=0; i<next_armpos.length; i++) {
            for (var j=0; j<next_armpos.length; j++) {
                if (next_armpos[i] > next_armpos[j] && state.arms[i].pos < state.arms[j].pos) {
                    continue outer;
                }
            }
        }

        valid.push(cand);
    }
    return valid;
};



// Move left or right, or put up or down
SearchGraph.prototype.neighbours = function* (state) {
    var internal = this.internal_neighbours(state);

    for (var outer of internal) {
        var new_state = stdlib.clone(state);
        //injecting backlink
        new_state.backlink = [];
        for (var i=0; i < outer.length; i++) {
            switch (outer[i]) {
                case -1: new_state.arms[i].pos -= 1;
                    new_state.backlink[i] = 'l';
                    break;
                case +1: new_state.arms[i].pos += 1;
                    new_state.backlink[i] = 'r';
                    break;
                case 'p':
                    new_state.arms[i].holding = new_state.stacks[new_state.arms[i].pos].pop();
                    new_state.backlink[i] = 'p';
                    break;
                case 'd':
                    new_state.stacks[new_state.arms[i].pos].push(new_state.arms[i].holding);
                    new_state.arms[i].holding = null;
                    new_state.backlink[i] = 'd';
                    break;
                default:
                    new_state.backlink[i] = '-';
                    break; // This captures the '-'
            }
        }
        yield {state: new_state, cost: 1};
    }
};


// Check if all PDDL goals are satisfied.
SearchGraph.prototype.isgoal = function(state) {
    return this.pddl.every(function (rule) {
       return stdlib.test_satisfied(state, rule.item, rule.oneof, rule.rel);
    });
};


SearchGraph.prototype.h_general = function (state) {
    var estimate = 0;

    for(var rule of this.pddl) {
        if (stdlib.test_satisfied(state, rule.item, rule.oneof, rule.rel)) {
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

        switch(rule.rel) {
            case "holding":
                // Calculate the average distance from each arm
                estimate += state.arms.reduce(function(acc, arm) {
                    return acc + Math.abs(arm.pos - i) + 4 * (stack.length-j);
                }, 0) / state.arms.length;
                break;

            case "floor":
                var arm;
                state.arms.every(function(a) {
                    if(a.holding == rule.item) {
                        arm = a;
                        return false;
                    }
                    return true;
                });

                if(arm) {
                    // Find closest floor and put down
                    estimate += closest_floor(arm.pos, state) + 1;
                } else {
                    // Move to object, take, move to closest floor, put down
                    var minArmPos = state.arms.reduce(function(acc, arm) {
                        var a = Math.abs(arm.pos - i);
                        if(a < acc) return a;
                        else return acc;
                    }, Infinity);
                    estimate += minArmPos + 2 +  closest_floor(i, state);
                }
                break;

            case "ontop":
                var least = Infinity;
                for (var obj of rule.oneof) {
                    var xs = state.arms.map(function(arm) {
                        return putOnTopOf(arm.pos, obj, state);
                    });
                    xs.push(least);
                    least = Math.min.apply(null, xs);
                }

                var arm;
                state.arms.every(function(a) {
                    if(a.holding == rule.item) {
                        arm = a;
                        return false;
                    }
                    return true;
                });

                if(!arm) {
                    var minArmPos = state.arms.reduce(function(acc, arm) {
                        var a = Math.abs(arm.pos - i);
                        if(a < acc) return a;
                        else return acc;
                    }, Infinity);

                    estimate += minArmPos + 1; // Go pick it up.
                }
                estimate += least;
                break;

                /*
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
            */
        }
    }
    return estimate;
};


/// Specialized H for 1 arm ///////////////////////////////////////////////////////////////////////

// Cost to put an element on top of obj
function putOnTopOf(armpos, obj, state) {
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
    return Math.abs(armpos - i) + 1 + 4*(stack.length-j);
}


SearchGraph.prototype.closest_legal_putdown = function(obj, state) {
    var arm = state.arms[0].pos;
    var dist = state.stacks.length;
    var i = 0;
    for (var stack of state.stacks) {
        if (this.can_place(obj, state.stacks[i])) {
            dist = Math.min(dist, Math.abs(i-arm));
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


SearchGraph.prototype.h_1arm = function (state) {
    // return 0;
    var arm = state.arms[0].pos;
    var holding = state.arms[0].holding;

    var estimate = 0;
    for (var rule of this.pddl) {
        if (stdlib.test_satisfied(state, rule.item, rule.oneof, rule.rel)) {
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
                estimate += Math.abs(arm - i) + 1 + 4*(stack.length-j);
                break;

            case "floor":
                // 10 theoretically smallest to rearange stack instead of finding closest free floor
                if (holding == rule.item) {
                    // Find closest floor and put down
                    estimate += closest_floor(arm, state) + 1;
                } else {
                    // Move to object, take, move to closest floor, put down
                    estimate += Math.abs(arm - i) + 2 +  closest_floor(i, state);
                }
                break;

            case "ontop":
                var least = 100000;
                for (var obj of rule.oneof) {
                    least = Math.min(least, putOnTopOf(arm, obj, state));
                }
                if (holding != rule.item) {
                    estimate += Math.abs(arm - i) + 1; // Go pick it up.
                }
                estimate += least;
                break;

            case "above":
            case "below":
            default:
                estimate += 1;
        }

    }
    return estimate;
};


SearchGraph.prototype.state_hash = function(state) {
    return JSON.stringify([state.stacks, state.arms]);
};

//This one is still buggy
// SearchGraph.prototype.isPossible = function(state) {
//     var elems = stdlib.objects_in_world(state);
//     //Check that each element exists, and that the rule is possible.
//     for (var rule of this.pddl) {
//         if (!elems.contains(rule.item)) {
//             return false;
//         }
//         if (rule.rel == "holding" || rule.rel == "floor") {
//             continue;
//         }
//         var newOneof = [];
//         for (var sub of rule.oneof) {
//             if (!elems.contains(sub)) {
//                 return false;
//             }
//             if (rule.rel == "ontop" && this.can_place(rule.item, [sub])){
//                 newOneof.push(sub);
//             }
//         }
//         if (newOneof.length === 0) {
//             return false;
//         }
//         rule.oneof = newOneof;
//     }
//     return true;
// };


// d drop
// p pick up
// l left
// r right
function backlink(path) {
    var link = [];
    for (var i = 1; i < path.length; i++) {
        link.push(path[i].backlink);
    }

    return link;
}

var astar = require("./astar.js");

module.exports = function(currentState, pddl) {
    var g = new SearchGraph(currentState, pddl);
    // if (!g.isPossible(g.startNode)) {
    //     console.log("impossible:" + pddl);
    //     return undefined;
    // }
    console.time("A*");
    var res = astar(g, g.startNode);
    console.timeEnd("A*");
    if (res === undefined) {
        return undefined;
    } else {
        return backlink(res);
    }
};
