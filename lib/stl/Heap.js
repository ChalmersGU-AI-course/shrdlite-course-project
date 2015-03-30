/**
 * The Heap class provides the main functionality of a Heap.
 *
 * @class Heap
 */
var Heap = (function () {
    function Heap() {
        /**
         * Binary tree storage array
         *
         * @property _tree
         * @type Array
         * @private
         */
        this._tree = [];
        /**
         * Heap type
         *
         * @property _type
         * @type number
         * @private
         */
        this._type = Heap.MAX;
        /**
         * Iteration pointer
         *
         * @property _key
         * @type number
         * @private
         */
        this._key = 0;
    }
    /**
     * Get index of left child element in binary tree stored in array
     *
     * @method _child
     * @param n
     * @return number
     * @private
     */
    Heap.prototype._child = function (n) {
        return 2 * n + 1;
    };
    /**
     * Get index of parent element in binary tree stored in array
     *
     * @method _parent
     * @param n
     * @return number
     * @private
     */
    Heap.prototype._parent = function (n) {
        return Math.floor(n - 1 / 2);
    };
    /**
     * Swap 2 elements in binary tree
     *
     * @method _swap
     * @param first
     * @param second
     * @private
     */
    Heap.prototype._swap = function (first, second) {
        var swap = this._tree[first];
        this._tree[first] = this._tree[second];
        this._tree[second] = swap;
    };
    /**
     * Sift elements in binary tree
     *
     * @method _siftUp
     * @param i
     * @private
     */
    Heap.prototype._siftUp = function (i) {
        while (i > 0) {
            var parent = this._parent(i);
            if (this.compare(this._tree[i], this._tree[parent]) * this._type > 0) {
                this._swap(i, parent);
                i = parent;
            }
            else {
                break;
            }
        }
    };
    /**
     * Sift down elements in binary tree
     *
     * @method _siftDown
     * @param i
     * @private
     */
    Heap.prototype._siftDown = function (i) {
        while (i < this._tree.length) {
            var left = this._child(i);
            var right = left + 1;
            if ((left < this._tree.length) && (right < this._tree.length) && (this.compare(this._tree[i], this._tree[left]) * this._type < 0 || this.compare(this._tree[i], this._tree[right]) * this._type < 0)) {
                // there is 2 children and one of them must be swapped
                // get correct element to sift down
                var sift = left;
                if (this.compare(this._tree[left], this._tree[right]) * this._type < 0) {
                    sift = right;
                }
                this._swap(i, sift);
                i = sift;
            }
            else if (left < this._tree.length && this.compare(this._tree[i], this._tree[left]) * this._type < 0) {
                // only one child exists
                this._swap(i, left);
                i = left;
            }
            else {
                break;
            }
        }
    };
    /**
     * Extracts a node from top of the heap and sift up
     *
     * @method extract
     * @return any The value of the extracted node.
     */
    Heap.prototype.extract = function () {
        if (this._tree.length === 0) {
            throw new Error("Can't extract from an empty data structure");
        }
        var extracted = this._tree[0];
        if (this._tree.length === 1) {
            this._tree = [];
        }
        else {
            this._tree[0] = this._tree.pop();
            this._siftDown(0);
        }
        return extracted;
    };
    /**
     * Inserts an element in the heap by sifting it up
     *
     * @method insert
     * @param value The value to insert.
     * @return void
     */
    Heap.prototype.insert = function (value) {
        this._tree.push(value);
        this._siftUp(this._tree.length - 1);
    };
    /**
     * Peeks at the node from the top of the heap
     *
     * @method top
     * @return any The value of the node on the top.
     */
    Heap.prototype.top = function () {
        if (this._tree.length === 0) {
            throw new Error("Can't peek at an empty heap");
        }
        return this._tree[0];
    };
    /**
     * Counts the number of elements in the heap
     *
     * @method count
     * @return number the number of elements in the heap.
     */
    Heap.prototype.count = function () {
        return this._tree.length;
    };
    /**
     * Checks whether the heap is empty
     *
     * @method isEmpty
     * @return boolean whether the heap is empty.
     */
    Heap.prototype.isEmpty = function () {
        return (this._tree.length === 0);
    };
    /**
     * Rewind iterator back to the start (no-op)
     *
     * @method rewind
     * @return void
     */
    Heap.prototype.rewind = function () {
        this._key = 0;
    };
    /**
     * Return current node pointed by the iterator
     *
     * @method current
     * @return any The current node value.
     */
    Heap.prototype.current = function () {
        return this._tree[this._key];
    };
    /**
     * Return current node index
     *
     * @method key
     * @return any The current node index.
     */
    Heap.prototype.key = function () {
        return this._key;
    };
    /**
     * Move to the next node
     *
     * @method next
     * @return void
     */
    Heap.prototype.next = function () {
        this._key++;
    };
    /**
     * Move to previous entry
     *
     * @method prev
     * @return void
     */
    Heap.prototype.prev = function () {
        this._key--;
    };
    /**
     * Check whether the heap contains more nodes
     *
     * @method valid
     * @return boolean true if the heap contains any more nodes, false otherwise.
     */
    Heap.prototype.valid = function () {
        return (this._key >= 0 && this._key < this._tree.length);
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
    Heap.prototype.compare = function (first, second) {
        if (first > second) {
            return 1;
        }
        else if (first == second) {
            return 0;
        }
        else {
            return -1;
        }
    };
    /**
     * Visually display heap tree
     *
     * @method _displayNode
     * @param node
     * @param prefix
     * @param last
     * @return String
     * @private
     */
    Heap.prototype._displayNode = function (node, prefix, last) {
        if (prefix === void 0) { prefix = ''; }
        if (last === void 0) { last = true; }
        var line = prefix;
        // get child indexes
        var left = this._child(node);
        var right = left + 1;
        if (last) {
            line += (prefix ? '└─' : '  ');
        }
        else {
            line += '├─';
        }
        line += this._tree[node];
        prefix += (last ? '  ' : '│ ');
        if (left < this._tree.length) {
            line += '\n' + this._displayNode(left, prefix, (this._tree[right] == undefined ? true : false));
        }
        if (right < this._tree.length) {
            line += '\n' + this._displayNode(right, prefix, true);
        }
        return line;
    };
    /**
     * Serializes the heap to string
     *
     * @method toString
     * @return string   The serialized string.
     */
    Heap.prototype.toString = function () {
        // start with root and recursively goes to each node
        return this._displayNode(0);
    };
    /**
     * Serializes the heap to array
     *
     * @method toArray
     * @return Array   The serialized array.
     */
    Heap.prototype.toArray = function () {
        return this._tree;
    };
    /**
     * Max heap flag
     *
     * @property MAX
     * @type number
     * @static
     */
    Heap.MAX = 1;
    /**
     * Min heap flag
     *
     * @property MIN
     * @type number
     * @static
     */
    Heap.MIN = -1;
    return Heap;
})();
module.exports = Heap;
//# sourceMappingURL=Heap.js.map