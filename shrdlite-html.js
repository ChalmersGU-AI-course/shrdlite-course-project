// Interface definitions for worlds
///<reference path="World.ts"/>
///<reference path="lib/node.d.ts"/>
var Parser;
(function (Parser) {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    function parse(input) {
        var nearleyParser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
        var parsestr = input.toLowerCase().replace(/\W/g, "");
        try {
            var results = nearleyParser.feed(parsestr).results;
        }
        catch (err) {
            if ('offset' in err) {
                throw new Parser.Error('Parsing failed after ' + err.offset + ' characters', err.offset);
            }
            else {
                throw err;
            }
        }
        if (!results.length) {
            throw new Parser.Error('Incomplete input', parsestr.length);
        }
        return results.map(function (c) {
            return { input: input, prs: clone(c) };
        });
    }
    Parser.parse = parse;
    function parseToString(res) {
        return JSON.stringify(res.prs);
    }
    Parser.parseToString = parseToString;
    var Error = (function () {
        function Error(message, offset) {
            this.message = message;
            this.offset = offset;
            this.name = "Parser.Error";
        }
        Error.prototype.toString = function () { return this.name + ": " + this.message; };
        return Error;
    })();
    Parser.Error = Error;
    //////////////////////////////////////////////////////////////////////
    // Utilities
    function clone(obj) {
        if (obj != null && typeof obj == "object") {
            var result = obj.constructor();
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = clone(obj[key]);
                }
            }
            return result;
        }
        else {
            return obj;
        }
    }
})(Parser || (Parser = {}));
if (typeof require !== 'undefined') {
    // Node.JS way of importing external modules
    // In a browser, they must be included from the HTML file
    var nearley = require('./lib/nearley.js');
    var grammar = require('./grammar.js');
}
// Copyright 2013 Basarat Ali Syed. All Rights Reserved.
//
// Licensed under MIT open source license http://opensource.org/licenses/MIT
//
// Orginal javascript code was by Mauricio Santos
/**
 * @namespace Top level namespace for collections, a TypeScript data structure library.
 */
var collections;
(function (collections) {
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var has = function (obj, prop) {
        return _hasOwnProperty.call(obj, prop);
    };
    /**
     * Default function to compare element order.
     * @function
     */
    function defaultCompare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a === b) {
            return 0;
        }
        else {
            return 1;
        }
    }
    collections.defaultCompare = defaultCompare;
    /**
     * Default function to test equality.
     * @function
     */
    function defaultEquals(a, b) {
        return a === b;
    }
    collections.defaultEquals = defaultEquals;
    /**
     * Default function to convert an object to a string.
     * @function
     */
    function defaultToString(item) {
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return '$s' + item;
        }
        else {
            return '$o' + item.toString();
        }
    }
    collections.defaultToString = defaultToString;
    /**
    * Joins all the properies of the object using the provided join string
    */
    function makeString(item, join) {
        if (join === void 0) { join = ","; }
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return item.toString();
        }
        else {
            var toret = "{";
            var first = true;
            for (var prop in item) {
                if (has(item, prop)) {
                    if (first)
                        first = false;
                    else
                        toret = toret + join;
                    toret = toret + prop + ":" + item[prop];
                }
            }
            return toret + "}";
        }
    }
    collections.makeString = makeString;
    /**
     * Checks if the given argument is a function.
     * @function
     */
    function isFunction(func) {
        return (typeof func) === 'function';
    }
    collections.isFunction = isFunction;
    /**
     * Checks if the given argument is undefined.
     * @function
     */
    function isUndefined(obj) {
        return (typeof obj) === 'undefined';
    }
    collections.isUndefined = isUndefined;
    /**
     * Checks if the given argument is a string.
     * @function
     */
    function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    }
    collections.isString = isString;
    /**
     * Reverses a compare function.
     * @function
     */
    function reverseCompareFunction(compareFunction) {
        if (!collections.isFunction(compareFunction)) {
            return function (a, b) {
                if (a < b) {
                    return 1;
                }
                else if (a === b) {
                    return 0;
                }
                else {
                    return -1;
                }
            };
        }
        else {
            return function (d, v) {
                return compareFunction(d, v) * -1;
            };
        }
    }
    collections.reverseCompareFunction = reverseCompareFunction;
    /**
     * Returns an equal function given a compare function.
     * @function
     */
    function compareToEquals(compareFunction) {
        return function (a, b) {
            return compareFunction(a, b) === 0;
        };
    }
    collections.compareToEquals = compareToEquals;
    /**
     * @namespace Contains various functions for manipulating arrays.
     */
    var arrays;
    (function (arrays) {
        /**
         * Returns the position of the first occurrence of the specified item
         * within the specified array.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the first occurrence of the specified element
         * within the specified array, or -1 if not found.
         */
        function indexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.indexOf = indexOf;
        /**
         * Returns the position of the last occurrence of the specified element
         * within the specified array.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the last occurrence of the specified element
         * within the specified array or -1 if not found.
         */
        function lastIndexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = length - 1; i >= 0; i--) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.lastIndexOf = lastIndexOf;
        /**
         * Returns true if the specified array contains the specified element.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the specified array contains the specified element.
         */
        function contains(array, item, equalsFunction) {
            return arrays.indexOf(array, item, equalsFunction) >= 0;
        }
        arrays.contains = contains;
        /**
         * Removes the first ocurrence of the specified element from the specified array.
         * @param {*} array the array in which to search element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the array changed after this call.
         */
        function remove(array, item, equalsFunction) {
            var index = arrays.indexOf(array, item, equalsFunction);
            if (index < 0) {
                return false;
            }
            array.splice(index, 1);
            return true;
        }
        arrays.remove = remove;
        /**
         * Returns the number of elements in the specified array equal
         * to the specified object.
         * @param {Array} array the array in which to determine the frequency of the element.
         * @param {Object} item the element whose frequency is to be determined.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the number of elements in the specified array
         * equal to the specified object.
         */
        function frequency(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            var freq = 0;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    freq++;
                }
            }
            return freq;
        }
        arrays.frequency = frequency;
        /**
         * Returns true if the two specified arrays are equal to one another.
         * Two arrays are considered equal if both arrays contain the same number
         * of elements, and all corresponding pairs of elements in the two
         * arrays are equal and are in the same order.
         * @param {Array} array1 one array to be tested for equality.
         * @param {Array} array2 the other array to be tested for equality.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between elemements in the arrays.
         * @return {boolean} true if the two arrays are equal
         */
        function equals(array1, array2, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            if (array1.length !== array2.length) {
                return false;
            }
            var length = array1.length;
            for (var i = 0; i < length; i++) {
                if (!equals(array1[i], array2[i])) {
                    return false;
                }
            }
            return true;
        }
        arrays.equals = equals;
        /**
         * Returns shallow a copy of the specified array.
         * @param {*} array the array to copy.
         * @return {Array} a copy of the specified array
         */
        function copy(array) {
            return array.concat();
        }
        arrays.copy = copy;
        /**
         * Swaps the elements at the specified positions in the specified array.
         * @param {Array} array The array in which to swap elements.
         * @param {number} i the index of one element to be swapped.
         * @param {number} j the index of the other element to be swapped.
         * @return {boolean} true if the array is defined and the indexes are valid.
         */
        function swap(array, i, j) {
            if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
                return false;
            }
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            return true;
        }
        arrays.swap = swap;
        function toString(array) {
            return '[' + array.toString() + ']';
        }
        arrays.toString = toString;
        /**
         * Executes the provided function once for each element present in this array
         * starting from index 0 to length - 1.
         * @param {Array} array The array in which to iterate.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        function forEach(array, callback) {
            var lenght = array.length;
            for (var i = 0; i < lenght; i++) {
                if (callback(array[i]) === false) {
                    return;
                }
            }
        }
        arrays.forEach = forEach;
    })(arrays = collections.arrays || (collections.arrays = {}));
    var LinkedList = (function () {
        /**
        * Creates an empty Linked List.
        * @class A linked list is a data structure consisting of a group of nodes
        * which together represent a sequence.
        * @constructor
        */
        function LinkedList() {
            /**
            * First node in the list
            * @type {Object}
            * @private
            */
            this.firstNode = null;
            /**
            * Last node in the list
            * @type {Object}
            * @private
            */
            this.lastNode = null;
            /**
            * Number of elements in the list
            * @type {number}
            * @private
            */
            this.nElements = 0;
        }
        /**
        * Adds an element to this list.
        * @param {Object} item element to be added.
        * @param {number=} index optional index to add the element. If no index is specified
        * the element is added to the end of this list.
        * @return {boolean} true if the element was added or false if the index is invalid
        * or if the element is undefined.
        */
        LinkedList.prototype.add = function (item, index) {
            if (collections.isUndefined(index)) {
                index = this.nElements;
            }
            if (index < 0 || index > this.nElements || collections.isUndefined(item)) {
                return false;
            }
            var newNode = this.createNode(item);
            if (this.nElements === 0) {
                // First node in the list.
                this.firstNode = newNode;
                this.lastNode = newNode;
            }
            else if (index === this.nElements) {
                // Insert at the end.
                this.lastNode.next = newNode;
                this.lastNode = newNode;
            }
            else if (index === 0) {
                // Change first node.
                newNode.next = this.firstNode;
                this.firstNode = newNode;
            }
            else {
                var prev = this.nodeAtIndex(index - 1);
                newNode.next = prev.next;
                prev.next = newNode;
            }
            this.nElements++;
            return true;
        };
        /**
        * Returns the first element in this list.
        * @return {*} the first element of the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.first = function () {
            if (this.firstNode !== null) {
                return this.firstNode.element;
            }
            return undefined;
        };
        /**
        * Returns the last element in this list.
        * @return {*} the last element in the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.last = function () {
            if (this.lastNode !== null) {
                return this.lastNode.element;
            }
            return undefined;
        };
        /**
         * Returns the element at the specified position in this list.
         * @param {number} index desired index.
         * @return {*} the element at the given index or undefined if the index is
         * out of bounds.
         */
        LinkedList.prototype.elementAtIndex = function (index) {
            var node = this.nodeAtIndex(index);
            if (node === null) {
                return undefined;
            }
            return node.element;
        };
        /**
         * Returns the index in this list of the first occurrence of the
         * specified element, or -1 if the List does not contain this element.
         * <p>If the elements inside this list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction Optional
         * function used to check if two elements are equal.
         * @return {number} the index in this list of the first occurrence
         * of the specified element, or -1 if this list does not contain the
         * element.
         */
        LinkedList.prototype.indexOf = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (collections.isUndefined(item)) {
                return -1;
            }
            var currentNode = this.firstNode;
            var index = 0;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    return index;
                }
                index++;
                currentNode = currentNode.next;
            }
            return -1;
        };
        /**
           * Returns true if this list contains the specified element.
           * <p>If the elements inside the list are
           * not comparable with the === operator a custom equals function should be
           * provided to perform searches, the function must receive two arguments and
           * return true if they are equal, false otherwise. Example:</p>
           *
           * <pre>
           * var petsAreEqualByName = function(pet1, pet2) {
           *  return pet1.name === pet2.name;
           * }
           * </pre>
           * @param {Object} item element to search for.
           * @param {function(Object,Object):boolean=} equalsFunction Optional
           * function used to check if two elements are equal.
           * @return {boolean} true if this list contains the specified element, false
           * otherwise.
           */
        LinkedList.prototype.contains = function (item, equalsFunction) {
            return (this.indexOf(item, equalsFunction) >= 0);
        };
        /**
         * Removes the first occurrence of the specified element in this list.
         * <p>If the elements inside the list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item element to be removed from this list, if present.
         * @return {boolean} true if the list contained the specified element.
         */
        LinkedList.prototype.remove = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (this.nElements < 1 || collections.isUndefined(item)) {
                return false;
            }
            var previous = null;
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    if (currentNode === this.firstNode) {
                        this.firstNode = this.firstNode.next;
                        if (currentNode === this.lastNode) {
                            this.lastNode = null;
                        }
                    }
                    else if (currentNode === this.lastNode) {
                        this.lastNode = previous;
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    else {
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    this.nElements--;
                    return true;
                }
                previous = currentNode;
                currentNode = currentNode.next;
            }
            return false;
        };
        /**
         * Removes all of the elements from this list.
         */
        LinkedList.prototype.clear = function () {
            this.firstNode = null;
            this.lastNode = null;
            this.nElements = 0;
        };
        /**
         * Returns true if this list is equal to the given list.
         * Two lists are equal if they have the same elements in the same order.
         * @param {LinkedList} other the other list.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function used to check if two elements are equal. If the elements in the lists
         * are custom objects you should provide a function, otherwise
         * the === operator is used to check equality between elements.
         * @return {boolean} true if this list is equal to the given list.
         */
        LinkedList.prototype.equals = function (other, equalsFunction) {
            var eqF = equalsFunction || collections.defaultEquals;
            if (!(other instanceof collections.LinkedList)) {
                return false;
            }
            if (this.size() !== other.size()) {
                return false;
            }
            return this.equalsAux(this.firstNode, other.firstNode, eqF);
        };
        /**
        * @private
        */
        LinkedList.prototype.equalsAux = function (n1, n2, eqF) {
            while (n1 !== null) {
                if (!eqF(n1.element, n2.element)) {
                    return false;
                }
                n1 = n1.next;
                n2 = n2.next;
            }
            return true;
        };
        /**
         * Removes the element at the specified position in this list.
         * @param {number} index given index.
         * @return {*} removed element or undefined if the index is out of bounds.
         */
        LinkedList.prototype.removeElementAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return undefined;
            }
            var element;
            if (this.nElements === 1) {
                //First node in the list.
                element = this.firstNode.element;
                this.firstNode = null;
                this.lastNode = null;
            }
            else {
                var previous = this.nodeAtIndex(index - 1);
                if (previous === null) {
                    element = this.firstNode.element;
                    this.firstNode = this.firstNode.next;
                }
                else if (previous.next === this.lastNode) {
                    element = this.lastNode.element;
                    this.lastNode = previous;
                }
                if (previous !== null) {
                    element = previous.next.element;
                    previous.next = previous.next.next;
                }
            }
            this.nElements--;
            return element;
        };
        /**
         * Executes the provided function once for each element present in this list in order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        LinkedList.prototype.forEach = function (callback) {
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (callback(currentNode.element) === false) {
                    break;
                }
                currentNode = currentNode.next;
            }
        };
        /**
         * Reverses the order of the elements in this linked list (makes the last
         * element first, and the first element last).
         */
        LinkedList.prototype.reverse = function () {
            var previous = null;
            var current = this.firstNode;
            var temp = null;
            while (current !== null) {
                temp = current.next;
                current.next = previous;
                previous = current;
                current = temp;
            }
            temp = this.firstNode;
            this.firstNode = this.lastNode;
            this.lastNode = temp;
        };
        /**
         * Returns an array containing all of the elements in this list in proper
         * sequence.
         * @return {Array.<*>} an array containing all of the elements in this list,
         * in proper sequence.
         */
        LinkedList.prototype.toArray = function () {
            var array = [];
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                array.push(currentNode.element);
                currentNode = currentNode.next;
            }
            return array;
        };
        /**
         * Returns the number of elements in this list.
         * @return {number} the number of elements in this list.
         */
        LinkedList.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this list contains no elements.
         * @return {boolean} true if this list contains no elements.
         */
        LinkedList.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        LinkedList.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        /**
         * @private
         */
        LinkedList.prototype.nodeAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return null;
            }
            if (index === (this.nElements - 1)) {
                return this.lastNode;
            }
            var node = this.firstNode;
            for (var i = 0; i < index; i++) {
                node = node.next;
            }
            return node;
        };
        /**
         * @private
         */
        LinkedList.prototype.createNode = function (item) {
            return {
                element: item,
                next: null
            };
        };
        return LinkedList;
    })();
    collections.LinkedList = LinkedList; // End of linked list 
    var Dictionary = (function () {
        /**
         * Creates an empty dictionary.
         * @class <p>Dictionaries map keys to values; each key can map to at most one value.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to unique
         * strings must be provided. Example:</p>
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         */
        function Dictionary(toStrFunction) {
            this.table = {};
            this.nElements = 0;
            this.toStr = toStrFunction || collections.defaultToString;
        }
        /**
         * Returns the value to which this dictionary maps the specified key.
         * Returns undefined if this dictionary contains no mapping for this key.
         * @param {Object} key key whose associated value is to be returned.
         * @return {*} the value to which this dictionary maps the specified key or
         * undefined if the map contains no mapping for this key.
         */
        Dictionary.prototype.getValue = function (key) {
            var pair = this.table['$' + this.toStr(key)];
            if (collections.isUndefined(pair)) {
                return undefined;
            }
            return pair.value;
        };
        /**
         * Associates the specified value with the specified key in this dictionary.
         * If the dictionary previously contained a mapping for this key, the old
         * value is replaced by the specified value.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value value to be associated with the specified key.
         * @return {*} previous value associated with the specified key, or undefined if
         * there was no mapping for the key or if the key/value are undefined.
         */
        Dictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return undefined;
            }
            var ret;
            var k = '$' + this.toStr(key);
            var previousElement = this.table[k];
            if (collections.isUndefined(previousElement)) {
                this.nElements++;
                ret = undefined;
            }
            else {
                ret = previousElement.value;
            }
            this.table[k] = {
                key: key,
                value: value
            };
            return ret;
        };
        /**
         * Removes the mapping for this key from this dictionary if it is present.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @return {*} previous value associated with specified key, or undefined if
         * there was no mapping for key.
         */
        Dictionary.prototype.remove = function (key) {
            var k = '$' + this.toStr(key);
            var previousElement = this.table[k];
            if (!collections.isUndefined(previousElement)) {
                delete this.table[k];
                this.nElements--;
                return previousElement.value;
            }
            return undefined;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        Dictionary.prototype.keys = function () {
            var array = [];
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    array.push(pair.key);
                }
            }
            return array;
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        Dictionary.prototype.values = function () {
            var array = [];
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    array.push(pair.value);
                }
            }
            return array;
        };
        /**
        * Executes the provided function once for each key-value pair
        * present in this dictionary.
        * @param {function(Object,Object):*} callback function to execute, it is
        * invoked with two arguments: key and value. To break the iteration you can
        * optionally return false.
        */
        Dictionary.prototype.forEach = function (callback) {
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    var ret = callback(pair.key, pair.value);
                    if (ret === false) {
                        return;
                    }
                }
            }
        };
        /**
         * Returns true if this dictionary contains a mapping for the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary contains a mapping for the
         * specified key.
         */
        Dictionary.prototype.containsKey = function (key) {
            return !collections.isUndefined(this.getValue(key));
        };
        /**
        * Removes all mappings from this dictionary.
        * @this {collections.Dictionary}
        */
        Dictionary.prototype.clear = function () {
            this.table = {};
            this.nElements = 0;
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        Dictionary.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        Dictionary.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        Dictionary.prototype.toString = function () {
            var toret = "{";
            this.forEach(function (k, v) {
                toret = toret + "\n\t" + k.toString() + " : " + v.toString();
            });
            return toret + "\n}";
        };
        return Dictionary;
    })();
    collections.Dictionary = Dictionary; // End of dictionary
    // /**
    //  * Returns true if this dictionary is equal to the given dictionary.
    //  * Two dictionaries are equal if they contain the same mappings.
    //  * @param {collections.Dictionary} other the other dictionary.
    //  * @param {function(Object,Object):boolean=} valuesEqualFunction optional
    //  * function used to check if two values are equal.
    //  * @return {boolean} true if this dictionary is equal to the given dictionary.
    //  */
    // collections.Dictionary.prototype.equals = function(other,valuesEqualFunction) {
    // 	var eqF = valuesEqualFunction || collections.defaultEquals;
    // 	if(!(other instanceof collections.Dictionary)){
    // 		return false;
    // 	}
    // 	if(this.size() !== other.size()){
    // 		return false;
    // 	}
    // 	return this.equalsAux(this.firstNode,other.firstNode,eqF);
    // }
    var MultiDictionary = (function () {
        /**
         * Creates an empty multi dictionary.
         * @class <p>A multi dictionary is a special kind of dictionary that holds
         * multiple values against each key. Setting a value into the dictionary will
         * add the value to an array at that key. Getting a key will return an array,
         * holding all the values set to that key.
         * You can configure to allow duplicates in the values.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to strings must be
         * provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
           *  return pet.name;
           * }
         * </pre>
         * <p>If the values are custom objects a function to check equality between values
         * must be provided. Example:</p>
         *
         * <pre>
         * function petsAreEqualByAge(pet1,pet2) {
           *  return pet1.age===pet2.age;
           * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         * @param {function(Object,Object):boolean=} valuesEqualsFunction optional
         * function to check if two values are equal.
         *
         * @param allowDuplicateValues
         */
        function MultiDictionary(toStrFunction, valuesEqualsFunction, allowDuplicateValues) {
            if (allowDuplicateValues === void 0) { allowDuplicateValues = false; }
            this.dict = new Dictionary(toStrFunction);
            this.equalsF = valuesEqualsFunction || collections.defaultEquals;
            this.allowDuplicate = allowDuplicateValues;
        }
        /**
        * Returns an array holding the values to which this dictionary maps
        * the specified key.
        * Returns an empty array if this dictionary contains no mappings for this key.
        * @param {Object} key key whose associated values are to be returned.
        * @return {Array} an array holding the values to which this dictionary maps
        * the specified key.
        */
        MultiDictionary.prototype.getValue = function (key) {
            var values = this.dict.getValue(key);
            if (collections.isUndefined(values)) {
                return [];
            }
            return collections.arrays.copy(values);
        };
        /**
         * Adds the value to the array associated with the specified key, if
         * it is not already present.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value the value to add to the array at the key
         * @return {boolean} true if the value was not already associated with that key.
         */
        MultiDictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return false;
            }
            if (!this.containsKey(key)) {
                this.dict.setValue(key, [value]);
                return true;
            }
            var array = this.dict.getValue(key);
            if (!this.allowDuplicate) {
                if (collections.arrays.contains(array, value, this.equalsF)) {
                    return false;
                }
            }
            array.push(value);
            return true;
        };
        /**
         * Removes the specified values from the array of values associated with the
         * specified key. If a value isn't given, all values associated with the specified
         * key are removed.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @param {Object=} value optional argument to specify the value to remove
         * from the array associated with the specified key.
         * @return {*} true if the dictionary changed, false if the key doesn't exist or
         * if the specified value isn't associated with the specified key.
         */
        MultiDictionary.prototype.remove = function (key, value) {
            if (collections.isUndefined(value)) {
                var v = this.dict.remove(key);
                return !collections.isUndefined(v);
            }
            var array = this.dict.getValue(key);
            if (collections.arrays.remove(array, value, this.equalsF)) {
                if (array.length === 0) {
                    this.dict.remove(key);
                }
                return true;
            }
            return false;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        MultiDictionary.prototype.keys = function () {
            return this.dict.keys();
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        MultiDictionary.prototype.values = function () {
            var values = this.dict.values();
            var array = [];
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                for (var j = 0; j < v.length; j++) {
                    array.push(v[j]);
                }
            }
            return array;
        };
        /**
         * Returns true if this dictionary at least one value associatted the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary at least one value associatted
         * the specified key.
         */
        MultiDictionary.prototype.containsKey = function (key) {
            return this.dict.containsKey(key);
        };
        /**
         * Removes all mappings from this dictionary.
         */
        MultiDictionary.prototype.clear = function () {
            this.dict.clear();
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        MultiDictionary.prototype.size = function () {
            return this.dict.size();
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        MultiDictionary.prototype.isEmpty = function () {
            return this.dict.isEmpty();
        };
        return MultiDictionary;
    })();
    collections.MultiDictionary = MultiDictionary; // end of multi dictionary 
    var Heap = (function () {
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
        function Heap(compareFunction) {
            /**
             * Array used to store the elements od the heap.
             * @type {Array.<Object>}
             * @private
             */
            this.data = [];
            this.compare = compareFunction || collections.defaultCompare;
        }
        /**
         * Returns the index of the left child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the left child
         * for.
         * @return {number} The index of the left child.
         * @private
         */
        Heap.prototype.leftChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 1;
        };
        /**
         * Returns the index of the right child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the right child
         * for.
         * @return {number} The index of the right child.
         * @private
         */
        Heap.prototype.rightChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 2;
        };
        /**
         * Returns the index of the parent of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the parent for.
         * @return {number} The index of the parent.
         * @private
         */
        Heap.prototype.parentIndex = function (nodeIndex) {
            return Math.floor((nodeIndex - 1) / 2);
        };
        /**
         * Returns the index of the smaller child node (if it exists).
         * @param {number} leftChild left child index.
         * @param {number} rightChild right child index.
         * @return {number} the index with the minimum value or -1 if it doesn't
         * exists.
         * @private
         */
        Heap.prototype.minIndex = function (leftChild, rightChild) {
            if (rightChild >= this.data.length) {
                if (leftChild >= this.data.length) {
                    return -1;
                }
                else {
                    return leftChild;
                }
            }
            else {
                if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                    return leftChild;
                }
                else {
                    return rightChild;
                }
            }
        };
        /**
         * Moves the node at the given index up to its proper place in the heap.
         * @param {number} index The index of the node to move up.
         * @private
         */
        Heap.prototype.siftUp = function (index) {
            var parent = this.parentIndex(index);
            while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
                collections.arrays.swap(this.data, parent, index);
                index = parent;
                parent = this.parentIndex(index);
            }
        };
        /**
         * Moves the node at the given index down to its proper place in the heap.
         * @param {number} nodeIndex The index of the node to move down.
         * @private
         */
        Heap.prototype.siftDown = function (nodeIndex) {
            //smaller child index
            var min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            while (min >= 0 && this.compare(this.data[nodeIndex], this.data[min]) > 0) {
                collections.arrays.swap(this.data, min, nodeIndex);
                nodeIndex = min;
                min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            }
        };
        /**
         * Retrieves but does not remove the root element of this heap.
         * @return {*} The value at the root of the heap. Returns undefined if the
         * heap is empty.
         */
        Heap.prototype.peek = function () {
            if (this.data.length > 0) {
                return this.data[0];
            }
            else {
                return undefined;
            }
        };
        /**
         * Adds the given element into the heap.
         * @param {*} element the element.
         * @return true if the element was added or fals if it is undefined.
         */
        Heap.prototype.add = function (element) {
            if (collections.isUndefined(element)) {
                return undefined;
            }
            this.data.push(element);
            this.siftUp(this.data.length - 1);
            return true;
        };
        /**
         * Retrieves and removes the root element of this heap.
         * @return {*} The value removed from the root of the heap. Returns
         * undefined if the heap is empty.
         */
        Heap.prototype.removeRoot = function () {
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
        };
        /**
         * Returns true if this heap contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this Heap contains the specified element, false
         * otherwise.
         */
        Heap.prototype.contains = function (element) {
            var equF = collections.compareToEquals(this.compare);
            return collections.arrays.contains(this.data, element, equF);
        };
        /**
         * Returns the number of elements in this heap.
         * @return {number} the number of elements in this heap.
         */
        Heap.prototype.size = function () {
            return this.data.length;
        };
        /**
         * Checks if this heap is empty.
         * @return {boolean} true if and only if this heap contains no items; false
         * otherwise.
         */
        Heap.prototype.isEmpty = function () {
            return this.data.length <= 0;
        };
        /**
         * Removes all of the elements from this heap.
         */
        Heap.prototype.clear = function () {
            this.data.length = 0;
        };
        /**
         * Executes the provided function once for each element present in this heap in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Heap.prototype.forEach = function (callback) {
            collections.arrays.forEach(this.data, callback);
        };
        return Heap;
    })();
    collections.Heap = Heap;
    var Stack = (function () {
        /**
         * Creates an empty Stack.
         * @class A Stack is a Last-In-First-Out (LIFO) data structure, the last
         * element added to the stack will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Stack() {
            this.list = new LinkedList();
        }
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the element to be pushed onto this stack.
         * @return {boolean} true if the element was pushed or false if it is undefined.
         */
        Stack.prototype.push = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the element to be pushed onto this stack.
         * @return {boolean} true if the element was pushed or false if it is undefined.
         */
        Stack.prototype.add = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Removes the object at the top of this stack and returns that object.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.pop = function () {
            return this.list.removeElementAtIndex(0);
        };
        /**
         * Looks at the object at the top of this stack without removing it from the
         * stack.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.peek = function () {
            return this.list.first();
        };
        /**
         * Returns the number of elements in this stack.
         * @return {number} the number of elements in this stack.
         */
        Stack.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this stack contains the specified element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this stack contains the specified element,
         * false otherwise.
         */
        Stack.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this stack is empty.
         * @return {boolean} true if and only if this stack contains no items; false
         * otherwise.
         */
        Stack.prototype.isEmpty = function () {
            return this.list.isEmpty();
        };
        /**
         * Removes all of the elements from this stack.
         */
        Stack.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each element present in this stack in
         * LIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Stack.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Stack;
    })();
    collections.Stack = Stack; // End of stack 
    var Queue = (function () {
        /**
         * Creates an empty queue.
         * @class A queue is a First-In-First-Out (FIFO) data structure, the first
         * element added to the queue will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Queue() {
            this.list = new LinkedList();
        }
        /**
         * Inserts the specified element into the end of this queue.
         * @param {Object} elem the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        Queue.prototype.enqueue = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Inserts the specified element into the end of this queue.
         * @param {Object} elem the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        Queue.prototype.add = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Retrieves and removes the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.dequeue = function () {
            if (this.list.size() !== 0) {
                var el = this.list.first();
                this.list.removeElementAtIndex(0);
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.peek = function () {
            if (this.list.size() !== 0) {
                return this.list.first();
            }
            return undefined;
        };
        /**
         * Returns the number of elements in this queue.
         * @return {number} the number of elements in this queue.
         */
        Queue.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this queue contains the specified element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this queue contains the specified element,
         * false otherwise.
         */
        Queue.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this queue is empty.
         * @return {boolean} true if and only if this queue contains no items; false
         * otherwise.
         */
        Queue.prototype.isEmpty = function () {
            return this.list.size() <= 0;
        };
        /**
         * Removes all of the elements from this queue.
         */
        Queue.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each element present in this queue in
         * FIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Queue.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Queue;
    })();
    collections.Queue = Queue; // End of queue
    var PriorityQueue = (function () {
        /**
         * Creates an empty priority queue.
         * @class <p>In a priority queue each element is associated with a "priority",
         * elements are dequeued in highest-priority-first order (the elements with the
         * highest priority are dequeued first). Priority Queues are implemented as heaps.
         * If the inserted elements are custom objects a compare function must be provided,
         * otherwise the <=, === and >= operators are used to compare object priority.</p>
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
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two element priorities. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function PriorityQueue(compareFunction) {
            this.heap = new Heap(collections.reverseCompareFunction(compareFunction));
        }
        /**
         * Inserts the specified element into this priority queue.
         * @param {Object} element the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.enqueue = function (element) {
            return this.heap.add(element);
        };
        /**
         * Inserts the specified element into this priority queue.
         * @param {Object} element the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.add = function (element) {
            return this.heap.add(element);
        };
        /**
         * Retrieves and removes the highest priority element of this queue.
         * @return {*} the the highest priority element of this queue,
         *  or undefined if this queue is empty.
         */
        PriorityQueue.prototype.dequeue = function () {
            if (this.heap.size() !== 0) {
                var el = this.heap.peek();
                this.heap.removeRoot();
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the highest priority element of this queue.
         * @return {*} the highest priority element of this queue, or undefined if this queue is empty.
         */
        PriorityQueue.prototype.peek = function () {
            return this.heap.peek();
        };
        /**
         * Returns true if this priority queue contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this priority queue contains the specified element,
         * false otherwise.
         */
        PriorityQueue.prototype.contains = function (element) {
            return this.heap.contains(element);
        };
        /**
         * Checks if this priority queue is empty.
         * @return {boolean} true if and only if this priority queue contains no items; false
         * otherwise.
         */
        PriorityQueue.prototype.isEmpty = function () {
            return this.heap.isEmpty();
        };
        /**
         * Returns the number of elements in this priority queue.
         * @return {number} the number of elements in this priority queue.
         */
        PriorityQueue.prototype.size = function () {
            return this.heap.size();
        };
        /**
         * Removes all of the elements from this priority queue.
         */
        PriorityQueue.prototype.clear = function () {
            this.heap.clear();
        };
        /**
         * Executes the provided function once for each element present in this queue in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        PriorityQueue.prototype.forEach = function (callback) {
            this.heap.forEach(callback);
        };
        return PriorityQueue;
    })();
    collections.PriorityQueue = PriorityQueue; // end of priority queue
    var Set = (function () {
        /**
         * Creates an empty set.
         * @class <p>A set is a data structure that contains no duplicate items.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStringFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives a onject and returns a
         * unique string must be provided.
         */
        function Set(toStringFunction) {
            this.dictionary = new Dictionary(toStringFunction);
        }
        /**
         * Returns true if this set contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this set contains the specified element,
         * false otherwise.
         */
        Set.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
         * Adds the specified element to this set if it is not already present.
         * @param {Object} element the element to insert.
         * @return {boolean} true if this set did not already contain the specified element.
         */
        Set.prototype.add = function (element) {
            if (this.contains(element) || collections.isUndefined(element)) {
                return false;
            }
            else {
                this.dictionary.setValue(element, element);
                return true;
            }
        };
        /**
         * Performs an intersecion between this an another set.
         * Removes all values that are not present this set and the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.intersection = function (otherSet) {
            var set = this;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    set.remove(element);
                }
                return true;
            });
        };
        /**
         * Performs a union between this an another set.
         * Adds all values from the given set to this set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.union = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.add(element);
                return true;
            });
        };
        /**
         * Performs a difference between this an another set.
         * Removes from this set all the values that are present in the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.difference = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.remove(element);
                return true;
            });
        };
        /**
         * Checks whether the given set contains all the elements in this set.
         * @param {collections.Set} otherSet other set.
         * @return {boolean} true if this set is a subset of the given set.
         */
        Set.prototype.isSubsetOf = function (otherSet) {
            if (this.size() > otherSet.size()) {
                return false;
            }
            var isSub = true;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    isSub = false;
                    return false;
                }
                return true;
            });
            return isSub;
        };
        /**
         * Removes the specified element from this set if it is present.
         * @return {boolean} true if this set contained the specified element.
         */
        Set.prototype.remove = function (element) {
            if (!this.contains(element)) {
                return false;
            }
            else {
                this.dictionary.remove(element);
                return true;
            }
        };
        /**
         * Executes the provided function once for each element
         * present in this set.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one arguments: the element. To break the iteration you can
         * optionally return false.
         */
        Set.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                return callback(v);
            });
        };
        /**
         * Returns an array containing all of the elements in this set in arbitrary order.
         * @return {Array} an array containing all of the elements in this set.
         */
        Set.prototype.toArray = function () {
            return this.dictionary.values();
        };
        /**
         * Returns true if this set contains no elements.
         * @return {boolean} true if this set contains no elements.
         */
        Set.prototype.isEmpty = function () {
            return this.dictionary.isEmpty();
        };
        /**
         * Returns the number of elements in this set.
         * @return {number} the number of elements in this set.
         */
        Set.prototype.size = function () {
            return this.dictionary.size();
        };
        /**
         * Removes all of the elements from this set.
         */
        Set.prototype.clear = function () {
            this.dictionary.clear();
        };
        /*
        * Provides a string representation for display
        */
        Set.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        return Set;
    })();
    collections.Set = Set; // end of Set
    var Bag = (function () {
        /**
         * Creates an empty bag.
         * @class <p>A bag is a special kind of set in which members are
         * allowed to appear more than once.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to unique strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives an object and returns a
         * unique string must be provided.
         */
        function Bag(toStrFunction) {
            this.toStrF = toStrFunction || collections.defaultToString;
            this.dictionary = new Dictionary(this.toStrF);
            this.nElements = 0;
        }
        /**
        * Adds nCopies of the specified object to this bag.
        * @param {Object} element element to add.
        * @param {number=} nCopies the number of copies to add, if this argument is
        * undefined 1 copy is added.
        * @return {boolean} true unless element is undefined.
        */
        Bag.prototype.add = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                var node = {
                    value: element,
                    copies: nCopies
                };
                this.dictionary.setValue(element, node);
            }
            else {
                this.dictionary.getValue(element).copies += nCopies;
            }
            this.nElements += nCopies;
            return true;
        };
        /**
        * Counts the number of copies of the specified object in this bag.
        * @param {Object} element the object to search for..
        * @return {number} the number of copies of the object, 0 if not found
        */
        Bag.prototype.count = function (element) {
            if (!this.contains(element)) {
                return 0;
            }
            else {
                return this.dictionary.getValue(element).copies;
            }
        };
        /**
         * Returns true if this bag contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this bag contains the specified element,
         * false otherwise.
         */
        Bag.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
        * Removes nCopies of the specified object to this bag.
        * If the number of copies to remove is greater than the actual number
        * of copies in the Bag, all copies are removed.
        * @param {Object} element element to remove.
        * @param {number=} nCopies the number of copies to remove, if this argument is
        * undefined 1 copy is removed.
        * @return {boolean} true if at least 1 element was removed.
        */
        Bag.prototype.remove = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                return false;
            }
            else {
                var node = this.dictionary.getValue(element);
                if (nCopies > node.copies) {
                    this.nElements -= node.copies;
                }
                else {
                    this.nElements -= nCopies;
                }
                node.copies -= nCopies;
                if (node.copies <= 0) {
                    this.dictionary.remove(element);
                }
                return true;
            }
        };
        /**
         * Returns an array containing all of the elements in this big in arbitrary order,
         * including multiple copies.
         * @return {Array} an array containing all of the elements in this bag.
         */
        Bag.prototype.toArray = function () {
            var a = [];
            var values = this.dictionary.values();
            var vl = values.length;
            for (var i = 0; i < vl; i++) {
                var node = values[i];
                var element = node.value;
                var copies = node.copies;
                for (var j = 0; j < copies; j++) {
                    a.push(element);
                }
            }
            return a;
        };
        /**
         * Returns a set of unique elements in this bag.
         * @return {collections.Set<T>} a set of unique elements in this bag.
         */
        Bag.prototype.toSet = function () {
            var toret = new Set(this.toStrF);
            var elements = this.dictionary.values();
            var l = elements.length;
            for (var i = 0; i < l; i++) {
                var value = elements[i].value;
                toret.add(value);
            }
            return toret;
        };
        /**
         * Executes the provided function once for each element
         * present in this bag, including multiple copies.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element. To break the iteration you can
         * optionally return false.
         */
        Bag.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                var value = v.value;
                var copies = v.copies;
                for (var i = 0; i < copies; i++) {
                    if (callback(value) === false) {
                        return false;
                    }
                }
                return true;
            });
        };
        /**
         * Returns the number of elements in this bag.
         * @return {number} the number of elements in this bag.
         */
        Bag.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this bag contains no elements.
         * @return {boolean} true if this bag contains no elements.
         */
        Bag.prototype.isEmpty = function () {
            return this.nElements === 0;
        };
        /**
         * Removes all of the elements from this bag.
         */
        Bag.prototype.clear = function () {
            this.nElements = 0;
            this.dictionary.clear();
        };
        return Bag;
    })();
    collections.Bag = Bag; // End of bag 
    var BSTree = (function () {
        /**
         * Creates an empty binary search tree.
         * @class <p>A binary search tree is a binary tree in which each
         * internal node stores an element such that the elements stored in the
         * left subtree are less than it and the elements
         * stored in the right subtree are greater.</p>
         * <p>Formally, a binary search tree is a node-based binary tree data structure which
         * has the following properties:</p>
         * <ul>
         * <li>The left subtree of a node contains only nodes with elements less
         * than the node's element</li>
         * <li>The right subtree of a node contains only nodes with elements greater
         * than the node's element</li>
         * <li>Both the left and right subtrees must also be binary search trees.</li>
         * </ul>
         * <p>If the inserted elements are custom objects a compare function must
         * be provided at construction time, otherwise the <=, === and >= operators are
         * used to compare elements. Example:</p>
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
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two elements. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function BSTree(compareFunction) {
            this.root = null;
            this.compare = compareFunction || collections.defaultCompare;
            this.nElements = 0;
        }
        /**
         * Adds the specified element to this tree if it is not already present.
         * @param {Object} element the element to insert.
         * @return {boolean} true if this tree did not already contain the specified element.
         */
        BSTree.prototype.add = function (element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            if (this.insertNode(this.createNode(element)) !== null) {
                this.nElements++;
                return true;
            }
            return false;
        };
        /**
         * Removes all of the elements from this tree.
         */
        BSTree.prototype.clear = function () {
            this.root = null;
            this.nElements = 0;
        };
        /**
         * Returns true if this tree contains no elements.
         * @return {boolean} true if this tree contains no elements.
         */
        BSTree.prototype.isEmpty = function () {
            return this.nElements === 0;
        };
        /**
         * Returns the number of elements in this tree.
         * @return {number} the number of elements in this tree.
         */
        BSTree.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this tree contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this tree contains the specified element,
         * false otherwise.
         */
        BSTree.prototype.contains = function (element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            return this.searchNode(this.root, element) !== null;
        };
        /**
         * Removes the specified element from this tree if it is present.
         * @return {boolean} true if this tree contained the specified element.
         */
        BSTree.prototype.remove = function (element) {
            var node = this.searchNode(this.root, element);
            if (node === null) {
                return false;
            }
            this.removeNode(node);
            this.nElements--;
            return true;
        };
        /**
         * Executes the provided function once for each element present in this tree in
         * in-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.inorderTraversal = function (callback) {
            this.inorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in pre-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.preorderTraversal = function (callback) {
            this.preorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in post-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.postorderTraversal = function (callback) {
            this.postorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in
         * level-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.levelTraversal = function (callback) {
            this.levelTraversalAux(this.root, callback);
        };
        /**
         * Returns the minimum element of this tree.
         * @return {*} the minimum element of this tree or undefined if this tree is
         * is empty.
         */
        BSTree.prototype.minimum = function () {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.minimumAux(this.root).element;
        };
        /**
         * Returns the maximum element of this tree.
         * @return {*} the maximum element of this tree or undefined if this tree is
         * is empty.
         */
        BSTree.prototype.maximum = function () {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.maximumAux(this.root).element;
        };
        /**
         * Executes the provided function once for each element present in this tree in inorder.
         * Equivalent to inorderTraversal.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        BSTree.prototype.forEach = function (callback) {
            this.inorderTraversal(callback);
        };
        /**
         * Returns an array containing all of the elements in this tree in in-order.
         * @return {Array} an array containing all of the elements in this tree in in-order.
         */
        BSTree.prototype.toArray = function () {
            var array = [];
            this.inorderTraversal(function (element) {
                array.push(element);
                return true;
            });
            return array;
        };
        /**
         * Returns the height of this tree.
         * @return {number} the height of this tree or -1 if is empty.
         */
        BSTree.prototype.height = function () {
            return this.heightAux(this.root);
        };
        /**
        * @private
        */
        BSTree.prototype.searchNode = function (node, element) {
            var cmp = null;
            while (node !== null && cmp !== 0) {
                cmp = this.compare(element, node.element);
                if (cmp < 0) {
                    node = node.leftCh;
                }
                else if (cmp > 0) {
                    node = node.rightCh;
                }
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.transplant = function (n1, n2) {
            if (n1.parent === null) {
                this.root = n2;
            }
            else if (n1 === n1.parent.leftCh) {
                n1.parent.leftCh = n2;
            }
            else {
                n1.parent.rightCh = n2;
            }
            if (n2 !== null) {
                n2.parent = n1.parent;
            }
        };
        /**
        * @private
        */
        BSTree.prototype.removeNode = function (node) {
            if (node.leftCh === null) {
                this.transplant(node, node.rightCh);
            }
            else if (node.rightCh === null) {
                this.transplant(node, node.leftCh);
            }
            else {
                var y = this.minimumAux(node.rightCh);
                if (y.parent !== node) {
                    this.transplant(y, y.rightCh);
                    y.rightCh = node.rightCh;
                    y.rightCh.parent = y;
                }
                this.transplant(node, y);
                y.leftCh = node.leftCh;
                y.leftCh.parent = y;
            }
        };
        /**
        * @private
        */
        BSTree.prototype.inorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.rightCh, callback, signal);
        };
        /**
        * @private
        */
        BSTree.prototype.levelTraversalAux = function (node, callback) {
            var queue = new Queue();
            if (node !== null) {
                queue.enqueue(node);
            }
            while (!queue.isEmpty()) {
                node = queue.dequeue();
                if (callback(node.element) === false) {
                    return;
                }
                if (node.leftCh !== null) {
                    queue.enqueue(node.leftCh);
                }
                if (node.rightCh !== null) {
                    queue.enqueue(node.rightCh);
                }
            }
        };
        /**
        * @private
        */
        BSTree.prototype.preorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.rightCh, callback, signal);
        };
        /**
        * @private
        */
        BSTree.prototype.postorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.rightCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
        };
        /**
        * @private
        */
        BSTree.prototype.minimumAux = function (node) {
            while (node.leftCh !== null) {
                node = node.leftCh;
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.maximumAux = function (node) {
            while (node.rightCh !== null) {
                node = node.rightCh;
            }
            return node;
        };
        /**
          * @private
          */
        BSTree.prototype.heightAux = function (node) {
            if (node === null) {
                return -1;
            }
            return Math.max(this.heightAux(node.leftCh), this.heightAux(node.rightCh)) + 1;
        };
        /*
        * @private
        */
        BSTree.prototype.insertNode = function (node) {
            var parent = null;
            var position = this.root;
            var cmp = null;
            while (position !== null) {
                cmp = this.compare(node.element, position.element);
                if (cmp === 0) {
                    return null;
                }
                else if (cmp < 0) {
                    parent = position;
                    position = position.leftCh;
                }
                else {
                    parent = position;
                    position = position.rightCh;
                }
            }
            node.parent = parent;
            if (parent === null) {
                // tree is empty
                this.root = node;
            }
            else if (this.compare(node.element, parent.element) < 0) {
                parent.leftCh = node;
            }
            else {
                parent.rightCh = node;
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.createNode = function (element) {
            return {
                element: element,
                leftCh: null,
                rightCh: null,
                parent: null
            };
        };
        return BSTree;
    })();
    collections.BSTree = BSTree; // end of BSTree
})(collections || (collections = {})); // End of module 
///<reference path="World.ts"/>
var Rules;
(function (Rules) {
    /**
     * Checks the rules that relate to the floor
     */
    function breakFloorRules(o, obj, rel) {
        var bol = false;
        if (o.form == "floor" ||
            (obj.form == "floor" && !(rel == "ontop" || rel == "above"))) {
            bol = true;
        }
        return bol;
    }
    Rules.breakFloorRules = breakFloorRules;
    /**
     * Checks the rules that relate to boxes
     */
    function breakBoxRules(o, obj, rel) {
        var bol = false;
        if (obj.form == "box" && rel == "ontop") {
            bol = true;
        }
        else if (obj.form == "box" && rel == "inside" &&
            ((o.form == "pyramid" || o.form == "planck" || o.form == "box") && obj.size == o.size)) {
            bol = true;
        }
        else if (o.form == "box" && rel == "ontop" &&
            ((obj.size == "small" && obj.form == "brick") || (obj.form == "pyramid"))) {
            bol = true;
        }
        else if (rel == "inside" && obj.form != "box") {
            bol = true;
        }
        return bol;
    }
    Rules.breakBoxRules = breakBoxRules;
    /**
     * Checks the rules that relate to balls
     */
    function breakBallRules(o, obj, rel) {
        var bol = false;
        if (o.form == "ball" && obj.form == "ball") {
            if (!(rel == "beside" || rel == "rightof" || rel == "leftof")) {
                bol = true;
            }
        }
        else if (o.form == "ball") {
            if (rel == "under") {
                bol = true;
            }
            else if (!(rel == "leftof" || rel == "rightof" || rel == "beside" ||
                (rel == "inside" && obj.form == "box") ||
                (rel == "ontop" && obj.form == "floor"))) {
                bol = true;
            }
        }
        else if (obj.form == "ball") {
            if (rel == "ontop" || rel == "inside" || rel == "above") {
                bol = true;
            }
        }
        return bol;
    }
    Rules.breakBallRules = breakBallRules;
    /**
     * Checks the rules that relate to the size of objects
     */
    function breakSmallSupportingBig(o, obj, rel) {
        var bol = false;
        if ((rel == "ontop" || rel == "above" || rel == "inside") &&
            (o.size == "large" && obj.size == "small")) {
            bol = true;
        }
        else if (rel == "under" &&
            (obj.size == "large" && o.size == "small")) {
            bol = true;
        }
        return bol;
    }
    Rules.breakSmallSupportingBig = breakSmallSupportingBig;
    /**
     * Union of all rules
     */
    function breakRules(o, obj, rel) {
        return (Rules.breakFloorRules(o, obj, rel) ||
            Rules.breakSmallSupportingBig(o, obj, rel) ||
            Rules.breakBoxRules(o, obj, rel) ||
            Rules.breakBallRules(o, obj, rel));
    }
    Rules.breakRules = breakRules;
})(Rules || (Rules = {}));
var Helper;
(function (Helper) {
    /**
    * Returns objects in the world that are at in the stack number x and that have their y coordinates in [from, to[
    */
    function getObjsInStack(x, from, to, state, obj) {
        var owc = [];
        if (!(x < 0 || x >= state.stacks.length || from >= to || to <= -1 || to > state.stacks[x].length)) {
            for (var i = from; i < to; i++) {
                var pos = { x: x, y: i };
                var relObj = getObjAtCoord(pos, state);
                if (comparator(relObj, obj)) {
                    var o = { size: relObj.size, color: relObj.color, form: relObj.form, coord: pos, id: state.stacks[pos.x][pos.y] };
                    owc.push(o);
                }
            }
        }
        return owc;
    }
    Helper.getObjsInStack = getObjsInStack;
    /**
    * Compares if two objects matches
    */
    function comparator(relObj, obj) {
        var o = obj.obj == null ? obj : obj.obj;
        return ((relObj.size == o.size || o.size == null) &&
            (relObj.form == o.form || o.form == "anyform") &&
            (relObj.color == o.color || o.color == null));
    }
    Helper.comparator = comparator;
    /**
    * Finds out if an object is the floor
    */
    function isFloor(obj) {
        return obj.form == "floor";
    }
    Helper.isFloor = isFloor;
    /**
    * Removes duplicates in an array
    */
    function removeDuplicate(array) {
        var s;
        for (var i = 0; i < array.length; i++) {
            s = array[i].id;
            for (var j = i + 1; j < array.length; j++) {
                if (array[j].id == s) {
                    array.splice(j, 1);
                    j--;
                }
            }
        }
        return array;
    }
    Helper.removeDuplicate = removeDuplicate;
    /**
    * returns id of objects that correspond to the description
    */
    function findIDs(obj, state) {
        var objectIDs = [];
        if (state.holding != null && comparator(state.objects[state.holding], obj)) {
            objectIDs.push(state.holding);
        }
        for (var i = 0; i < state.stacks.length; i++) {
            for (var j = 0; j < state.stacks[i].length; j++) {
                var pos = { x: i, y: j };
                var o = getObjAtCoord(pos, state);
                if (comparator(o, obj)) {
                    objectIDs.push(state.stacks[i][j]);
                }
            }
        }
        return objectIDs;
    }
    Helper.findIDs = findIDs;
    /**
    * returns the coordinates of an object with such id
    */
    function findCoord(id, state) {
        for (var x = 0; x < state.stacks.length; x++) {
            for (var y = 0; y < state.stacks[x].length; y++) {
                if (state.stacks[x][y] == id) {
                    return { x: x, y: y };
                }
            }
        }
        throw new Error("No such id in stacks");
    }
    Helper.findCoord = findCoord;
    /**
    * returns the object that has those coordinates
    */
    function getObjAtCoord(pos, state) {
        if (pos.y == -1) {
            return { "size": null, "color": null, form: "floor" };
        }
        else if (pos.x >= state.stacks.length || pos.x < 0 || pos.y >= state.stacks[pos.x].length || pos.y < -1) {
            //Out of bounds
            throw new Error("getObjAtCoord out of bounds");
        }
        else {
            var id = state.stacks[pos.x][pos.y];
            return state.objects[id];
        }
    }
    Helper.getObjAtCoord = getObjAtCoord;
})(Helper || (Helper = {}));
///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="collections.ts"/>
///<reference path="Rules.ts"/>
///<reference path="Helper.ts"/>
var Interpreter;
(function (Interpreter) {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    function interpret(parses, currentState) {
        var interpretations = [];
        var hasAnInterpretation = [];
        var i = 0;
        parses.forEach(function (parseresult) {
            var intprt = parseresult;
            intprt.intp = interpretCommand(intprt.prs, currentState);
            if (intprt.intp != null) {
                interpretations.push(intprt);
                hasAnInterpretation.push(i);
            }
            i++;
        });
        if (interpretations.length == 1) {
            return interpretations;
        }
        else if (interpretations.length == 0) {
            throw new Error("Found no interpretation");
        }
        else {
            //throw new Error("More than one parse gave an interpretation: ambiguity");  
            var newParses = [];
            var selection;
            alert("More than one parse gave an interpretation! \n");
            for (var j = 0; j < hasAnInterpretation.length; j++) {
                newParses[j] = j + ") " + clearerParse(parses[hasAnInterpretation[j]]);
            }
            do {
                selection = parseInt(prompt("Enter the number that correspond to your parse: \n" + newParses.join("\n"), "0"));
            } while (selection.toString() == "NaN" || selection < 0 || selection > hasAnInterpretation.length);
            return [interpretations[selection]];
        }
    }
    Interpreter.interpret = interpret;
    function interpretationToString(res) {
        return res.intp.map(function (lits) {
            return lits.map(function (lit) { return literalToString(lit); }).join(" & ");
        }).join(" | ");
    }
    Interpreter.interpretationToString = interpretationToString;
    function literalToString(lit) {
        return (lit.pol ? "" : "-") + lit.rel + "(" + lit.args.join(",") + ")";
    }
    Interpreter.literalToString = literalToString;
    var Error = (function () {
        function Error(message) {
            this.message = message;
            this.name = "Interpreter.Error";
        }
        Error.prototype.toString = function () { return this.name + ": " + this.message; };
        return Error;
    })();
    Interpreter.Error = Error;
    //////////////////////////////////////////////////////////////////////
    // private functions
    /**
     * Interprets the command and return the goal as a pddl representation.
     * Side note:
     * - The quantifier "all", "any" and "the" are all interpreted the same way as "any"
     */
    function interpretCommand(cmd, state) {
        var tmp;
        var tmp2;
        var goalsAsMap = new collections.Dictionary();
        var intprt;
        /*
            1st part: Identifying the object to move
        */
        //"move it" cmd
        if (cmd.ent == null) {
            if (state.holding == null) {
                throw new Error("No object is being held at the moment");
            }
            var obj = state.objects[state.holding];
            var o = { id: state.holding, size: obj.size, form: obj.form, color: obj.color };
            tmp = [o];
        }
        else {
            var myObj = cmd.ent.obj.obj == null ? cmd.ent.obj : cmd.ent.obj.obj;
            if (Helper.isFloor(myObj)) {
                throw new Error("Can't move the floor");
            }
            tmp = recursionCheck(cmd.ent, state);
            if (tmp.length == 0) {
                //No such object
                return null;
            }
            tmp = Helper.removeDuplicate(tmp);
        }
        /*
            2nd part: checking validity of location where to move the object
        */
        //Check if it´s a 'take' cmd
        if (cmd.loc == null) {
            for (var i = 0; i < tmp.length; i++) {
                goalsAsMap.setValue(tmp[i].id, []);
            }
            intprt = pddlTransformation(goalsAsMap, "holding", true);
        }
        else {
            var rel = cmd.loc.rel;
            var myObj = cmd.loc.ent.obj.obj == null ? cmd.loc.ent.obj : cmd.loc.ent.obj.obj;
            tmp2 = recursionCheck(cmd.loc.ent, state);
            if (tmp2.length == 0) {
                //No such object
                return null;
            }
            tmp2 = Helper.removeDuplicate(tmp2);
            //Check that relations between tmp and tmp2 holds
            for (var i = 0; i < tmp.length; i++) {
                var tmpGoal = checkPhysicalLaws(tmp[i], tmp2, rel);
                if (tmpGoal.length != 0) {
                    goalsAsMap.setValue(tmp[i].id, tmpGoal);
                }
            }
            if (goalsAsMap.isEmpty()) {
                //Impossible
                return null;
            }
            intprt = pddlTransformation(goalsAsMap, rel, false);
        }
        return intprt;
    }
    /**
     *	Find the objects that correspond to the input.
     * 	ie: if parse gives: (a relation b relation c)
     *      First find objects that correspond to c, then check if there exist such an
     *      object c that relates to an object b, then check if there exist such an
     *      object b that relates to an object a
     */
    function recursionCheck(ent, state) {
        var owc = [];
        var o = ent.obj;
        if (o.obj != null) {
            if (!Helper.isFloor(o)) {
                owc = recursionCheck(o.loc.ent, state);
                var owcRelated = [];
                for (var i = 0; i < owc.length; i++) {
                    var objs = getObjsWithSpatialRelation(o, owc[i], state);
                    for (var j = 0; j < objs.length; j++) {
                        owcRelated.push(objs[j]);
                    }
                }
                return owcRelated;
            }
            else {
                throw new Error("Floor can't be related this way");
            }
        }
        else {
            if (Helper.isFloor(o)) {
                owc.push({ id: "floor", form: "floor", size: null, color: null });
            }
            else {
                var ids = Helper.findIDs(o, state);
                for (var i = 0; i < ids.length; i++) {
                    var obj = { id: ids[i], size: state.objects[ids[i]].size, form: state.objects[ids[i]].form, color: state.objects[ids[i]].color };
                    if (ids[i] != state.holding) {
                        obj.coord = Helper.findCoord(ids[i], state);
                    }
                    owc.push(obj);
                }
            }
            return owc;
        }
    }
    /**
     * Transform the goal map as a pddl representation
     */
    function pddlTransformation(map, rel, hold) {
        var lits = [];
        var i = 0;
        //"take" cmd
        if (hold) {
            map.forEach(function (key, values) {
                var lit = [{ pol: true, rel: rel, args: [key] }];
                lits[i] = lit;
                i++;
            });
        }
        else {
            var j = 0;
            map.forEach(function (key, values) {
                for (var i = 0; i < values.length; i++) {
                    var lit = { pol: true, rel: rel, args: [key, values[i]] };
                    lits[j] = [lit];
                    j++;
                }
            });
        }
        return lits;
    }
    /**
     * Verify that physical laws are respected between objects, and return the identifier
     * of such objects.
     */
    function checkPhysicalLaws(o, objs, rel) {
        var valid = [];
        for (var i = 0; i < objs.length; i++) {
            var curr = objs[i];
            if (!(curr.id == o.id ||
                Rules.breakRules(o, curr, rel))) {
                valid.push(curr.id);
            }
        }
        return valid;
    }
    /**
     * Find objects in the world that matches through the spatial relations
     */
    function getObjsWithSpatialRelation(o1, o2, state) {
        var tmp = [];
        if (o2.form == "floor" && o1.loc.rel == "ontop") {
            for (var i = 0; i < state.stacks.length; i++) {
                tmp = tmp.concat(Helper.getObjsInStack(i, 0, 1, state, o1));
            }
        }
        else if ((o1.loc.rel == "inside" && o2.form == "box") || (o1.loc.rel == "ontop" && o2.form != "box")) {
            tmp = Helper.getObjsInStack(o2.coord.x, o2.coord.y + 1, o2.coord.y + 2, state, o1);
        }
        else if (o1.loc.rel == "above") {
            tmp = Helper.getObjsInStack(o2.coord.x, o2.coord.y + 1, state.stacks[o2.coord.x].length, state, o1);
        }
        else if (!Helper.isFloor(o2) && o1.loc.rel == "under") {
            tmp = Helper.getObjsInStack(o2.coord.x, 0, o2.coord.y, state, o1);
        }
        else if (!Helper.isFloor(o2) && o1.loc.rel == "beside") {
            if (o2.coord.x > 0) {
                tmp = Helper.getObjsInStack(o2.coord.x - 1, 0, state.stacks[o2.coord.x - 1].length, state, o1);
            }
            if (o2.coord.x < state.stacks.length - 1) {
                tmp = tmp.concat(Helper.getObjsInStack(o2.coord.x + 1, 0, state.stacks[o2.coord.x + 1].length, state, o1));
            }
        }
        else if (!Helper.isFloor(o2) && o1.loc.rel == "leftof") {
            for (var i = 0; i < o2.coord.x; i++) {
                tmp = tmp.concat(Helper.getObjsInStack(i, 0, state.stacks[i].length, state, o1));
            }
        }
        else if (!Helper.isFloor(o2) && o1.loc.rel == "rightof") {
            for (var i = o2.coord.x + 1; i < state.stacks.length; i++) {
                tmp = tmp.concat(Helper.getObjsInStack(i, 0, state.stacks[i].length, state, o1));
            }
        }
        return tmp;
    }
    function clearerParse(parse) {
        var s = parse.input;
        var ent = parse.prs.ent;
        var index;
        var form;
        for (var i = 0; i < 2; i++) {
            while (ent.obj.obj != null) {
                form = ent.obj.obj.form == "anyform" ? "object" : ent.obj.obj.form;
                index = s.indexOf(form) + form.length;
                s = splice(s, index, 0, " that is");
                ent = ent.obj.loc.ent;
            }
            ent = parse.prs.loc.ent;
        }
        return s;
    }
    function splice(toModify, idx, rem, s) {
        return (toModify.slice(0, idx) + s + toModify.slice(idx + Math.abs(rem)));
    }
})(Interpreter || (Interpreter = {}));
///<reference path="Rules.ts"/>
///<reference path="Helper.ts"/>
/**
 * Representation of a node in the search tree of the search algorithm
 */
var MyNode = (function () {
    function MyNode(s, lastAction) {
        this.gcost = Number.MAX_VALUE; //Init for the algo
        this.neighbors = new collections.Set(); //Map
        this.world = s;
        this.lastAction = lastAction;
    }
    /**
     * Generates the neighbors of this node (avoids to go back to the previous state)
     */
    MyNode.prototype.getNeighbors = function () {
        var nodes = [];
        var actions = ["l", "r", "d", "p"];
        for (var i = 0; i < 4; i++) {
            if (!(actions[i] == "l" && this.lastAction == "r" ||
                actions[i] == "r" && this.lastAction == "l" ||
                actions[i] == "p" && this.lastAction == "d" ||
                actions[i] == "d" && this.lastAction == "p")) {
                var node = this.genNode(actions[i]);
                if (node != null) {
                    node.genHash();
                    nodes.push(node);
                }
            }
        }
        return nodes;
    };
    /**
     * Generates the hash of the node: arm position + stacks as a string
     *
     */
    MyNode.prototype.genHash = function () {
        var s = this.world.stacks;
        var arm = this.world.arm;
        var tmp = arm.toString();
        var l;
        for (var i = 0; i < s.length; i++) {
            l = s[i].length;
            if (l == 0) {
                tmp += "_";
            }
            else {
                tmp += l.toString();
                for (var j = 0; j < s[i].length; j++) {
                    tmp += s[i][j];
                }
            }
        }
        this.hash = tmp;
    };
    /**
     * Generate the neighbor node after the specified action
     */
    MyNode.prototype.genNode = function (action) {
        var node;
        var world = this.world;
        var newWState;
        if (action == "l" && world.arm > 0) {
            newWState = { stacks: world.stacks, holding: world.holding, arm: world.arm - 1, objects: world.objects };
            node = new MyNode(newWState, action);
        }
        else if (action == "r" && world.arm < world.stacks.length - 1) {
            newWState = { stacks: world.stacks, holding: world.holding, arm: world.arm + 1, objects: world.objects };
            node = new MyNode(newWState, action);
        }
        else if (action == "p" && world.holding == null && world.stacks[world.arm].length != 0) {
            var hold = world.stacks[world.arm][world.stacks[world.arm].length - 1];
            newWState = { stacks: newStacks(world.stacks, world.arm), holding: hold, arm: world.arm, objects: world.objects };
            node = new MyNode(newWState, action);
        }
        else if (action == "d" && world.holding != null) {
            var relObj = Helper.getObjAtCoord({ x: world.arm, y: world.stacks[world.arm].length - 1 }, world);
            var rel = relObj.form == "box" ? "inside" : "ontop";
            if (!Rules.breakRules(world.objects[world.holding], relObj, rel)) {
                newWState = { stacks: newStacks(world.stacks, world.arm, world.holding), holding: null, arm: world.arm, objects: world.objects };
                node = new MyNode(newWState, action);
            }
        }
        if (node != null) {
            this.neighbors.add(node);
        }
        return node;
    };
    /**
     * At the moment each node are at distance of one form each other
     */
    MyNode.prototype.distanceToMyNode = function (n) {
        return 1;
    };
    return MyNode;
})();
/**
 * Generates the new stacks after a pick or a drop
 */
function newStacks(stacks, arm, holding) {
    var newS = [];
    for (var x = 0; x < stacks.length; x++) {
        newS[x] = new Array();
        for (var y = 0; y < stacks[x].length; y++) {
            newS[x][y] = stacks[x][y];
        }
    }
    //pick
    if (holding == null) {
        newS[arm].splice(newS[arm].length - 1, 1);
    }
    else {
        newS[arm][newS[arm].length] = holding;
    }
    return newS;
}
///<reference path="collections.ts"/>
///<reference path="MyNode.ts"/>
var SearchAlgo;
(function (SearchAlgo) {
    /**
     * A* algorithm
     */
    function aStar(start, goal) {
        //Dicitionaries are used because it provides efficient ways to add, delete and check if an element exists already in the data strucure
        var closedset = new collections.Dictionary();
        var openset = new collections.Dictionary();
        openset.setValue(start.hash, start);
        start.gcost = 0;
        start.fcost = start.gcost + heuristic(start, goal);
        var iterations = 0;
        while (!openset.isEmpty()) {
            iterations++;
            var current = minFcost(openset);
            if (reachGoal(current.world, goal)) {
                alert(iterations);
                return reconstructPath(current);
            }
            openset.remove(current.hash);
            closedset.setValue(current.hash, current);
            var neighbors = current.getNeighbors();
            for (var i = 0; i < neighbors.length; i++) {
                var n = neighbors[i];
                if (closedset.containsKey(n.hash)) {
                    continue;
                }
                var tmpGCost = current.gcost + current.distanceToMyNode(n);
                var opensetContains = openset.containsKey(n.hash);
                if (!opensetContains || tmpGCost < n.gcost) {
                    n.parent = current;
                    n.gcost = tmpGCost;
                    n.fcost = n.gcost + heuristic(n, goal);
                    if (!opensetContains) {
                        openset.setValue(n.hash, n);
                    }
                }
            }
        }
        return [];
    }
    SearchAlgo.aStar = aStar;
    /**
     * Heuristic for the A* algorithm, works for my case where the inside arrays are actually in each just a lonely literal.
     * This heuristic is based on the distance between objects in the literal and the minimal number of pick and drop necessary
     * for reach the final goal.
     * After few trys I estimated that the number of steps needed to go through A-star were decreased by 25% to 40%
     * (Compared to a heuristic that returns 0)
     */
    function heuristic(node, goal) {
        var fcosts = [];
        var l;
        var pos0;
        var pos1;
        var state = node.world;
        var toAdd; // increase if there is a need to drop and/or pick objects
        for (var i = 0; i < goal.length; i++) {
            l = goal[i][0];
            //Case where the relation is "holding"
            if (l.rel == "holding") {
                if (node.world.holding == l.args[0]) {
                    fcosts[i] = 0;
                }
                else {
                    toAdd = (node.world.holding == null) ? 1 : 2; //minimal pick and drop = 1 pick or (1 drop and 1 pick)
                    fcosts[i] = Math.abs(node.world.arm - Helper.findCoord(l.args[0], state).x) + toAdd;
                }
            }
            else if (l.args[1] == "floor") {
                var closestEmpty = Number.MAX_VALUE;
                var smallestSize = Number.MAX_VALUE;
                if (node.world.holding == l.args[0]) {
                    toAdd = 1; //minimal pick and drop = 1 drop
                    pos0 = node.world.arm;
                }
                else {
                    toAdd = (node.world.holding == null) ? 2 : 3; //minimal pick and drop = (1 pick and 1 drop) or (1 drop and 1 pick and 1 drop)
                    pos0 = Helper.findCoord(l.args[0], state).x;
                }
                //find the closest empty stack to the object
                for (var j = 0; j < node.world.stacks.length; j++) {
                    if (node.world.stacks[j].length == 0 && closestEmpty > Math.abs(pos0 - j)) {
                        closestEmpty = Math.abs(pos0 - j);
                    }
                }
                //if there are no empty stack return the min of drop and pick 
                if (closestEmpty == Number.MAX_VALUE) {
                    fcosts[i] = toAdd + 3;
                }
                else {
                    fcosts[i] = closestEmpty + toAdd;
                }
            }
            else {
                if (node.world.holding == l.args[0] || node.world.holding == l.args[1]) {
                    toAdd = 1; //minimal pick and drop = 1 drop
                    if (node.world.holding == l.args[0]) {
                        pos0 = node.world.arm;
                        pos1 = Helper.findCoord(l.args[1], state).x;
                    }
                    else {
                        pos0 = Helper.findCoord(l.args[0], state).x;
                        pos1 = node.world.arm;
                    }
                }
                else {
                    toAdd = node.world.holding == null ? 2 : 3; //minimal pick and drop = (1 pick and 1 drop) or (1 drop and 1 pick and 1 drop)
                    pos0 = Helper.findCoord(l.args[0], state).x;
                    pos1 = Helper.findCoord(l.args[1], state).x;
                }
                if (l.rel == "ontop" || l.rel == "above" || l.rel == "under" || l.rel == "inside") {
                    fcosts[i] = Math.abs(pos0 - pos1) + toAdd;
                }
                else if (l.rel == "beside") {
                    fcosts[i] = Math.min(Math.abs(pos0 - (pos1 + 1)), Math.abs(pos0 - (pos1 - 1))) + toAdd;
                }
                else if (l.rel == "leftof") {
                    fcosts[i] = pos0 < pos1 ? 0 : pos0 - (pos1 - 1) + toAdd;
                }
                else if (l.rel == "rightof") {
                    fcosts[i] = pos0 < pos1 ? 0 : pos0 - (pos1 + 1) + toAdd;
                }
            }
        }
        return min(fcosts);
    }
    /**
     * Reconstruct the path that has been taken to reach the specified node
     */
    function reconstructPath(goal) {
        var path = [];
        var current = goal;
        while (current.parent != null) {
            path.unshift(current.lastAction);
            current = current.parent;
        }
        if (path.length == 0) {
            path.push("Already true");
        }
        return path;
    }
    /**
     * Returns the node with the minimal fcost
     */
    function minFcost(openset) {
        var tmp;
        openset.forEach(function (k, v) {
            if (tmp == null || v.fcost < tmp.fcost) {
                tmp = v;
            }
        });
        return tmp;
    }
    /**
     * Checks if the goal has been reached
     */
    function reachGoal(ws, goal) {
        var found = false;
        var innerFound;
        var o1, o2, rel;
        for (var x = 0; !found && x < goal.length; x++) {
            for (var y = 0; !innerFound && y < goal[x].length; y++) {
                if (y == 0) {
                    innerFound = true;
                }
                innerFound = (innerFound && existsRelation(ws, goal[x][y]));
            }
            found = innerFound;
        }
        return found;
    }
    /**
     * Checks if the literal can be found in the world
     */
    function existsRelation(ws, g) {
        var found = false;
        var rel = g.rel;
        if (rel == "holding") {
            found = (ws.holding == g.args[0]);
        }
        else if (!(g.args[0] == ws.holding || g.args[1] == ws.holding)) {
            var c1 = Helper.findCoord(g.args[0], ws);
            if (g.args[1] == "floor") {
                found = (rel == "ontop" && c1.y == 0);
            }
            else {
                var c2 = Helper.findCoord(g.args[1], ws);
                if (rel == "ontop" || rel == "inside") {
                    found = (c1.x == c2.x && c1.y == c2.y + 1);
                }
                else if (rel == "leftof") {
                    found = (c1.x < c2.x);
                }
                else if (rel == "rightof") {
                    found = (c1.x > c2.x);
                }
                else if (rel == "beside") {
                    found = (c1.x == c2.x + 1 || c1.x == c2.x - 1);
                }
                else if (rel == "under") {
                    found = (c1.x == c2.x && c1.y < c2.y);
                }
                else if (rel == "above") {
                    found = (c1.x == c2.x && c1.y > c2.y);
                }
            }
        }
        return found;
    }
    /**
     * Returns the minimal element in this array
     */
    function min(array) {
        var tmp = Number.MAX_VALUE;
        for (var i = 0; i < array.length; i++) {
            tmp = Math.min(tmp, array[i]);
        }
        return tmp;
    }
})(SearchAlgo || (SearchAlgo = {}));
///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="SearchAlgo.ts"/>
///<reference path="MyNode.ts"/>
var Planner;
(function (Planner) {
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    function plan(interpretations, currentState) {
        var plans = [];
        interpretations.forEach(function (intprt) {
            var plan = intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        }
        else {
            throw new Planner.Error("Found no plans");
        }
    }
    Planner.plan = plan;
    function planToString(res) {
        return res.plan.join(", ");
    }
    Planner.planToString = planToString;
    var Error = (function () {
        function Error(message) {
            this.message = message;
            this.name = "Planner.Error";
        }
        Error.prototype.toString = function () { return this.name + ": " + this.message; };
        return Error;
    })();
    Planner.Error = Error;
    //////////////////////////////////////////////////////////////////////
    // private functions
    function planInterpretation(intprt, state) {
        var start = new MyNode(state, "");
        start.genHash();
        var plan = SearchAlgo.aStar(start, intprt);
        return plan;
    }
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
})(Planner || (Planner = {}));
///<reference path="World.ts"/>
///<reference path="Parser.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Planner.ts"/>
///<reference path="Rules.ts"/>
var Shrdlite;
(function (Shrdlite) {
    function interactive(world) {
        function endlessLoop(utterance) {
            if (utterance === void 0) { utterance = ""; }
            var inputPrompt = "What can I do for you today? ";
            var nextInput = function () { return world.readUserInput(inputPrompt, endlessLoop); };
            if (utterance.trim()) {
                var plan = splitStringIntoPlan(utterance);
                if (!plan) {
                    plan = parseUtteranceIntoPlan(world, utterance);
                }
                if (plan) {
                    world.printDebugInfo("Plan: " + plan.join(", "));
                    world.performPlan(plan, nextInput);
                    return;
                }
            }
            nextInput();
        }
        world.printWorld(endlessLoop);
    }
    Shrdlite.interactive = interactive;
    // Generic function that takes an utterance and returns a plan:
    // - first it parses the utterance
    // - then it interprets the parse(s)
    // - then it creates plan(s) for the interpretation(s)
    function parseUtteranceIntoPlan(world, utterance) {
        world.printDebugInfo('Parsing utterance: "' + utterance + '"');
        try {
            var parses = Parser.parse(utterance);
        }
        catch (err) {
            if (err instanceof Parser.Error) {
                world.printError("Parsing error", err.message);
                return;
            }
            else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + parses.length + " parses");
        parses.forEach(function (res, n) {
            world.printDebugInfo("  (" + n + ") " + Parser.parseToString(res));
        });
        try {
            var interpretations = Interpreter.interpret(parses, world.currentState);
        }
        catch (err) {
            if (err instanceof Interpreter.Error) {
                world.printError("Interpretation error", err.message);
                return;
            }
            else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + interpretations.length + " interpretations");
        interpretations.forEach(function (res, n) {
            world.printDebugInfo("  (" + n + ") " + Interpreter.interpretationToString(res));
        });
        alert("break");
        try {
            var plans = Planner.plan(interpretations, world.currentState);
        }
        catch (err) {
            if (err instanceof Planner.Error) {
                world.printError("Planning error", err.message);
                return;
            }
            else {
                throw err;
            }
        }
        world.printDebugInfo("Found " + plans.length + " plans");
        plans.forEach(function (res, n) {
            world.printDebugInfo("  (" + n + ") " + Planner.planToString(res));
        });
        var plan = plans[0].plan;
        world.printDebugInfo("Final plan: " + plan.join(", "));
        return plan;
    }
    Shrdlite.parseUtteranceIntoPlan = parseUtteranceIntoPlan;
    // This is a convenience function that recognizes strings
    // of the form "p r r d l p r d"
    function splitStringIntoPlan(planstring) {
        var plan = planstring.trim().split(/\s+/);
        var actions = { p: "pick", d: "drop", l: "left", r: "right" };
        for (var i = plan.length - 1; i >= 0; i--) {
            if (!actions[plan[i]]) {
                return;
            }
            plan.splice(i, 0, actions[plan[i]]);
        }
        return plan;
    }
    Shrdlite.splitStringIntoPlan = splitStringIntoPlan;
})(Shrdlite || (Shrdlite = {}));
///<reference path="World.ts"/>
///<reference path="lib/jquery.d.ts" />
var SVGWorld = (function () {
    function SVGWorld(currentState, useSpeech) {
        var _this = this;
        if (useSpeech === void 0) { useSpeech = false; }
        this.currentState = currentState;
        this.useSpeech = useSpeech;
        //////////////////////////////////////////////////////////////////////
        // Public constants that can be played around with
        this.dialogueHistory = 100; // max nr. utterances
        this.floorThickness = 10; // pixels
        this.wallSeparation = 4; // pixels
        this.armSize = 0.2; // of stack width
        this.animationPause = 0.01; // seconds
        this.promptPause = 0.5; // seconds
        this.ajaxTimeout = 5; // seconds
        this.armSpeed = 1000; // pixels per second
        // There is no way of setting male/female voice,
        // so this is one way of having different voices for user/system:
        this.voices = {
            "system": { "lang": "en-GB", "rate": 1.1 },
            "user": { "lang": "en-US" }
        };
        // HTML id's for different containers
        this.containers = {
            world: $('#theworld'),
            dialogue: $('#dialogue'),
            inputform: $('#dialogue form'),
            userinput: $('#dialogue form input:text'),
            inputexamples: $('#dialogue form select')
        };
        this.svgNS = 'http://www.w3.org/2000/svg';
        //////////////////////////////////////////////////////////////////////
        // Object types
        this.objectData = {
            brick: { small: { width: 0.30, height: 0.30 },
                large: { width: 0.70, height: 0.60 } },
            plank: { small: { width: 0.60, height: 0.10 },
                large: { width: 1.00, height: 0.15 } },
            ball: { small: { width: 0.30, height: 0.30 },
                large: { width: 0.70, height: 0.70 } },
            pyramid: { small: { width: 0.60, height: 0.25 },
                large: { width: 1.00, height: 0.40 } },
            box: { small: { width: 0.60, height: 0.30, thickness: 0.10 },
                large: { width: 1.00, height: 0.40, thickness: 0.10 } },
            table: { small: { width: 0.60, height: 0.30, thickness: 0.10 },
                large: { width: 1.00, height: 0.40, thickness: 0.10 } }
        };
        if (!this.currentState.arm)
            this.currentState.arm = 0;
        if (this.currentState.holding)
            this.currentState.holding = null;
        this.canvasWidth = this.containers.world.width() - 2 * this.wallSeparation;
        this.canvasHeight = this.containers.world.height() - this.floorThickness;
        var dropdown = this.containers.inputexamples;
        dropdown.empty();
        dropdown.append($('<option value="">').text("(Select an example utterance)"));
        $.each(this.currentState.examples, function (i, value) {
            dropdown.append($('<option>').text(value));
        });
        dropdown.change(function () {
            var userinput = dropdown.val().trim();
            if (userinput) {
                _this.containers.userinput.val(userinput).focus();
            }
        });
        this.containers.inputform.submit(function () { return _this.handleUserInput.call(_this); });
        this.disableInput();
    }
    //////////////////////////////////////////////////////////////////////
    // Public methods
    SVGWorld.prototype.readUserInput = function (prompt, callback) {
        this.printSystemOutput(prompt);
        this.enableInput();
        this.inputCallback = callback;
    };
    SVGWorld.prototype.printSystemOutput = function (output, participant, utterance) {
        if (participant === void 0) { participant = "system"; }
        if (utterance == undefined) {
            utterance = output;
        }
        var dialogue = this.containers.dialogue;
        if (dialogue.children().length > this.dialogueHistory) {
            dialogue.children().first().remove();
        }
        $('<p>').attr("class", participant)
            .text(output)
            .insertBefore(this.containers.inputform);
        dialogue.scrollTop(dialogue.prop("scrollHeight"));
        if (this.useSpeech && utterance && /^\w/.test(utterance)) {
            try {
                // W3C Speech API (works in Chrome and Safari)
                var speech = new SpeechSynthesisUtterance(utterance);
                for (var attr in this.voices[participant]) {
                    speech[attr] = this.voices[participant][attr];
                }
                console.log("SPEAKING: " + utterance);
                window.speechSynthesis.speak(speech);
            }
            catch (err) {
            }
        }
    };
    SVGWorld.prototype.printDebugInfo = function (info) {
        console.log(info);
    };
    SVGWorld.prototype.printError = function (error, message) {
        console.error(error, message);
        if (message) {
            error += ": " + message;
        }
        this.printSystemOutput(error, "error");
    };
    SVGWorld.prototype.printWorld = function (callback) {
        this.containers.world.empty();
        this.printSystemOutput("Please wait while I populate the world.");
        var viewBox = [0, 0, this.canvasWidth + 2 * this.wallSeparation,
            this.canvasHeight + this.floorThickness];
        var svg = $(this.SVG('svg')).attr({
            viewBox: viewBox.join(' '),
            width: viewBox[2],
            height: viewBox[3]
        }).appendTo(this.containers.world);
        // The floor:
        $(this.SVG('rect')).attr({
            x: 0,
            y: this.canvasHeight,
            width: this.canvasWidth + 2 * this.wallSeparation,
            height: this.canvasHeight + this.floorThickness,
            fill: 'black'
        }).appendTo(svg);
        // The arm:
        $(this.SVG('line')).attr({
            id: 'arm',
            x1: this.stackWidth() / 2,
            y1: this.armSize * this.stackWidth() - this.canvasHeight,
            x2: this.stackWidth() / 2,
            y2: this.armSize * this.stackWidth(),
            stroke: 'black',
            'stroke-width': this.armSize * this.stackWidth()
        }).appendTo(svg);
        var timeout = 0;
        for (var stacknr = 0; stacknr < this.currentState.stacks.length; stacknr++) {
            for (var objectnr = 0; objectnr < this.currentState.stacks[stacknr].length; objectnr++) {
                var objectid = this.currentState.stacks[stacknr][objectnr];
                this.makeObject(svg, objectid, stacknr, timeout);
                timeout += this.animationPause;
            }
        }
        if (callback) {
            setTimeout(callback, (timeout + this.promptPause) * 1000);
        }
    };
    SVGWorld.prototype.performPlan = function (plan, callback) {
        var _this = this;
        if (this.isSpeaking()) {
            setTimeout(function () { return _this.performPlan(plan, callback); }, this.animationPause * 1000);
            return;
        }
        var planctr = 0;
        var performNextAction = function () {
            planctr++;
            if (plan && plan.length) {
                var item = plan.shift().trim();
                var action = _this.getAction(item);
                if (action) {
                    try {
                        action.call(_this, performNextAction);
                    }
                    catch (err) {
                        _this.printError(err);
                        if (callback)
                            setTimeout(callback, _this.promptPause * 1000);
                    }
                }
                else {
                    if (item && item[0] != "#") {
                        if (_this.isSpeaking()) {
                            plan.unshift(item);
                            setTimeout(performNextAction, _this.animationPause * 1000);
                        }
                        else {
                            _this.printSystemOutput(item);
                            performNextAction();
                        }
                    }
                    else {
                        performNextAction();
                    }
                }
            }
            else {
                if (callback)
                    setTimeout(callback, _this.promptPause * 1000);
            }
        };
        performNextAction();
    };
    SVGWorld.prototype.stackWidth = function () {
        return this.canvasWidth / this.currentState.stacks.length;
    };
    SVGWorld.prototype.boxSpacing = function () {
        return Math.min(5, this.stackWidth() / 20);
    };
    SVGWorld.prototype.SVG = function (tag) {
        return document.createElementNS(this.svgNS, tag);
    };
    SVGWorld.prototype.animateMotion = function (object, path, timeout, duration) {
        if (path instanceof Array) {
            path = path.join(" ");
        }
        var animation = this.SVG('animateMotion');
        $(animation).attr({
            begin: 'indefinite',
            fill: 'freeze',
            path: path,
            dur: duration + "s"
        }).appendTo(object);
        animation.beginElementAt(timeout);
        return animation;
    };
    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop
    SVGWorld.prototype.getAction = function (act) {
        var actions = { p: this.pick, d: this.drop, l: this.left, r: this.right };
        return actions[act.toLowerCase()];
    };
    SVGWorld.prototype.left = function (callback) {
        if (this.currentState.arm <= 0) {
            throw "Already at left edge!";
        }
        this.horizontalMove(this.currentState.arm - 1, callback);
    };
    SVGWorld.prototype.right = function (callback) {
        if (this.currentState.arm >= this.currentState.stacks.length - 1) {
            throw "Already at right edge!";
        }
        this.horizontalMove(this.currentState.arm + 1, callback);
    };
    SVGWorld.prototype.drop = function (callback) {
        if (!this.currentState.holding) {
            throw "Not holding anything!";
        }
        this.verticalMove('drop', callback);
        this.currentState.stacks[this.currentState.arm].push(this.currentState.holding);
        this.currentState.holding = null;
    };
    SVGWorld.prototype.pick = function (callback) {
        if (this.currentState.holding) {
            throw "Already holding something!";
        }
        this.currentState.holding = this.currentState.stacks[this.currentState.arm].pop();
        this.verticalMove('pick', callback);
    };
    //////////////////////////////////////////////////////////////////////
    // Moving around
    SVGWorld.prototype.horizontalMove = function (newArm, callback) {
        var xArm = this.currentState.arm * this.stackWidth() + this.wallSeparation;
        var xNewArm = newArm * this.stackWidth() + this.wallSeparation;
        var path1 = ["M", xArm, 0, "H", xNewArm];
        var duration = Math.abs(xNewArm - xArm) / this.armSpeed;
        var arm = $('#arm');
        this.animateMotion(arm, path1, 0, duration);
        if (this.currentState.holding) {
            var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
            var yArm = -(this.canvasHeight - this.armSize * this.stackWidth() - objectHeight);
            var path2 = ["M", xArm, yArm, "H", xNewArm];
            var object = $("#" + this.currentState.holding);
            this.animateMotion(object, path2, 0, duration);
        }
        this.currentState.arm = newArm;
        if (callback)
            setTimeout(callback, (duration + this.animationPause) * 1000);
        return;
    };
    SVGWorld.prototype.verticalMove = function (action, callback) {
        var altitude = this.getAltitude(this.currentState.arm);
        var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
        var yArm = this.canvasHeight - altitude - this.armSize * this.stackWidth() - objectHeight;
        var yStack = -altitude;
        var xArm = this.currentState.arm * this.stackWidth() + this.wallSeparation;
        var path1 = ["M", xArm, 0, "V", yArm];
        var path2 = ["M", xArm, yArm, "V", 0];
        var duration = (Math.abs(yArm)) / this.armSpeed;
        var arm = $('#arm');
        var object = $("#" + this.currentState.holding);
        this.animateMotion(arm, path1, 0, duration);
        this.animateMotion(arm, path2, duration + this.animationPause, duration);
        if (action == 'pick') {
            var path3 = ["M", xArm, yStack, "V", yStack - yArm];
            this.animateMotion(object, path3, duration + this.animationPause, duration);
        }
        else {
            var path3 = ["M", xArm, yStack - yArm, "V", yStack];
            this.animateMotion(object, path3, 0, duration);
        }
        if (callback)
            setTimeout(callback, 2 * (duration + this.animationPause) * 1000);
    };
    //////////////////////////////////////////////////////////////////////
    // Methods for getting information about objects 
    SVGWorld.prototype.getObjectDimensions = function (objectid) {
        var attrs = this.currentState.objects[objectid];
        var size = this.objectData[attrs.form][attrs.size];
        var width = size.width * (this.stackWidth() - this.boxSpacing());
        var height = size.height * (this.stackWidth() - this.boxSpacing());
        var thickness = size.thickness * (this.stackWidth() - this.boxSpacing());
        var heightadd = attrs.form == 'box' ? thickness : height;
        return {
            width: width,
            height: height,
            heightadd: heightadd,
            thickness: thickness
        };
    };
    SVGWorld.prototype.getAltitude = function (stacknr, objectid) {
        var stack = this.currentState.stacks[stacknr];
        var altitude = 0;
        for (var i = 0; i < stack.length; i++) {
            if (objectid == stack[i])
                break;
            altitude += this.getObjectDimensions(stack[i]).heightadd + this.boxSpacing();
        }
        return altitude;
    };
    //////////////////////////////////////////////////////////////////////
    // Creating objects
    SVGWorld.prototype.makeObject = function (svg, objectid, stacknr, timeout) {
        var attrs = this.currentState.objects[objectid];
        var altitude = this.getAltitude(stacknr, objectid);
        var dim = this.getObjectDimensions(objectid);
        var ybottom = this.canvasHeight - this.boxSpacing();
        var ytop = ybottom - dim.height;
        var ycenter = (ybottom + ytop) / 2;
        var yradius = (ybottom - ytop) / 2;
        var xleft = (this.stackWidth() - dim.width) / 2;
        var xright = xleft + dim.width;
        var xcenter = (xright + xleft) / 2;
        var xradius = (xright - xleft) / 2;
        var xmidleft = (xcenter + xleft) / 2;
        var xmidright = (xcenter + xright) / 2;
        var object;
        switch (attrs.form) {
            case 'brick':
            case 'plank':
                object = $(this.SVG('rect')).attr({
                    x: xleft,
                    y: ytop,
                    width: dim.width,
                    height: dim.height
                });
                break;
            case 'ball':
                object = $(this.SVG('ellipse')).attr({
                    cx: xcenter,
                    cy: ycenter,
                    rx: xradius,
                    ry: yradius
                });
                break;
            case 'pyramid':
                var points = [xleft, ybottom, xmidleft, ytop, xmidright, ytop, xright, ybottom];
                object = $(this.SVG('polygon')).attr({
                    points: points.join(" ")
                });
                break;
            case 'box':
                var points = [xleft, ytop, xleft, ybottom, xright, ybottom, xright, ytop,
                    xright - dim.thickness, ytop, xright - dim.thickness, ybottom - dim.thickness,
                    xleft + dim.thickness, ybottom - dim.thickness, xleft + dim.thickness, ytop];
                object = $(this.SVG('polygon')).attr({
                    points: points.join(" ")
                });
                break;
            case 'table':
                var points = [xleft, ytop, xright, ytop, xright, ytop + dim.thickness,
                    xmidright, ytop + dim.thickness, xmidright, ybottom,
                    xmidright - dim.thickness, ybottom, xmidright - dim.thickness, ytop + dim.thickness,
                    xmidleft + dim.thickness, ytop + dim.thickness, xmidleft + dim.thickness, ybottom,
                    xmidleft, ybottom, xmidleft, ytop + dim.thickness, xleft, ytop + dim.thickness];
                object = $(this.SVG('polygon')).attr({
                    points: points.join(" ")
                });
                break;
        }
        object.attr({
            id: objectid,
            stroke: 'black',
            'stroke-width': this.boxSpacing() / 2,
            fill: attrs.color
        });
        object.appendTo(svg);
        var path = ["M", stacknr * this.stackWidth() + this.wallSeparation,
            -(this.canvasHeight + this.floorThickness)];
        this.animateMotion(object, path, 0, 0);
        path.push("V", -altitude);
        this.animateMotion(object, path, timeout, 0.5);
    };
    //////////////////////////////////////////////////////////////////////
    // Methods for handling user input and system output
    SVGWorld.prototype.enableInput = function () {
        this.containers.inputexamples.prop('disabled', false).val('');
        this.containers.inputexamples.find("option:first").attr('selected', 'selected');
        this.containers.userinput.prop('disabled', false);
        this.containers.userinput.focus().select();
    };
    SVGWorld.prototype.disableInput = function () {
        this.containers.inputexamples.blur();
        this.containers.inputexamples.prop('disabled', true);
        this.containers.userinput.blur();
        this.containers.userinput.prop('disabled', true);
    };
    SVGWorld.prototype.handleUserInput = function () {
        var userinput = this.containers.userinput.val().trim();
        this.disableInput();
        this.printSystemOutput(userinput, "user");
        this.inputCallback(userinput);
        return false;
    };
    SVGWorld.prototype.isSpeaking = function () {
        return this.useSpeech && window && window.speechSynthesis && window.speechSynthesis.speaking;
    };
    return SVGWorld;
})();
///<reference path="World.ts"/>
var ExampleWorlds = {};
ExampleWorlds["complex"] = {
    "stacks": [["e"], ["a", "l"], ["i", "h", "j"], ["c", "k", "g", "b"], ["d", "m", "f"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "a": { "form": "brick", "size": "large", "color": "yellow" },
        "b": { "form": "brick", "size": "small", "color": "white" },
        "c": { "form": "plank", "size": "large", "color": "red" },
        "d": { "form": "plank", "size": "small", "color": "green" },
        "e": { "form": "ball", "size": "large", "color": "white" },
        "f": { "form": "ball", "size": "small", "color": "black" },
        "g": { "form": "table", "size": "large", "color": "blue" },
        "h": { "form": "table", "size": "small", "color": "red" },
        "i": { "form": "pyramid", "size": "large", "color": "yellow" },
        "j": { "form": "pyramid", "size": "small", "color": "red" },
        "k": { "form": "box", "size": "large", "color": "yellow" },
        "l": { "form": "box", "size": "large", "color": "red" },
        "m": { "form": "box", "size": "small", "color": "blue" }
    },
    "examples": [
        "put a box in a box",
        "put all balls on the floor",
        "take the yellow box",
        "put any object under all tables",
        "put any object under all tables on the floor",
        "put a ball in a small box in a large box",
        "put all balls in a large box",
        "put all balls left of a ball",
        "put all balls beside a ball",
        "put all balls beside every ball",
        "put a box beside all objects",
        "put all red objects above a yellow object on the floor",
        "put all yellow objects under a red object under an object"
    ]
};
ExampleWorlds["medium"] = {
    "stacks": [["e"], ["a", "l"], [], [], ["i", "h", "j"], [], [], ["k", "g", "c", "b"], [], ["d", "m", "f"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "a": { "form": "brick", "size": "large", "color": "green" },
        "b": { "form": "brick", "size": "small", "color": "white" },
        "c": { "form": "plank", "size": "large", "color": "red" },
        "d": { "form": "plank", "size": "small", "color": "green" },
        "e": { "form": "ball", "size": "large", "color": "white" },
        "f": { "form": "ball", "size": "small", "color": "black" },
        "g": { "form": "table", "size": "large", "color": "blue" },
        "h": { "form": "table", "size": "small", "color": "red" },
        "i": { "form": "pyramid", "size": "large", "color": "yellow" },
        "j": { "form": "pyramid", "size": "small", "color": "red" },
        "k": { "form": "box", "size": "large", "color": "yellow" },
        "l": { "form": "box", "size": "large", "color": "red" },
        "m": { "form": "box", "size": "small", "color": "blue" }
    },
    "examples": [
        "put the brick that is to the left of a pyramid in a box",
        "put the white ball in a box on the floor",
        "move the large ball inside a yellow box on the floor",
        "move the large ball inside a red box on the floor",
        "take a red object",
        "take the white ball",
        "put all boxes on the floor",
        "put the large plank under the blue brick",
        "move all bricks on a table",
        "move all balls inside a large box"
    ]
};
ExampleWorlds["small"] = {
    "stacks": [["e"], ["g", "l"], [], ["k", "m", "f"], []],
    "holding": "a",
    "arm": 0,
    "objects": {
        "a": { "form": "brick", "size": "large", "color": "green" },
        "b": { "form": "brick", "size": "small", "color": "white" },
        "c": { "form": "plank", "size": "large", "color": "red" },
        "d": { "form": "plank", "size": "small", "color": "green" },
        "e": { "form": "ball", "size": "large", "color": "white" },
        "f": { "form": "ball", "size": "small", "color": "black" },
        "g": { "form": "table", "size": "large", "color": "blue" },
        "h": { "form": "table", "size": "small", "color": "red" },
        "i": { "form": "pyramid", "size": "large", "color": "yellow" },
        "j": { "form": "pyramid", "size": "small", "color": "red" },
        "k": { "form": "box", "size": "large", "color": "yellow" },
        "l": { "form": "box", "size": "large", "color": "red" },
        "m": { "form": "box", "size": "small", "color": "blue" }
    },
    "examples": [
        "put the white ball in a box on the floor",
        "put the black ball in a box on the floor",
        "take a blue object",
        "take the white ball",
        "put all boxes on the floor",
        "move all balls inside a large box"
    ]
};
ExampleWorlds["impossible"] = {
    "stacks": [["lbrick1", "lball1", "sbrick1"], [],
        ["lpyr1", "lbox1", "lplank2", "sball2"], [],
        ["sbrick2", "sbox1", "spyr1", "ltable1", "sball1"]],
    "holding": null,
    "arm": 0,
    "objects": {
        "lbrick1": { "form": "brick", "size": "large", "color": "green" },
        "sbrick1": { "form": "brick", "size": "small", "color": "yellow" },
        "sbrick2": { "form": "brick", "size": "small", "color": "blue" },
        "lplank1": { "form": "plank", "size": "large", "color": "red" },
        "lplank2": { "form": "plank", "size": "large", "color": "black" },
        "splank1": { "form": "plank", "size": "small", "color": "green" },
        "lball1": { "form": "ball", "size": "large", "color": "white" },
        "sball1": { "form": "ball", "size": "small", "color": "black" },
        "sball2": { "form": "ball", "size": "small", "color": "red" },
        "ltable1": { "form": "table", "size": "large", "color": "green" },
        "stable1": { "form": "table", "size": "small", "color": "red" },
        "lpyr1": { "form": "pyramid", "size": "large", "color": "white" },
        "spyr1": { "form": "pyramid", "size": "small", "color": "blue" },
        "lbox1": { "form": "box", "size": "large", "color": "yellow" },
        "sbox1": { "form": "box", "size": "small", "color": "red" },
        "sbox2": { "form": "box", "size": "small", "color": "blue" }
    },
    "examples": [
        "this is just an impossible world"
    ]
};
///<reference path="Shrdlite.ts"/>
///<reference path="SVGWorld.ts"/>
///<reference path="ExampleWorlds.ts"/>
///<reference path="lib/jquery.d.ts" />
var defaultWorld = 'small';
var defaultSpeech = false;
$(function () {
    var current = getURLParameter('world');
    if (!(current in ExampleWorlds)) {
        current = defaultWorld;
    }
    var speech = (getURLParameter('speech') || "").toLowerCase();
    var useSpeech = (speech == 'true' || speech == '1' || defaultSpeech);
    $('#currentworld').text(current);
    $('<a>').text('reset')
        .attr('href', '?world=' + current + '&speech=' + useSpeech)
        .appendTo($('#resetworld'));
    $('#otherworlds').empty();
    for (var wname in ExampleWorlds) {
        if (wname !== current) {
            $('<a>').text(wname)
                .attr('href', '?world=' + wname + '&speech=' + useSpeech)
                .appendTo($('#otherworlds'))
                .after(' ');
        }
    }
    $('<a>').text(useSpeech ? 'turn off' : 'turn on')
        .attr('href', '?world=' + current + '&speech=' + (!useSpeech))
        .appendTo($('#togglespeech'));
    var world = new SVGWorld(ExampleWorlds[current], useSpeech);
    Shrdlite.interactive(world);
});
// Adapted from: http://www.openjs.com/scripts/events/exit_confirmation.php
function goodbye(e) {
    if (!e)
        e = window.event;
    // e.cancelBubble is supported by IE - this will kill the bubbling process.
    e.cancelBubble = true;
    // This is displayed in the dialog:
    e.returnValue = 'Are you certain?\nYou cannot undo this, you know.';
    // e.stopPropagation works in Firefox.
    if (e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
    }
}
window.onbeforeunload = goodbye;
// Adapted from: http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
function getURLParameter(sParam) {
    var sPageURL = window.location.search.slice(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}
