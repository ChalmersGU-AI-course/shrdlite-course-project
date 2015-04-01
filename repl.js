#!/usr/local/bin/node

var repl = require("repl");
var context = repl.start("> ").context;

// Configure what’s available in the REPL
context.AStar = require("./dist/AStar.js");
