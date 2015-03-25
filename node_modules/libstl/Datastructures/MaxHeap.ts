
import Heap = require('./Heap');

/**
 * The MaxHeap class provides the main functionality of a heap, keeping the maximum on the top.
 *
 * @class MaxHeap
 * @extends Heap
 */
class MaxHeap extends Heap {

    protected _type = Heap.MAX;

}

export = MaxHeap;