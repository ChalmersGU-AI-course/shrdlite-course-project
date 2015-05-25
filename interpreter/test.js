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


var Parser = require('./interpreter-core');

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
