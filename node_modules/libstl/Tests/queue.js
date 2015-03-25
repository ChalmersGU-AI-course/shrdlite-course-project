
console.log('Testing: Queue');

/**
 * Queue tests
 * @type {Queue}
 */
var Queue = require('./../Datastructures/Queue.js');

// testing Queue
var queue = new Queue();
var queue2 = new Queue();

// Queue::enqueue
assert(queue.enqueue(1) === undefined);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([1]));
assert(queue.enqueue(2) === undefined);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([1, 2]));
assert(queue.enqueue(3) === undefined);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([1, 2, 3]));
assert(queue.enqueue(4) === undefined);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([1, 2, 3, 4]));
assert(queue2.enqueue() === undefined);
assert(JSON.stringify(queue2.toArray()) === JSON.stringify([undefined]));
assert(queue2.enqueue(null) === undefined);
assert(JSON.stringify(queue2.toArray()) === JSON.stringify([undefined, null]));
assert(queue2.enqueue(false) === undefined);
assert(JSON.stringify(queue2.toArray()) === JSON.stringify([undefined, null, false]));

// Queue::dequeue
assert(queue.dequeue() === 1);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([2, 3, 4]));
assert(queue.dequeue() === 2);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([3, 4]));
assert(queue.dequeue() === 3);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([4]));
assert(queue.dequeue() === 4);
assert(JSON.stringify(queue.toArray()) === JSON.stringify([]));
assert(queue2.dequeue() === undefined);
assert(JSON.stringify(queue2.toArray()) === JSON.stringify([null, false]));
assert(queue2.dequeue() === null);
assert(JSON.stringify(queue2.toArray()) === JSON.stringify([false]));
assert(queue2.dequeue() === false);
assert(JSON.stringify(queue2.toArray()) === JSON.stringify([]));
