/*jslint node: true, esnext: true */
"use strict";
var stdlib = require('./../planner/stdlib.js');


function Parser(state) {
    this.state = state;
    this.all = stdlib.objects_in_world(state);
}


// If a constraint is satisfied for a given object
Parser.prototype.binds = function(constr, world_object) {
    var desc = this.state.objects[world_object];
    return (constr.form  === null || constr.form == "anyform" || constr.form  == desc.form) &&
           (constr.size  === null || constr.size  == desc.size) &&
           (constr.color === null || constr.color == desc.color);
};

// Returns a list of objects matching or "floor"
Parser.prototype.parse_object = function(obj) {
    console.log("P: obj");
    // Simple object
    if (obj.size !== undefined) {
        if (obj.size === null && obj.color === null && obj.form == "floor") {
            return "floor";
        }
        var desc = this.state.objects[obj];
        var tmp = this;
        return this.all.filter(function (x){
           return tmp.binds(obj, x) ;
        });
    }
    // Complex object
    var candidates = this.parse_object(obj.obj);
    if (candidates == "floor") {
        throw "Floor cannot be in some other object";
    }
    return this.location_filter(candidates, obj.loc);
};

// candidate object <on top/etc> of loc.obj. Returns the candidates for which this is true
Parser.prototype.location_filter = function(candidates, loc) {
    // var obs = this.parse_object(loc.obj);
    var obs = this.parse_entity(loc.ent);
    console.log("loc cand:" + candidates + " on " + obs);
    var this_state = this.state;
    return candidates.filter(function (item){
        return stdlib.test_satisfied(this_state, item, obs, loc.rel);
    });
};

//Returns a list of objects matching or "floor"
Parser.prototype.parse_entity = function(entity) {
    console.log("P: entity1" + entity.quant);
    var obs = this.parse_object(entity.obj);
    console.log("P: entity2: " + obs);
    if (obs == "floor") {
        if (entity.quant != "the") {
            throw "It must be quantified 'the floor'";
        }
        return "floor";
    }
    if (entity.quant == "the") {
        if (obs.length == 1) {
            return obs;
        } else {
            throw "Not exactly one object" + obs;
        }
    } else if (entity.quant == "any") {
        if (obs.length < 1) {
            throw "No objects matching";
        } else {
            return obs;
        }
    } else if (entity.quant == "all") {
        return obs;
    }
    throw "Invalid quantifier: " + entity.quant;
};


function filterArray(elem, arr) {
    var arr2 = [];
    for (var e of arr) {
        if (e != elem) {
            arr2.push(e);
        }
    }
    return arr2;
}


Parser.prototype.parse_one = function (move, loc) {
    var oneof = this.parse_entity(loc.ent);

    var rules = [];
    for (var m of move) {
        var oneof2 = filterArray(m, oneof);
        if (oneof == "floor") {
            if (loc.rel != "ontop") {
                throw "Objects must be put on top of the floor";
            }
            rules.push({rel: 'floor', item: m});
        } else  {
            var newrel = loc.rel == "inside" ? "ontop" : loc.rel;
            if (loc.ent.quant == "all") {
                for (var aa of oneof2) {
                    rules.push({rel: newrel, item: m, oneof: [aa]});
                }
            } else {
                rules.push({rel: newrel, item: m, oneof: oneof2});
            }
        }
    }
    return rules;
};

Parser.prototype.parse_cmd = function(o) {
    var move = this.parse_entity(o.ent);
    if (o.cmd == "take") {
        if (o.ent.quant == "all") {
            var ret = [];
            if (move.length > this.state.arms.length) {
                throw "Can't take more objects than current arms";
            }
            for (var m of move) {
                ret.push({rel: 'holding', item: m});
            }
            return [ret];
        } else {
            var ret = [];
            for (var m of move) {
                ret.push([{rel: 'holding', item: m}]);
            }
            return ret;
        }
    }

    console.log("move:" + move);
    if (move.length === 0) {
        throw "No objects matching";
    } else if (o.ent.quant == "any") {
        var ret = [];
        for (var m of move) {
            ret.push(this.parse_one(m, o.loc));
        }
        return ret;
    } else {
        return [this.parse_one(move, o.loc)];
    }
};

function all(state, parse) {
    console.log("PARSING" + JSON.stringify(parse, null, 2));
    var p = new Parser(state);
    var ret = p.parse_cmd(parse);
    console.log("GOT " + JSON.stringify(ret, null, 2));
    return ret;
}

module.exports = all;
