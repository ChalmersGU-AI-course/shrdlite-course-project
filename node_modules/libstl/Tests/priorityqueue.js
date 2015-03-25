
console.log('Testing: PriorityQueue');

/**
 * PriorityQueue tests
 * @type {PriorityQueue}
 */
var PriorityQueue = require('./../Datastructures/PriorityQueue.js');

// testing PriorityQueue
var queue = new PriorityQueue();

// PriorityQueue.enqueue
// PriorityQueue.dequeue
// PriorityQueue.top
queue.enqueue('C', 0.000001);
assert(queue.top() !== 'C2');
assert(queue.top() === 'C');
queue.enqueue('C2', 2);
assert(queue.top() === 'C2');
queue.enqueue('C3', 3);
queue.enqueue('C1', 1);
queue.enqueue('Cmin', 0.01);
queue.enqueue('C4', 0.1);
assert(queue.top() === 'C3');
assert(queue.dequeue() === 'C3');
assert(queue.top() === 'C2');
assert(queue.dequeue() === 'C2');
assert(queue.dequeue() === 'C1');
assert(queue.dequeue() === 'C4');
assert(queue.dequeue() === 'Cmin');

// PriorityQueue.toString
var toString = "  C [0.000001]";
assert(queue.toString() === toString);
queue.enqueue('C1', 1);
queue.enqueue('Cmin', 0.01);
var toString = "\
  C1 [1]\n\
  ├─Cmin [0.01]\n\
  └─C [0.000001]";
assert(queue.toString() === toString);
