var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DoublyLinkedList = require('./DoublyLinkedList');
/**
 * The Queue class provides the main functionality of a queue implemented using a doubly linked list.
 *
 * @class Queue
 * @extends DoublyLinkedList
 */
var Queue = (function (_super) {
    __extends(Queue, _super);
    function Queue() {
        _super.apply(this, arguments);
    }
    /**
     * Adds an element to the queue
     *
     * @method enqueue
     * @param value The value to enqueue.
     * @return void
     */
    Queue.prototype.enqueue = function (value) {
        return this.push(value);
    };
    /**
     * Dequeues a node from the queue
     *
     * @method dequeue
     * @return any  The value of the dequeued node.
     */
    Queue.prototype.dequeue = function () {
        return this.shift();
    };
    return Queue;
})(DoublyLinkedList);
module.exports = Queue;
//# sourceMappingURL=Queue.js.map