/*jslint node: true, esnext: true */
"use strict";

/// Reinventing a decent standard library /////////////////////////////////////////////////////////
Array.prototype.contains = function(e) {
    return this.indexOf(e) !== -1;
};

Array.prototype.intersects = function(other) {
    if (other === undefined) {
        debugger;
        throw "Other can't be undefined";
    }
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


module.exports.cartesian = function(lst) {
    function addTo(curr, args) {
        var i, copy;
        var rest = args.slice(1);
        var last = !rest.length;
        var result = [];

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
};


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

module.exports.clone = clone;



/// Shared for the problem ////////////////////////////////////////////////////////////////////////

module.exports.objects_in_world = function(state) {
    var list = state.stacks.flatten();
    for (var arm of state.arms) {
        if (arm.holding !== null) {
            list.push(arm.holding);
        }
    }
    return list;
};



module.exports.test_satisfied = function(state, item, oneof, relation) {
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of state.stacks) {
        j = stack.indexOf(item);
        if (j !== -1) {
            break;
        }
        i++;
    }

    switch (relation) {
        case "holding":
            var res = state.arms.some(function(arm) {
                return arm.holding === item;
            });
            return res;

        case "floor":
            return j === 0;

        case "inside":
        case "ontop":
            return j > 0 && oneof.contains(stack[j-1]);

        case "above":
            return j !== 1 && oneof.intersects(stack.slice(0, j));

        case "under":
            return j !== 1 && oneof.intersects(stack.slice(j+1));

        case "beside":
            if (j === -1) {
                return false;
            }
            return  (i !== 0 && oneof.intersects(state.stacks[i-1])) ||
                    (i !== state.stacks.length-1 && oneof.intersects(state.stacks[i+1]));

        case "leftof":
            return (j !== -1) && state.stacks.slice(i+1).flatten().intersects(oneof);

        case "rightof":
            return (j !== -1) && state.stacks.slice(0, i).flatten().intersects(oneof);

        default:
            throw "ERRORRRR: Planner does not know the relation: " + relation;
    }

};
