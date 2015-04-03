/**
 * Created by Niklas on 2015-03-27.
 */
///<reference path="../lib/collections.ts"/>
///<reference path="../lib/lodash.d.ts"/>


module AStar {

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // Types

    export class Node  {
        label: string;
        neighbours: Edge[];
        cost:number;
        previous: Node;
        constructor (label:string, neighbours:Edge[]=[], cost:number=Infinity, previous:Node=null) {
            this.label = label;
            this.neighbours = neighbours;
            this.cost = cost;
            this.previous = previous;
        }

        // Convenience function for creating many nodes.
        // Sets all neighbour lists to []
        public static createNodes(data : [[string,number]]) : Node[] {
            var nodes = [];
            for (var key in data) {
                nodes.push(new Node(data[key][0], [], data[key][1]));
            }
            return nodes;
        }
    }

    export class Edge {
        start : Node;
        end : Node;
        cost: number;
        constructor (start : Node, end : Node, cost : number) {
            this.start = start;
            this.end   = end;
            this.cost  = cost;
        }

        // Creates a new edge which goes in the opposite direction of this one.
        // If no cost is given, the new edge recieves the same cost as this one
        public complement(cost? : number) : Edge {
            if (!(_.isFinite(cost))) cost = 1;
            return new Edge(this.end, this.start, this.cost);
        }

        // Convenience function for creating many edges
        public static createEdges(data : [[Node,Node,number]]) : Edge[] {
            var edges = [];
            for (var key in data) {
                var e = new Edge(data[key][0], data[key][1], data[key][2]);
                edges.push(e);
            }
            return edges;
        }
    }



    /////////////////////////////////////////////////////////////////////////////////////////////////////
    // A* algorithm

    export function astar(s: Node, t : Node, nodes : Node[], heuristic: (Node)=>number) : Node[] {

        /*
        function getBest() : Node {
            // Return Node in todo-list with minimum cost
            return todo.reduce((currMin : Node, v : Node) => {
                var vVal    = v.cost       + v.heuristic;
                var minVal  = currMin.cost + currMin.heuristic;
                return (vVal<=minVal)?v:currMin;
            }, new Node(null,null,null,Infinity));
        }
        */

        var compFunc : collections.ICompareFunction<Node> = function(a:Node, b: Node){
            return heuristic(a)-heuristic(b);
        };

        var frontier : Heap<Node> = new Heap<Node>(compFunc);



    //  var frontier : collections.PriorityQueue<Node> = new collections.PriorityQueue<Node>(compFunc);

        frontier.add(s);

        var done     : Node[]   = [];
        // Start node's cost from start node is 0
        s.cost = 0;
        s.previous = null;

        while (!frontier.isEmpty()) {
            var v = frontier.removeRoot();

            // Possibly update neighbours of node we're visiting now
            for (var eKey in v.neighbours) {
                var edge : Edge = v.neighbours[eKey]
                 ,  n    : Node = edge.end;

                // Add to frontier if not already visited
                if (done.indexOf(n) === -1)
                    frontier.add(n);

                // Update if path through v is better
                var newCost = edge.cost + v.cost;
                if (newCost<=n.cost) {
                    n.cost     = newCost;
                    n.previous = v;
                    frontier.update(); //Since we update a node the heap may be different
                }
            }

            // When we remove t from the frontier, we're done
            if (v === t) {
                frontier.clear();
                console.log("done!"+!frontier.isEmpty());
            } else {
                done.push(v);
            }

        }

        // Retrieve path
        var path = [];
        var v = t;
        while (v !== s) {
            path.unshift(v);
            if (!v.previous) {
                console.log(v);
            }
            v = v.previous;
        }
        path.unshift(s);

        return path;
    }

    /**
     * This class is copied from collections. We only did this to be able to provide the
     * update function!
     */
    export class Heap<T> {
        /**
         * Array used to store the elements od the heap.
         * @type {Array.<Object>}
         * @private
         */
        private data: T[] = [];
        /**
         * Function used to compare elements.
         * @type {function(Object,Object):number}
         * @private
         */
        private compare: collections.ICompareFunction<T>;
        /**
         * Creates an empty Heap.
         * @class
         * <p>A heap is a binary tree, where the nodes maintain the heap property:
         * each node is smaller than each of its children and therefore a MinHeap
         * This implementation uses an array to store elements.</p>
         * <p>If the inserted elements are custom objects a compare function must be provided,
         *  at construction time, otherwise the <=, === and >= operators are
         * used to compare elements. Example:</p>
         *
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * <p>If a Max-Heap is wanted (greater elements on top) you can a provide a
         * reverse compare function to accomplish that behavior. Example:</p>
         *
         * <pre>
         * function reverseCompare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return 1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return -1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two elements. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        constructor(compareFunction?: collections.ICompareFunction<T>) {
            this.compare = compareFunction || collections.defaultCompare;
        }

        /**
         * Returns the index of the left child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the left child
         * for.
         * @return {number} The index of the left child.
         * @private
         */
        private leftChildIndex(nodeIndex: number): number {
            return (2 * nodeIndex) + 1;
        }
        /**
         * Returns the index of the right child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the right child
         * for.
         * @return {number} The index of the right child.
         * @private
         */
        private rightChildIndex(nodeIndex: number): number {
            return (2 * nodeIndex) + 2;
        }
        /**
         * Returns the index of the parent of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the parent for.
         * @return {number} The index of the parent.
         * @private
         */
        private parentIndex(nodeIndex: number): number {
            return Math.floor((nodeIndex - 1) / 2);
        }
        /**
         * Returns the index of the smaller child node (if it exists).
         * @param {number} leftChild left child index.
         * @param {number} rightChild right child index.
         * @return {number} the index with the minimum value or -1 if it doesn't
         * exists.
         * @private
         */
        private minIndex(leftChild: number, rightChild: number): number {

            if (rightChild >= this.data.length) {
                if (leftChild >= this.data.length) {
                    return -1;
                } else {
                    return leftChild;
                }
            } else {
                if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                    return leftChild;
                } else {
                    return rightChild;
                }
            }
        }
        /**
         * Moves the node at the given index up to its proper place in the heap.
         * @param {number} index The index of the node to move up.
         * @private
         */
        private siftUp(index: number): void {

            var parent = this.parentIndex(index);
            while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
                collections.arrays.swap(this.data, parent, index);
                index = parent;
                parent = this.parentIndex(index);
            }
        }
        /**
         * Moves the node at the given index down to its proper place in the heap.
         * @param {number} nodeIndex The index of the node to move down.
         * @private
         */
        private siftDown(nodeIndex: number): void {

            //smaller child index
            var min = this.minIndex(this.leftChildIndex(nodeIndex),
                this.rightChildIndex(nodeIndex));

            while (min >= 0 && this.compare(this.data[nodeIndex],
                this.data[min]) > 0) {
                collections.arrays.swap(this.data, min, nodeIndex);
                nodeIndex = min;
                min = this.minIndex(this.leftChildIndex(nodeIndex),
                    this.rightChildIndex(nodeIndex));
            }
        }

        update(): void {
            for(var i = this.data.length-1; i>=0; i--) {
                this.siftUp(i);
            }
        }
        /**
         * Retrieves but does not remove the root element of this heap.
         * @return {*} The value at the root of the heap. Returns undefined if the
         * heap is empty.
         */
        peek(): T {

            if (this.data.length > 0) {
                return this.data[0];
            } else {
                return undefined;
            }
        }
        /**
         * Adds the given element into the heap.
         * @param {*} element the element.
         * @return true if the element was added or fals if it is undefined.
         */
        add(element: T): boolean {
            if (collections.isUndefined(element)) {
                return undefined;
            }
            this.data.push(element);
            this.siftUp(this.data.length - 1);
            return true;
        }

        /**
         * Retrieves and removes the root element of this heap.
         * @return {*} The value removed from the root of the heap. Returns
         * undefined if the heap is empty.
         */
        removeRoot(): T {

            if (this.data.length > 0) {
                var obj = this.data[0];
                this.data[0] = this.data[this.data.length - 1];
                this.data.splice(this.data.length - 1, 1);
                if (this.data.length > 0) {
                    this.siftDown(0);
                }
                return obj;
            }
            return undefined;
        }
        /**
         * Returns true if this heap contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this Heap contains the specified element, false
         * otherwise.
         */
        contains(element: T): boolean {
            var equF = collections.compareToEquals(this.compare);
            return collections.arrays.contains(this.data, element, equF);
        }
        /**
         * Returns the number of elements in this heap.
         * @return {number} the number of elements in this heap.
         */
        size(): number {
            return this.data.length;
        }
        /**
         * Checks if this heap is empty.
         * @return {boolean} true if and only if this heap contains no items; false
         * otherwise.
         */
        isEmpty(): boolean {
            return this.data.length <= 0;
        }
        /**
         * Removes all of the elements from this heap.
         */
        clear(): void {
            this.data.length = 0;
        }

        /**
         * Executes the provided function once for each element present in this heap in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        forEach(callback: (item: T) => boolean) {
            collections.arrays.forEach(this.data, callback);
        }
    }
}
