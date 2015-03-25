
console.log('Testing: MaxHeap');

/**
 * MaxHeap tests
 * @type {MaxHeap}
 */
var MaxHeap = require('./../Datastructures/MaxHeap.js');

// testing MaxHeap
var heap = new MaxHeap();

// MaxHeap::insert
// MaxHeap::toArray
assert(heap.insert(1) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([1]));
assert(heap.insert(2) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([2, 1]));
assert(heap.insert(3) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([3, 2, 1]));
assert(heap.insert(4) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([4, 3, 2, 1]));
assert(heap.insert(5) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([5, 4, 3, 2, 1]));
assert(heap.insert(10) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([10, 5, 4, 3, 2, 1]));
assert(heap.insert(1000) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([1000, 10, 5, 4, 3, 2, 1]));
assert(heap.insert(90) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([1000, 90, 10, 5, 4, 3, 2, 1]));
assert(heap.insert(7) === undefined);
assert(JSON.stringify(heap.toArray()) === JSON.stringify([1000, 90, 10, 7, 5, 4, 3, 2, 1]));

// MaxHeap::extract
// MaxHeap::count
assert(heap.count() === 9);
assert(heap.extract() === 1000);
assert(heap.extract() === 90);
assert(heap.extract() === 10);
assert(heap.extract() === 7);
assert(heap.count() === 5);
assert(heap.extract() === 5);
assert(heap.extract() === 4);
assert(heap.extract() === 3);
assert(heap.count() === 2);
assert(heap.extract() === 2);
assert(heap.extract() === 1);
assert(heap.count() === 0);
assert(heap.count() === 0);
assert(heap.insert(123131232) === undefined);
assert(heap.insert(32313151232) === undefined);
assert(heap.insert(2231311232) === undefined);
assert(heap.insert(1231311232) === undefined);
assert(heap.insert(5231131232) === undefined);
assert(heap.insert(1) === undefined);
assert(heap.insert(10) === undefined);
assert(heap.insert(100) === undefined);
assert(heap.insert(1000) === undefined);
assert(heap.insert(10000) === undefined);
assert(heap.insert(100000) === undefined);
assert(heap.insert(12113131232) === undefined);
assert(heap.count() === 12);

// MaxHeap.compare
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

// MaxHeap.top
assert(heap.top() === 32313151232);
assert(heap.top() === heap.extract());
assert(heap.top() === 12113131232);
assert(heap.top() === heap.extract());
assert(heap.top() === 5231131232);
assert(heap.top() === heap.extract());
assert(heap.top() === 2231311232);

// MaxHeap.isEmpty
assert(heap.isEmpty() === false);
var heap2 = new MaxHeap();
assert(heap2.isEmpty() === true);
assert(heap2.insert(1) === undefined);
assert(heap2.isEmpty() === false);

// MaxHeap.toString
var toString = "\
  2231311232\n\
  ├─1231311232\n\
  │ ├─10000\n\
  │ │ ├─1\n\
  │ │ └─1000\n\
  │ └─100\n\
  └─123131232\n\
    ├─10\n\
    └─100000";
assert(heap.toString() === toString);
assert(heap.extract() === 2231311232);
assert(heap.extract() === 1231311232);
assert(heap.extract() === 123131232);
toString = "\
  100000\n\
  ├─10000\n\
  │ ├─1000\n\
  │ └─100\n\
  └─10\n\
    └─1";
assert(heap.toString() === toString);
assert(heap.insert(100001) === undefined);
toString = "\
  100001\n\
  ├─100000\n\
  │ ├─10\n\
  │ └─1000\n\
  └─10000\n\
    ├─100\n\
    └─1";
assert(heap.toString() === toString);
assert(heap.extract() === 100001);
assert(heap.extract() === 100000);
assert(heap.extract() === 10000);
assert(heap.extract() === 1000);
toString = "\
  100\n\
  ├─10\n\
  └─1";
assert(heap.toString() === toString);



/**
 current
 key
 next
 recoverFromCorruption
 rewind
 valid
 */