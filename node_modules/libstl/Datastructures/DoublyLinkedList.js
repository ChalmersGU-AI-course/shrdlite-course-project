/**
 * The DoublyLinkedList class provides the main functionality of a doubly linked list.
 *
 * @class DoublyLinkedList
 */
var DoublyLinkedList = (function () {
    function DoublyLinkedList() {
        /**
         * Count of elements in list
         *
         * @property _length
         * @type number
         * @private
         */
        this._length = 0;
        /**
         * Iteration pointer
         *
         * @property _key
         * @type number
         * @private
         */
        this._key = 0;
        /**
         * Reference to head(first) element in list
         *
         * @property _head
         * @type DoublyLinkedListNode
         * @private
         */
        this._head = null;
        /**
         * Reference to tail(last) element in list
         *
         * @property _tail
         * @type DoublyLinkedListNode
         * @private
         */
        this._tail = null;
        /**
         * Reference to iterated element in list
         *
         * @property _current
         * @type DoublyLinkedListNode
         * @private
         */
        this._current = null;
    }
    /**
     * Insert a new value at the specified index
     *
     * @method add
     * @param index The index where the new value is to be inserted.
     * @param value The new value for the index.
     * @return void
     */
    DoublyLinkedList.prototype.add = function (index, value) {
        if (index < 0 || index >= this._length) {
            throw new Error("Out of bounds");
        }
        var i = 0;
        var current = this._head;
        while (i < index) {
            current = current.next;
            i++;
        }
        current.value = value;
    };
    /**
     * Pops a node from the end of the doubly linked list
     *
     * @method pop
     * @return any  The value of the popped node.
     */
    DoublyLinkedList.prototype.pop = function () {
        if (this._length === 0) {
            throw new Error("Can't pop from an empty data structure");
        }
        var value = this._tail.value;
        this._tail = this._tail.prev;
        if (this._tail) {
            delete this._tail.next;
            this._tail.next = null;
        }
        this._length--;
        if (this._length === 0) {
            delete this._head;
            this._head = null;
        }
        return value;
    };
    /**
     * Shifts a node from the beginning of the doubly linked list
     *
     * @method shift
     * @return any  The value of the shifted node.
     */
    DoublyLinkedList.prototype.shift = function () {
        if (this._length === 0) {
            throw new Error("Can't shift from an empty data structure");
        }
        var value = this._head.value;
        this._head = this._head.next;
        if (this._head) {
            delete this._head.prev;
            this._head.prev = null;
        }
        this._length--;
        return value;
    };
    /**
     * Pushes an element at the end of the doubly linked list
     *
     * @method push
     * @param value The value to push.
     * @return void
     */
    DoublyLinkedList.prototype.push = function (value) {
        // allocate new node
        var node = {
            value: value,
            prev: this._tail,
            next: null
        };
        if (this._length === 0) {
            this._head = this._tail = node;
        }
        else {
            this._tail.next = node;
            this._tail = this._tail.next;
        }
        this._length++;
    };
    /**
     * Prepends the doubly linked list with an element
     *
     * @method unshift
     * @param value The value to unshift.
     * @return void
     */
    DoublyLinkedList.prototype.unshift = function (value) {
        // allocate new node
        var node = {
            value: value,
            prev: null,
            next: this._head
        };
        if (this._length === 0) {
            this._head = this._tail = node;
        }
        else {
            this._head.prev = node;
            this._head = this._head.prev;
        }
        this._length++;
    };
    /**
     * Peeks at the node from the end of the doubly linked list
     *
     * @method top
     * @return any  The value of the last node.
     */
    DoublyLinkedList.prototype.top = function () {
        if (this._tail)
            return this._tail.value;
    };
    /**
     * Peeks at the node from the beginning of the doubly linked list
     *
     * @method bottom
     * @return any  The value of the first node.
     */
    DoublyLinkedList.prototype.bottom = function () {
        if (this._head)
            return this._head.value;
    };
    /**
     * Counts the number of elements in the doubly linked list
     *
     * @method count
     * @return number the number of elements in the doubly linked list.
     */
    DoublyLinkedList.prototype.count = function () {
        return this._length;
    };
    /**
     * Checks whether the doubly linked list is empty
     *
     * @method isEmpty
     * @return boolean whether the doubly linked list is empty.
     */
    DoublyLinkedList.prototype.isEmpty = function () {
        return (this._length === 0);
    };
    /**
     * Rewind iterator back to the start
     *
     * @method rewind
     * @return void
     */
    DoublyLinkedList.prototype.rewind = function () {
        this._key = 0;
        this._current = this._head;
    };
    /**
     * Return current list entry
     *
     * @method current
     * @return any  The current node value.
     */
    DoublyLinkedList.prototype.current = function () {
        if (this._current) {
            return this._current.value;
        }
        return null;
    };
    /**
     * Return current node index
     *
     * @method key
     * @return any  The current node index.
     */
    DoublyLinkedList.prototype.key = function () {
        return this._key;
    };
    /**
     * Move to next entry
     *
     * @method next
     * @return void
     */
    DoublyLinkedList.prototype.next = function () {
        this._current = this._current.next;
        this._key++;
    };
    /**
     * Move to previous entry
     *
     * @method prev
     * @return void
     */
    DoublyLinkedList.prototype.prev = function () {
        this._current = this._current.prev;
        this._key--;
    };
    /**
     * Check whether the doubly linked list contains more nodes
     *
     * @method valid
     * @return boolean true if the doubly linked list contains any more nodes, false otherwise.
     */
    DoublyLinkedList.prototype.valid = function () {
        return (this._key >= 0 && this._key < this._length);
    };
    /**
     * Export the list to array
     *
     * @method toArray
     * @return Array   The exported array
     */
    DoublyLinkedList.prototype.toArray = function () {
        var list = [];
        var current = this._head;
        while (current) {
            list.push(current.value);
            current = current.next;
        }
        return list;
    };
    /**
     * Serializes the list to string
     *
     * @method toString
     * @return string   The serialized string.
     */
    DoublyLinkedList.prototype.toString = function () {
        return "{" + this.toArray().join("->") + "}";
    };
    return DoublyLinkedList;
})();
module.exports = DoublyLinkedList;
//# sourceMappingURL=DoublyLinkedList.js.map