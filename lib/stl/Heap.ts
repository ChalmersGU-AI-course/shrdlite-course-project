/**
 * The Heap class provides the main functionality of a Heap.
 *
 * @class Heap
 */
class Heap {

    /**
     * Max heap flag
     *
     * @property MAX
     * @type number
     * @static
     */
    public static MAX:number = 1;

    /**
     * Min heap flag
     *
     * @property MIN
     * @type number
     * @static
     */
    public static MIN:number = -1;

    /**
     * Binary tree storage array
     *
     * @property _tree
     * @type Array
     * @private
     */
    private _tree:Array<any> = [];

    /**
     * Heap type
     *
     * @property _type
     * @type number
     * @private
     */
    protected _type:number = Heap.MAX;

    /**
     * Iteration pointer
     *
     * @property _key
     * @type number
     * @private
     */
    private _key = 0;

    /**
     * Get index of left child element in binary tree stored in array
     *
     * @method _child
     * @param n
     * @return number
     * @private
     */
    private _child(n:number):number {
        return 2 * n + 1;
    }

    /**
     * Get index of parent element in binary tree stored in array
     *
     * @method _parent
     * @param n
     * @return number
     * @private
     */
    private _parent(n:number):number {
        return Math.floor(n - 1 / 2);
    }

    /**
     * Swap 2 elements in binary tree
     *
     * @method _swap
     * @param first
     * @param second
     * @private
     */
    private _swap(first:number, second:number):void {
        var swap = this._tree[first];
        this._tree[first] = this._tree[second];
        this._tree[second] = swap;
    }

    /**
     * Sift elements in binary tree
     *
     * @method _siftUp
     * @param i
     * @private
     */
    private _siftUp(i:number):void {
        while (i > 0) {
            var parent = this._parent(i);
            if (this.compare(this._tree[i], this._tree[parent]) * this._type > 0) {
                this._swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }

    /**
     * Sift down elements in binary tree
     *
     * @method _siftDown
     * @param i
     * @private
     */
    private _siftDown(i:number):void {
        while (i < this._tree.length) {
            var left = this._child(i);
            var right = left + 1;

            if ((left < this._tree.length) && (right < this._tree.length) &&
                (this.compare(this._tree[i], this._tree[left]) * this._type < 0 ||
                this.compare(this._tree[i], this._tree[right]) * this._type < 0))
            {
                // there is 2 children and one of them must be swapped
                // get correct element to sift down
                var sift = left;
                if (this.compare(this._tree[left], this._tree[right]) * this._type < 0) {
                    sift = right;
                }
                this._swap(i, sift);
                i = sift;
            }
            else if (left < this._tree.length &&
                    this.compare(this._tree[i], this._tree[left]) * this._type < 0) {
                // only one child exists
                this._swap(i, left);
                i = left;
            } else {
                break;
            }
        }
    }

    /**
     * Extracts a node from top of the heap and sift up
     *
     * @method extract
     * @return any The value of the extracted node.
     */
    public extract():any {
        if (this._tree.length === 0) {
            throw new Error("Can't extract from an empty data structure");
        }

        var extracted:any = this._tree[0];

        if (this._tree.length === 1) {
            this._tree = [];
        } else {
            this._tree[0] = this._tree.pop();
            this._siftDown(0);
        }

        return extracted;
    }

    /**
     * Inserts an element in the heap by sifting it up
     *
     * @method insert
     * @param value The value to insert.
     * @return void
     */
    public insert(value:any):void {
        this._tree.push(value);
        this._siftUp(this._tree.length - 1);
    }

    /**
     * Peeks at the node from the top of the heap
     *
     * @method top
     * @return any The value of the node on the top.
     */
    public top():any {
        if (this._tree.length === 0) {
            throw new Error("Can't peek at an empty heap");
        }

        return this._tree[0];
    }

    /**
     * Counts the number of elements in the heap
     *
     * @method count
     * @return number the number of elements in the heap.
     */
    public count():number {
        return this._tree.length;
    }

    /**
     * Checks whether the heap is empty
     *
     * @method isEmpty
     * @return boolean whether the heap is empty.
     */
    public isEmpty():boolean {
        return (this._tree.length === 0);
    }

    /**
     * Rewind iterator back to the start (no-op)
     *
     * @method rewind
     * @return void
     */
    public rewind():void {
        this._key = 0;
    }

    /**
     * Return current node pointed by the iterator
     *
     * @method current
     * @return any The current node value.
     */
    public current():any {
        return this._tree[this._key];
    }

    /**
     * Return current node index
     *
     * @method key
     * @return any The current node index.
     */
    public key():any {
        return this._key;
    }

    /**
     * Move to the next node
     *
     * @method next
     * @return void
     */
    public next():void {
        this._key++;
    }

    /**
     * Move to previous entry
     *
     * @method prev
     * @return void
     */
    public prev():void {
        this._key--;
    }

    /**
     * Check whether the heap contains more nodes
     *
     * @method valid
     * @return boolean true if the heap contains any more nodes, false otherwise.
     */
    public valid():boolean {
        return (this._key >= 0 && this._key < this._tree.length);
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
    public compare(first:any, second:any):number {
        if (first > second) {
            return 1;
        } else if (first == second) {
            return 0;
        } else {
            return -1;
        }
    }

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
    private _displayNode(node, prefix = '', last = true) {
        var line = prefix;

        // get child indexes
        var left = this._child(node);
        var right = left + 1;

        if (last) {
            line += (prefix ? '└─' : '  ');
        } else {
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
    }

    /**
     * Serializes the heap to string
     *
     * @method toString
     * @return string   The serialized string.
     */
    public toString():string {
        // start with root and recursively goes to each node
        return this._displayNode(0);
    }

    /**
     * Serializes the heap to array
     *
     * @method toArray
     * @return Array   The serialized array.
     */
    public toArray():Array<any> {
        return this._tree;
    }
}

export = Heap;