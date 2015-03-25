
import Heap = require('./Heap');

/**
 * The PriorityQueue class provides the main functionality of an prioritized queue, implemented using a max heap.
 *
 * @class PriorityQueue
 * @extends Heap
 */
class PriorityQueue extends Heap {

    protected _type = Heap.MAX;

    /**
     * Adds an element to the queue
     *
     * @method enqueue
     * @param value The value to enqueue.
     * @param priority The priority of value.
     * @return void
     */
    public enqueue(value:any, priority:any) {
        return this.insert(new PriorityQueueNode(value, priority));
    }

    /**
     * Dequeues a node from the queue
     *
     * @method dequeue
     * @return any  The value of the dequeued node.
     */
    public dequeue() {
        return this.extract().value;
    }

    /**
     * Peeks at the node from the top of the heap
     *
     * @method top
     * @return any The value of the node on the top.
     */
    public top():any {
        return super.top().value;
    }

    /**
     * Compare elements in order to place them correctly in the heap while sifting up.
     *
     * @method compare
     * @param first The value of the first node being compared.
     * @param second The value of the second node being compared.
     * @return number Result of the comparison, positive integer if first is greater than second, 0 if they are equal, negative integer otherwise.
     * Having multiple elements with the same value in a Heap is not recommended. They will end up in an arbitrary relative position.
     */
    public compare(first:PriorityQueueNode, second:PriorityQueueNode):number {
        if (first.priority > second.priority) {
            return 1;
        } else if (first.priority == second.priority) {
            return 0;
        } else {
            return -1;
        }
    }
}

/**
 * PriorityQueue Node
 *
 * @class PriorityQueueNode
 */
class PriorityQueueNode {

    /**
     * Node value
     *
     * @property value
     * @type any
     */
    public value;

    /**
     * Node priority
     *
     * @property priority
     * @type any
     */
    public priority;

    /**
     * Constructor
     *
     * @method constructor
     * @param value
     * @param priority
     */
    public constructor(value:any, priority:any) {
        this.value = value;
        this.priority = priority;
    }

    /**
     * Serializes the node to string
     *
     * @method toString
     * @return string   The serialized string.
     */
    public toString():string {
        return this.value + " [" + this.priority + "]";
    }
}

export = PriorityQueue;