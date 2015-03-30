var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Heap = require('./Heap');
/**
 * The PriorityQueue class provides the main functionality of an prioritized queue, implemented using a max heap.
 *
 * @class PriorityQueue
 * @extends Heap
 */
var PriorityQueue = (function (_super) {
    __extends(PriorityQueue, _super);
    function PriorityQueue() {
        _super.apply(this, arguments);
        this._type = Heap.MAX;
    }
    /**
     * Adds an element to the queue
     *
     * @method enqueue
     * @param value The value to enqueue.
     * @param priority The priority of value.
     * @return void
     */
    PriorityQueue.prototype.enqueue = function (value, priority) {
        return this.insert(new PriorityQueueNode(value, priority));
    };
    /**
     * Dequeues a node from the queue
     *
     * @method dequeue
     * @return any  The value of the dequeued node.
     */
    PriorityQueue.prototype.dequeue = function () {
        return this.extract().value;
    };
    /**
     * Peeks at the node from the top of the heap
     *
     * @method top
     * @return any The value of the node on the top.
     */
    PriorityQueue.prototype.top = function () {
        return _super.prototype.top.call(this).value;
    };
    /**
     * Compare elements in order to place them correctly in the heap while sifting up.
     *
     * @method compare
     * @param first The value of the first node being compared.
     * @param second The value of the second node being compared.
     * @return number Result of the comparison, positive integer if first is greater than second, 0 if they are equal, negative integer otherwise.
     * Having multiple elements with the same value in a Heap is not recommended. They will end up in an arbitrary relative position.
     */
    PriorityQueue.prototype.compare = function (first, second) {
        if (first.priority > second.priority) {
            return 1;
        }
        else if (first.priority == second.priority) {
            return 0;
        }
        else {
            return -1;
        }
    };
    return PriorityQueue;
})(Heap);
/**
 * PriorityQueue Node
 *
 * @class PriorityQueueNode
 */
var PriorityQueueNode = (function () {
    /**
     * Constructor
     *
     * @method constructor
     * @param value
     * @param priority
     */
    function PriorityQueueNode(value, priority) {
        this.value = value;
        this.priority = priority;
    }
    /**
     * Serializes the node to string
     *
     * @method toString
     * @return string   The serialized string.
     */
    PriorityQueueNode.prototype.toString = function () {
        return this.value + " [" + this.priority + "]";
    };
    return PriorityQueueNode;
})();
module.exports = PriorityQueue;
//# sourceMappingURL=PriorityQueue.js.map