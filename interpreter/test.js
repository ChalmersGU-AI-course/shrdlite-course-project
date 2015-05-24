/*jslint node: true, esnext: true */
"use strict";
require('./../planner/planner-core.js');
// var  TMP = require('./../planner/test.js');

var example1 =
{cmd: "move",
  ent: {quant: "the",
        obj: {obj: {size: null, color: "white", form: "ball"},
              loc: {rel: "inside",
                    ent: {quant: "any",
                          obj: {size: null, color: null, form: "box"}}}}},
  loc: {rel: "ontop",
        ent: {quant: "the",
              obj: {size: null, color: null, form: "floor"}}}};



var example2 =
{cmd: "move",
  ent: {quant: "the",
        obj: {size: null, color: "white", form: "ball"}},
  loc: {rel: "inside",
        ent: {quant: "any",
              obj: {obj: {size: null, color: null, form: "box"},
                    loc: {rel: "ontop",
                          ent: {quant: "the",
                                obj: {size: null, color: null, form: "floor"}}}}}}};


function objects_in_world(state) {
    var list = state.stacks.flatten();
    for (var arm of state.arms) {
        if (arm.holding !== null) {
            list.push(arm.holding);
        }
    }
    return list;
}

// If a constraint is satisfied for a given object
Parser.prototype.binds = function(constr, world_object) {
    var desc = this.state.objects[world_object];
    return (constr.form  === null || constr.form == "anyform" || constr.form  == desc.form) &&
           (constr.size  === null || constr.size  == desc.size) &&
           (constr.color === null || constr.color == desc.color);
};


var TMP_currentState = {
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
  "arms": [{holding: null, pos: 0}, {holding: null, pos: 4}],

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

function Parser(state, interpretation) {
    this.state = state;
    this.all = objects_in_world(state);
    this.interpretation = interpretation;
}

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


// True if item is on top of one of oneof
Parser.prototype.test_ontop = function(item, oneof) {
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of this.state.stacks) {
        j = stack.indexOf(item);
        if (j !== -1) {
            break;
        }
        i++;
    }
    if (j === -1) {
        return false;
    }
    if (j === 0) {
        return oneof == "floor";
    }

    return oneof.contains(stack[j-1]);
};

// True if item is beside one of oneof
Parser.prototype.test_beside = function(item, oneof) {
    if (oneof == "floor") {
        throw "Cannot be beside the floor";
    }
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of this.state.stacks) {
        j = stack.indexOf(item);
        if (j !== -1) {
            break;
        }
        i++;
    }
    if (j === -1) {
        return false;
    }

    return  (i !== 0 && oneof.intersects(this.state.stacks[i-1])) ||
        (i !== this.state.stacks.length && oneof.intersects(this.state.stacks[i+1]));

};

Parser.prototype.test_left = function(item, oneof) {
    if (oneof == "floor") {
        throw "Cannot be left of the floor";
    }
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of this.state.stacks) {
        j = stack.indexOf(item);
        if (j !== -1) {
            break;
        }
        i++;
    }
    if (j === -1) {
        return false;
    }
    return (j !== -1) && this.state.stacks.slice(i+1).flatten().intersects(oneof);
};

Parser.prototype.test_right = function(item, oneof) {
    if (oneof == "floor") {
        throw "Cannot be right of the floor";
    }
    // Find the object
    var i = 0;
    var j = -1;
    for (var stack of this.state.stacks) {
        j = stack.indexOf(item);
        if (j !== -1) {
            break;
        }
        i++;
    }
    if (j === -1) {
        return false;
    }
    return (j !== -1) && this.state.stacks.slice(i-1).flatten().intersects(oneof);
};

// candidate object <on top/etc> of loc.obj. Returns the candidates for which this is true
Parser.prototype.location_filter = function(candidates, loc) {
    // var obs = this.parse_object(loc.obj);
    var obs = this.parse_entity(loc.ent);
    console.log("loc cand:" + candidates + " on " + obs);
    var ret = [];
    for (var cand of candidates) {
        switch (loc.rel) {
            case "inside":
            case "ontop":
                if (this.test_ontop(cand, obs)) {
                    ret.push(cand);
                }
                break;
            case "beside":
                if (this.test_beside(cand, obs)) {
                    ret.push(cand);
                }
                break;
            case "left":
                if (this.test_left(cand, obs)) {
                    ret.push(cand);
                }
                break;
            case "right":
                if (this.test_right(cand, obs)) {
                    ret.push(cand);
                }
                break;
            default:
            throw "Unknown relation: " + loc.rel;
        }
    }
    return ret;
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
    let arr2 = [];
    for (var e of arr) {
        if (e != elem) {
            arr2.push(e);
        }
    }
    return arr2;
}

Parser.prototype.parse_cmd = function(o) {
    var move = this.parse_entity(o.ent);
    var oneof = this.parse_entity(o.loc.ent);
    // var oneof = this.location_filter(this.all, o.loc);

    console.log(o.cmd);
    console.log("move " + move);
    console.log("oneof: " + oneof);


    if (o.cmd == "take") {
        if (move.length !== 1) {
            throw "Can only take exactly one element";
        }
        return [{rel: 'holding', item: move[0]}];
    }

    if (move.length === 0) {
        throw "No objects matching";
    } else if (move.length > 1 && o.ent.quant == "any") {
        move = [move[Math.floor(Math.random()*move.length)]];
    }

    var rules = [];
    for (var m of move) {
        var oneof2 = filterArray(m, oneof);
        if (oneof == "floor") {
            if (o.loc.rel != "ontop") {
                throw "Objects must be put on top of the floor";
            }
            rules.push({rel: 'floor', item: m});
        } else if (o.loc.rel == "ontop" || o.loc.rel == "inside") {
            rules.push({rel: 'ontop', item: m, oneof: oneof2});
        } else if (o.loc.rel == "beside" || o.loc.rel == "left" || o.loc.rel == "right") {
            rules.push({rel: o.loc.rel, item: m, oneof: oneof2});
        } else {
            throw "Unknown relation" + o.loc.rel;
        }
    }
    return rules;

};

var ex3 = {"cmd":"move","ent":{"quant":"all","obj":{"size":null,"color":null,"form":"ball"}},"loc":{"rel":"ontop","ent":{"quant":"the","obj":{"size":null,"color":null,"form":"floor"}}}};
var ex4 = {"cmd":"move","ent":{"quant":"all","obj":{"size":null,"color":null,"form":"ball"}},"loc":{"rel":"beside","ent":{"quant":"all","obj":{"size":null,"color":null,"form":"ball"}}}};

var p = new Parser(TMP_currentState, example1);
// console.log(p.parse_object(example1.ent.obj.obj));
// console.log(p.parse_entity(example2.ent));
console.log(p.parse_cmd(example2));
console.log(p.parse_cmd(ex4));
// console.log(p.location_filter(p.all, example2.loc));
// console.log(p.parse_object(example2.loc.ent.obj.loc.ent.obj));
// console.log(p.location_filter(p.all, example2.loc.ent.obj.loc));
// console.log(p.location_filter(['m'], example2.loc));

// function interpret(ne) {
//     console.log(ne.cmd);

// }
// console.log(objects_in_world(TMP_currentState));
