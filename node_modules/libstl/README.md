![libstl](libstl.png?raw=true "libstl")

# Introduction

The Standard Javascript/TypeScript Library (STL) is a collection of interfaces and classes that are meant to solve common problems.

STL provides a set of standard datastructures. They are grouped here by their underlying implementation which usually defines their general field of application.

### [API Documentation can be found here](http://vovazolotoy.github.io/docs/)

# Table of Contents

* [DoublyLinkedList](#doublylinkedlist)
* [Stack](#stack)
* [Queue](#queue)
* [Heap](#heap)
* [MaxHeap](#maxheap)
* [MinHeap](#minheap)
* [PriorityQueue](#priorityqueue)

## Doubly Linked Lists

A Doubly Linked List (DLL) is a list of nodes linked in both directions to each others. Iterator's operations, access to both ends, addition or removal of nodes have a cost of O(1) when the underlying structure is a DLL. It hence provides a decent implementation for stacks and queues.

* [DoublyLinkedList](#doublylinkedlist)
* [Stack](#stack)
* [Queue](#queue)

## Heaps

Heaps are tree-like structures that follow the heap-property: each node is greater than or equal to its children, when compared using the implemented compare method which is global to the heap.

* [Heap](#Heap)
* [MaxHeap](#MaxHeap)
* [MinHeap](#MinHeap)
* [PriorityQueue](#PriorityQueue)

## DoublyLinkedList
```javascript
var DoublyLinkedList = require('libstl').DoublyLinkedList;

var list = new DoublyLinkedList();
list.push(1);
list.push(2);
list.push(3);
list.toString(); // = {1->2->3}
```

## Stack
```javascript
var Stack = require('libstl').Stack;

var stack = new Stack();
stack.push('A');
stack.push('B');
stack.push('C');
stack.pop(); // = 'C'
```

## Queue
```javascript
var Queue = require('libstl').Queue;

var queue = new Queue();
queue.enqueue('A');
queue.enqueue('B');
queue.enqueue('C');
queue.dequeue(); // = 'A'
```

## Heap
```javascript
var Heap = require('libstl').Heap;

var heap = new Heap();
heap.insert(1);
heap.insert(2);
heap.insert(3);
heap.top(); // = 1
```

## MaxHeap
```javascript
var MaxHeap = require('libstl').MaxHeap;

var heap = new MaxHeap();
heap.insert(1);
heap.insert(2);
heap.insert(3);
heap.top(); // = 3
```

## MinHeap
```javascript
var MinHeap = require('libstl').MinHeap;

var heap = new MinHeap();
heap.insert(1);
heap.insert(2);
heap.insert(3);
heap.top(); // = 1
```

## PriorityQueue
```javascript
var PriorityQueue = require('libstl').PriorityQueue;

var queue = new PriorityQueue();
```
