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
