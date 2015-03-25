
console.log('Testing: DoublyLinkedList');

/**
 * DoublyLinkedList tests
 * @type {DoublyLinkedList}
 */
var DoublyLinkedList = require('./../Datastructures/DoublyLinkedList.js');

// testing lists
var list = new DoublyLinkedList();
var list2 = new DoublyLinkedList();
var list3 = new DoublyLinkedList();
var list4 = new DoublyLinkedList();

// DoublyLinkedList.push
// DoublyLinkedList.toArray
assert(list.push(1) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([1]));
assert(list.push(2) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([1, 2]));
assert(list.push(3) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([1, 2, 3]));
assert(list.push(4) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([1, 2, 3, 4]));
assert(list2.push() === undefined);
assert(JSON.stringify(list2.toArray()) === JSON.stringify([undefined]));
assert(list2.push(null) === undefined);
assert(JSON.stringify(list2.toArray()) === JSON.stringify([undefined, null]));
assert(list2.push(false) === undefined);
assert(JSON.stringify(list2.toArray()) === JSON.stringify([undefined, null, false]));
assert(list3.push(100000000) === undefined);

// DoublyLinkedList.count
assert(list.count() === 4);
assert(list2.count() === 3);
assert(list3.count() === 1);
assert(list4.count() === 0);

// DoublyLinkedList.isEmpty
assert(list.isEmpty() === false);
assert(list2.isEmpty() === false);
assert(list3.isEmpty() === false);
assert(list4.isEmpty() === true);

// DoublyLinkedList.top
assert(list.top() === 4);
assert(list2.top() === false);
assert(list3.top() === 100000000);
assert(list4.top() === undefined);

// DoublyLinkedList.bottom
assert(list.bottom() === 1);
assert(list2.bottom() === undefined);
assert(list3.bottom() === 100000000);
assert(list4.bottom() === undefined);

// DoublyLinkedList.toString
assert(list.toString() === "{1->2->3->4}");
assert(list2.toString() === "{->->false}");
assert(list3.toString() === "{100000000}");
assert(list4.toString() === "{}");

// DoublyLinkedList.add
assert(list.add(1,1) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([1,1,3,4]));
assert(list.add(0,0.5) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([0.5,1,3,4]));
assert(list.add(2,2) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([0.5,1,2,4]));
assert(list.add(3,3) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([0.5,1,2,3]));

// DoublyLinkedList.pop
assert(list.pop() === 3);
assert(list.pop() === 2);
assert(list.pop() === 1);
assert(list.pop() === 0.5);

// DoublyLinkedList.shift
list.push(1);
list.push(2);
list.push(3);
list.push(4);
assert(list.shift() === 1);
assert(list.shift() === 2);
assert(list.shift() === 3);
assert(list.shift() === 4);

// DoublyLinkedList.unshift
assert(list.unshift(1) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([1]));
assert(list.unshift(2) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([2, 1]));
assert(list.unshift(3) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([3, 2, 1]));
assert(list.unshift(4) === undefined);
assert(JSON.stringify(list.toArray()) === JSON.stringify([4, 3, 2, 1]));

// DoublyLinkedList.current
// DoublyLinkedList.next
list.rewind();
assert(list.current() === 4);
assert(list.current() === 4);
list.next();
assert(list.current() === 3);
list.next();
assert(list.current() === 2);
list.next();
assert(list.current() === 1);
list.rewind();
assert(list.current() === 4);
list.next();
assert(list.current() === 3);

// DoublyLinkedList.key
// DoublyLinkedList.prev
assert(list.key() === 1);
list.next();
list.next();
assert(list.key() === 3);
assert(list.key() === 3);
list.prev();
assert(list.key() === 2);
list.prev();
assert(list.key() === 1);
list.prev();
assert(list.key() === 0);
assert(list.current() === 4);

// DoublyLinkedList.rewind
list.rewind();
assert(list.key() === 0);
list.next();
list.next();
assert(list.key() === 2);
list.rewind();
assert(list.key() === 0);
list4.rewind();

// DoublyLinkedList.valid
list4.rewind();
assert(list.valid() === true);
list.next();
list.next();
assert(list.valid() === true);
list.next();
assert(list.valid() === true);
list.next();
assert(list.valid() !== true);
