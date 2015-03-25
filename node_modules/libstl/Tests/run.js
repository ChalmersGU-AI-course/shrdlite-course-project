
console.log('Testing: Standard TypeScript Library');

/**
 * Base asserting
 *
 * @param condition
 * @param message
 */
global.assert = function(condition, message) {
	if (!condition) {
		throw message || "Assertion failed";
	}
}

require('./doublylinkedlist.js');
require('./stack.js');
require('./queue.js');
require('./heap.js');
require('./maxheap.js');
require('./minheap.js');
require('./priorityqueue.js');

console.log('Testing: Done, Success!');