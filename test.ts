///<reference path="lib/node.d.ts"/>

var Stack = require('libstl').Stack;

var stack = new Stack();
stack.push('A');
stack.push('B');
stack.push('C');
stack.pop(); // = 'C'

console.log(stack.pop());

