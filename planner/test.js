/*jslint node: true, esnext: true */
"use strict";

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
  "holding": null,
  "arm": 0,
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

// var TMP_rules = [["e", "k"], ["l", "floor"]];
var TMP_rules = [{rel: "ontop", item: "e", oneof: ["k"]},
                {rel: "floor", item: "l"}];

// var TMP_rules = [{rel: 'beside', args: ['e', 'k']}];
//
// var TMP_rules = [{rel: 'beside', args:['e', {form: 'box', size: null, color: 'yellow'}  ]}];
    // var TMP_rules = [{rel: 'beside', args:['e', {form: 'pyramid', size: null, color: null}  ]}];


// var TMP_rules = [{rel: 'beside', item: 'e', oneof:['e', 'g']}];

var planner = require("./planner-core.js");

console.log(planner(TMP_currentState, TMP_rules));
