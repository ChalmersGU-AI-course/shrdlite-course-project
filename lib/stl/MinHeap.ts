
import Heap = require('./Heap');

/**
 * The MinHeap class provides the main functionality of a heap, keeping the minimum on the top.
 *
 * @class MinHeap
 * @extends Heap
 */
class MinHeap extends Heap {

    protected _type = Heap.MIN;

}

export = MinHeap;