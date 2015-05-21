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
    this.startNode = { stacks: currentState.stacks,
                       arms: currentState.arms
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

function cartesian(lst) {
  function addTo(curr, args) {

    var i, copy,
        rest = args.slice(1),
        last = !rest.length,
        result = [];

    for (i = 0; i < args[0].length; i++) {

      copy = curr.slice();
      copy.push(args[0][i]);

      if (last) {
        result.push(copy);

      } else {
        result = result.concat(addTo(copy, rest));
      }
    }

    return result;
  }


  return addTo([], Array.prototype.slice.call(lst));
}

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

function permutations(arm, stack_length) {
    var combs = [];
    for (var i=0; i < arm.length; i++) {
        combs.push(['d', 'p', '-', arm[i]-1, arm[i], arm[i]+1] )
    }
    var candidates = cartesian(combs)
    var valid = [];
    for (var cand of candidates) {
        if ((!cand.contains(-1)) && (!cand.contains(stack_length)) && (!collision(cand))) {
            valid.push(cand);
        }
    }
    return valid;

}
console.log(permutations([0, 1]));
>>>>>>> 2fe96a82005757716de7adcb0228c27a3816e050

        return result;
    }
    return addTo([], Array.prototype.slice.call(lst));
}

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

<<<<<<< HEAD
SearchGraph.prototype.internal_neighbours =  function(state) {
    var combs = [];
=======
    // Left arm right, right arm left
    if(state.leftArm < state.rightArm-2) {
        yield {
            leftArm: state.leftArm+1, leftHolding: state.leftHolding,
            rightArm: state.rightArm-1, rightHolding: state.rightHolding,
            stacks: state.stacks
        };
    }
>>>>>>> 2fe96a82005757716de7adcb0228c27a3816e050

    // Things that depend only on the arm itself
    for (var arm of state.arms) {
        var actions = [];
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
        actions.push('-');
        combs.push(actions);
    }
    var candidates = cartesian(combs);


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

// var testState =  {
//   "stacks": [
//     [
//       "e"
//     ],
//     [
//       "g",
//       "l"
//     ],
//     [],
//     [
//       "k",
//       "m",
//       "f"
//     ],
//     []
//   ],
//   "arms": [{holding: null, pos: 0}, {holding: null, pos: 1}]
// };
// console.log(permutations(testState));

function clone(obj) {
    if(obj === null || typeof(obj) !== 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}


// Move left or right, or put up or down
SearchGraph.prototype.neighbours = function* (state) {
    var internal = this.internal_neighbours(state);

    for (var outer of internal) {
        var new_state = clone(state);
        for (var i=0; i < outer.length; i++) {
            switch (outer[i]) {
                case -1: new_state.arm[i].pos -= 1; break;
                case +1: new_state.arm[i].pos += 1; break;
                case 'p': new_state.arm[i].holding = new_state.stacks[new_state.arm[i].pos].pop(); break;
                case 'd':
                    new_state.stacks[new_state.arm[i].pos].push(new_state.arm[i].holding);
                    new_state.arm[i].holding = null;
                    break;
                default: break; // This captures the '-'
            }
        }
        yield new_state;
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
    return JSON.stringify(state);
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
