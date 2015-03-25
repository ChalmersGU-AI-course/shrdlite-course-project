
console.log('Testing: Heap');

/**
 * Heap tests
 * @type {Heap}
 */
var Heap = require('./../Datastructures/Heap.js');

// testing Heap
var heap = new Heap();
var heap2 = new Heap();
var heap3 = new Heap();

// Heap.insert
// Heap.toArray
assert(heap.insert(1) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([1]));
assert(heap.insert(2) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([2,1]));
assert(heap.insert(3) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([3,2,1]));
assert(heap.insert(4) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([4,3,2,1]));
assert(heap.insert(5) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([5,4,3,2,1]));
assert(heap.insert(10) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([10,5,4,3,2,1]));
assert(heap2.insert(3) === undefined);
assert(JSON.stringify(heap2.toArray()) === JSON.stringify([3]));
assert(heap2.insert(1) === undefined);
assert(JSON.stringify(heap2.toArray()) === JSON.stringify([3,1]));
assert(heap2.insert(2) === undefined);
assert(JSON.stringify(heap2.toArray()) === JSON.stringify([3,2,1]));
assert(heap2.insert(10) === undefined);
assert(JSON.stringify(heap2.toArray()) === JSON.stringify([10,3,2,1]));
assert(heap2.insert(0) === undefined);
assert(JSON.stringify(heap2.toArray()) === JSON.stringify([10,3,2,1,0]));
assert(heap2.insert(null) === undefined);
assert(JSON.stringify(heap2.toArray()) === JSON.stringify([10,3,2,1,0,null]));
assert(heap3.insert(11) === undefined);
assert(heap3.insert(3) === undefined);
assert(heap3.insert(4) === undefined);
assert(heap3.insert(5) === undefined);
assert(heap3.insert(8) === undefined);
assert(heap3.insert(2) === undefined);
assert(heap3.insert(7) === undefined);
assert(heap3.insert(1) === undefined);
assert(heap3.insert(17) === undefined);
assert(heap3.insert(70) === undefined);
assert(heap3.insert(69) === undefined);
assert(heap3.insert(71) === undefined);
assert(heap3.insert(6) === undefined);

// Heap.extract
// Heap.count
assert(heap3.extract() === 71);
assert(heap3.count() === 12);
assert(heap2.count() === 6);
assert(heap.count() === 6);
assert(heap3.extract() === 70);
assert(heap3.extract() === 69);
assert(heap3.count() === 10);
assert(heap3.extract() === 17);
assert(heap3.extract() === 11);
assert(heap3.count() === 8);
assert(heap3.count() === 8);
assert(heap3.extract() === 8);
assert(heap3.extract() === 7);
assert(heap3.extract() === 6);
assert(heap3.insert(6) === undefined);
assert(heap3.extract() === 6);
assert(heap3.extract() === 5);
assert(heap3.extract() === 4);
assert(heap3.extract() === 3);
assert(heap3.extract() === 2);
assert(heap3.count() === 1);
assert(heap3.extract() === 1);
assert(heap3.count() === 0);
assert(heap3.count() === 0);

// Heap.compare
assert(heap.compare(0,0) == 0);
assert(heap.compare('A', 'A') == 0);
assert(heap.compare(-101, -101) == 0);
assert(heap.compare(0.0001, 0.0001) == 0);
assert(heap.compare(0.0001, 0.0002) == -1);
assert(heap.compare(1, 2) == -1);
assert(heap.compare('A', 'Z') == -1);
assert(heap.compare(-102, -101) == -1);
assert(heap.compare(0.001, 0.0002) == 1);
assert(heap.compare(2, 1) == 1);
assert(heap.compare('Z', 'B') == 1);
assert(heap.compare(-102, -103) == 1);

// Heap.top
assert(heap.top() === 10);
assert(heap.top() === heap.extract());
assert(heap.top() === 5);
assert(heap.top() === heap.extract());
assert(heap.top() === 4);
assert(heap2.top() === 10);

// Heap.isEmpty
assert(heap3.isEmpty() === true);
assert(heap.extract() === 4);
assert(heap.extract() === 3);
assert(heap.extract() === 2);
assert(heap.extract() === 1);

// Heap.toString
var toString = "\
  10\n\
  ├─3\n\
  │ ├─1\n\
  │ └─0\n\
  └─2\n\
    └─null";
assert(heap2.toString() === toString);
assert(heap2.extract() === 10);
assert(heap2.extract() === 3);
assert(heap2.extract() === 2);
var toString = "\
  1\n\
  ├─null\n\
  └─0";
assert(heap2.toString() === toString);
assert(heap2.extract() === 1);
var toString = "\
  null\n\
  └─0";
assert(heap2.toString() === toString);

// Heap.current
// Heap.next
heap2.rewind();
assert(heap2.current() === null);
heap2.rewind();
assert(heap2.current() === null);
heap2.next();
assert(heap2.current() === 0);
heap2.next();
assert(heap2.current() === undefined);
heap2.next();
assert(heap2.current() === undefined);
heap2.rewind();
assert(heap2.current() === null);

// Heap.key
// Heap.prev
assert(heap2.key() === 0);
assert(heap2.key() === 0);
heap2.next();
assert(heap2.key() === 1);
assert(heap2.current() === 0);
heap2.next();
assert(heap2.key() === 2);
heap2.prev();
assert(heap2.key() === 1);
assert(heap2.current() === 0);
heap2.prev();
assert(heap2.key() === 0);
assert(heap2.current() === null);

// Heap.rewind
heap2.rewind();
assert(heap2.key() === 0);
heap2.next();
heap2.next();
assert(heap2.key() === 2);
heap2.rewind();
assert(heap2.key() === 0);
heap2.rewind();

// Heap.valid
heap2.rewind();
assert(heap2.valid() === true);
heap2.next();
assert(heap2.valid() === true);
heap2.next();
assert(heap2.valid() === false);
heap2.next();
assert(heap2.valid() === false);
heap2.rewind();
assert(heap2.valid() === true);
heap2.rewind();
