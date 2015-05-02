/* Copyright 2015 Gael Hatchue, based on work by Oran Looney */

module owl {
    "use strict";

    // Cache information about the JavaScript environment
    var jsEnvironment = {

        // Check if Object.defineProperty is implemented. We"ll assume that
        // getOwnPropertyNames is also available if defineProperty is implemented.
        // See compatibility matrix at: http://kangax.github.io/compat-table/es5/
        hasDefineProperty:
            typeof Object.defineProperty === "function" &&
            (function(): boolean {
                try {
                    Object.defineProperty({}, "x", {});
                    return true;
                } catch (e) {
                    return false;
                }
            })(),

        // Indicate if the JavaScript engine exhibits the DontEnum bug. This bug affects
        // internet explorer 8 or less, and is described in detail at:
        // https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
        hasDontEnumBug:
            (function(): boolean {
                for (var p in { toString: 1 }) {
                    // check actual property name, so that it works with augmented Object.prototype
                    if (p === "toString") {
                        return false;
                    }
                }
                return true;
            })(),

        // List of Object.prototype functions that are not enumerable due to the DontEnum bug
        dontEnums: [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ]
    };

    // the re-usable constructor function used by clone().
    function Clone(): void {
        // no-op
    }

    // clone objects, skip other types.
    export function clone(target: any): any {
        if ( target !== null && typeof target === "object" ) {
            Clone.prototype = target;
            return new Clone();
        } else {
            return target;
        }
    }

    // Utility function to Indicate if the object is a wrapper object for a native type
    function isNativeTypeWrapper(object: any): boolean {
        // We could use the check below, but it can easily fail for objects
        // that override the valueOf function.
        //return object !== null && typeof object === 'object' && object !== object.valueOf();

        // Instead, we explicitly type-check against built-in data-types
        return (object instanceof Number ||
                object instanceof String ||
                object instanceof Boolean ||
                object instanceof Date);
    }

    // Shallow Copy
    export function copy(target: any): any {
        if (target === null || typeof target !== "object" ) {
            return target;  // non-object have value semantics, so target is already a copy.
        } else {
            if (isNativeTypeWrapper(target)) {
                // the object is a standard object wrapper for a native type, say String.
                // we can make a copy by instantiating a new object around the value.
                return new target.constructor(target.valueOf());
            } else {
                // ok, we have a normal object. If possible, we'll clone the original's prototype
                // (not the original) to get an empty object with the same prototype chain as
                // the original, and just copy the instance properties.  Otherwise, we have to
                // copy the whole thing, property-by-property.
                var isPlainObject: boolean =
                    !(target instanceof target.constructor) ||
                    target.constructor === Object;
                var c: any = isPlainObject ? {} : clone(target.constructor.prototype);
                if (jsEnvironment.hasDefineProperty) {
                    Object.getOwnPropertyNames(target).forEach(function(property: string) {
                        Object.defineProperty(c, property,
                            Object.getOwnPropertyDescriptor(target, property));
                    });
                } else {
                    for (var property in target) {
                        if (isPlainObject || Object.prototype.hasOwnProperty.call(target, property)) {
                            c[property] = target[property];
                        }
                    }
                    if (jsEnvironment.hasDontEnumBug) {
                        for (var i: number = 0; i < jsEnvironment.dontEnums.length; i++) {
                            property = jsEnvironment.dontEnums[i];
                            if (Object.prototype.hasOwnProperty.call(target, property)) {
                                c[property] = target[property];
                            }
                        }
                    }
                }
                return c;
            }
        }
    }

    // entry point for deep copy.
    //   source is the object to be deep copied.
    //   maxDepth is an optional recursion limit. Defaults to 256.
    export function deepCopy(source: any, maxDepth: number): any {
        var deepCopyAlgorithm = new DeepCopyAlgorithm();
        if ( maxDepth ) {
            deepCopyAlgorithm .maxDepth = maxDepth;
        }
        return deepCopyAlgorithm.deepCopy(source);
    }

    export module deepCopy {

        export interface IDeepCopier {

            // determines if this DeepCopier can handle the given object.
            canCopy(source: any): boolean;

            // starts the deep copying process by creating the copy object.  You
            // can initialize any properties you want, but you can't call recursively
            // into the DeepCopyAlgorithm.
            create(source: any): any;

            // Completes the deep copy of the source object by populating any properties
            // that need to be recursively deep copied.  You can do this by using the
            // provided deepCopyAlgorithm instance's deepCopy() method.  This will handle
            // cyclic references for objects already deepCopied, including the source object
            // itself.  The "result" passed in is the object returned from create().
            populate(deepCopyAlgorithm: (source: any) => any, source: any, result: any): any;
        }

        export class DeepCopier implements IDeepCopier {

            constructor(config: any) {
                for (var key in config) {
                    if (Object.prototype.hasOwnProperty.call(config, key)) {
                        this[key] = config[key];
                    }
                }
            }

            canCopy(source: any): boolean {
                return false;
            }

            create(source: any): any {
                // no-op
            }

            populate(deepCopyAlgorithm: (source: any) => any, source: any, result: any): any {
                // no-op
            }
        }

        // publicly expose the list of deepCopiers.
        export var deepCopiers: deepCopy.IDeepCopier[] = [];

    }

    export class DeepCopyAlgorithm {

        copiedObjects: any[];

        recursiveDeepCopy: (source: any) => any;

        depth: number;

        maxDepth: number = 256;

        constructor() {
            // copiedObjects keeps track of objects already copied by this
            // deepCopy operation, so we can correctly handle cyclic references.
            this.copiedObjects = [];
            var thisPass = this;
            this.recursiveDeepCopy = function(source: any) {
                return thisPass.deepCopy(source);
            };
            this.depth = 0;
        }

        // add an object to the cache.  No attempt is made to filter duplicates;
        // we always check getCachedResult() before calling it.
        cacheResult(source: any, result: any): void {
            this.copiedObjects.push([source, result]);
        }

        // Returns the cached copy of a given object, or undefined if it's an
        // object we haven't seen before.
        getCachedResult(source: any): any {
            var copiedObjects = this.copiedObjects;
            var length = copiedObjects.length;
            for ( var i: number = 0; i < length; i++ ) {
                if ( copiedObjects[i][0] === source ) {
                    return copiedObjects[i][1];
                }
            }
            return undefined;
        }

        // deepCopy handles the simple cases itself: non-objects and object's we've seen before.
        // For complex cases, it first identifies an appropriate DeepCopier, then calls
        // applyDeepCopier() to delegate the details of copying the object to that DeepCopier.
        deepCopy(source: any): any {
            // null is a special case: it's the only value of type 'object' without properties.
            if ( source === null ) {
                return null;
            }

            // All non-objects use value semantics and don't need explict copying.
            if ( typeof source !== "object" ) {
                return source;
            }

            var cachedResult = this.getCachedResult(source);

            // we've already seen this object during this deep copy operation
            // so can immediately return the result.  This preserves the cyclic
            // reference structure and protects us from infinite recursion.
            if ( cachedResult ) {
                return cachedResult;
            }

            // objects may need special handling depending on their class.  There is
            // a class of handlers call "DeepCopiers"  that know how to copy certain
            // objects.  There is also a final, generic deep copier that can handle any object.
            for ( var i: number = 0; i < deepCopy.deepCopiers.length; i++ ) {
                var deepCopier = deepCopy.deepCopiers[i];
                if ( deepCopier.canCopy(source) ) {
                    return this.applyDeepCopier(deepCopier, source);
                }
            }
            // the generic copier can handle anything, so we should never reach this line.
            throw new Error("no DeepCopier is able to copy " + source);
        }

        // once we've identified which DeepCopier to use, we need to call it in a very
        // particular order: create, cache, populate.  This is the key to detecting cycles.
        // We also keep track of recursion depth when calling the potentially recursive
        // populate(): this is a fail-fast to prevent an infinite loop from consuming all
        // available memory and crashing or slowing down the browser.
        applyDeepCopier(deepCopier: deepCopy.IDeepCopier, source: any): any {
            // Start by creating a stub object that represents the copy.
            var result = deepCopier.create(source);

            // we now know the deep copy of source should always be result, so if we encounter
            // source again during this deep copy we can immediately use result instead of
            // descending into it recursively.
            this.cacheResult(source, result);

            // only DeepCopier::populate() can recursively deep copy.  So, to keep track
            // of recursion depth, we increment this shared counter before calling it,
            // and decrement it afterwards.
            this.depth++;
            if ( this.depth > this.maxDepth ) {
                throw new Error("Exceeded max recursion depth in deep copy.");
            }

            // It's now safe to let the deepCopier recursively deep copy its properties.
            deepCopier.populate(this.recursiveDeepCopy, source, result);

            this.depth--;

            return result;
        }
    }

    export module deepCopy {

        // make deepCopy() extensible by allowing others to
        // register their own custom DeepCopiers.
        export function register(deepCopier: any);
        export function register(deepCopier: IDeepCopier);
        export function register(deepCopier: any) {
            if ( !(deepCopier instanceof DeepCopier) ) {
                deepCopier = new DeepCopier(deepCopier);
            }
            deepCopiers.unshift(deepCopier);
        }
    }

    // Generic Object copier
    // the ultimate fallback DeepCopier, which tries to handle the generic case.  This
    // should work for base Objects and many user-defined classes.
    deepCopy.register({
        canCopy: function(source: any): boolean { return true; },

        create: function(source: any): any {
            if ( source instanceof source.constructor ) {
                return clone(source.constructor.prototype);
            } else {
                return {};
            }
        },

        populate: function(deepCopy: (source: any) => any, source: any, result: any): any {
            if (jsEnvironment.hasDefineProperty) {
                Object.getOwnPropertyNames(source).forEach(function (key: string) {
                    var descriptor: any = Object.getOwnPropertyDescriptor(source, key);
                    descriptor.value = deepCopy(descriptor.value);
                    Object.defineProperty(result, key, descriptor);
                });
            } else {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        result[key] = deepCopy(source[key]);
                    }
                }
                if (jsEnvironment.hasDontEnumBug) {
                    for (var i: number = 0; i < jsEnvironment.dontEnums.length; i++) {
                        key = jsEnvironment.dontEnums[i];
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            result[key] = deepCopy(source[key]);
                        }
                    }
                }
            }
            return result;
        }
    });

    // Array copier
    deepCopy.register({
        canCopy: function(source: any): boolean {
            return ( source instanceof Array );
        },

        create: function(source: any): any {
            return new source.constructor();
        },

        populate: function(deepCopy: (source: any) => any, source: any, result: any): any {
            for ( var i: number = 0; i < source.length; i++) {
                result.push( deepCopy(source[i]) );
            }
            return result;
        }
    });

    // Native type object wrapper copier
    deepCopy.register({
        canCopy: function(source: any): boolean {
            return isNativeTypeWrapper(source);
        },

        create: function(source: any): any {
            return new source.constructor(source.valueOf());
        }
    });

    // HTML DOM Node

    // utility function to detect Nodes.  In particular, we're looking
    // for the cloneNode method.  The global document is also defined to
    // be a Node, but is a special case in many ways.
    function isNode(source: any): boolean {
        /* tslint:disable:no-string-literal */
        if ( window["Node"] ) {
            return source instanceof Node;
        } else {
            // the document is a special Node and doesn't have many of
            // the common properties so we use an identity check instead.
            if ( source === document ) {
                return true;
            }
            return (
                typeof source.nodeType === "number" &&
                source.attributes !== undefined &&
                source.childNodes &&
                source.cloneNode
            );
        }
        /* tslint:enable:no-string-literal */
    }

    // Node copier
    deepCopy.register({
        canCopy: function(source: any): boolean { return isNode(source); },

        create: function(source: any): any {
            // there can only be one (document).
            if ( source === document ) {
                return document;
            }

            // start with a shallow copy.  We'll handle the deep copy of
            // its children ourselves.
            return source.cloneNode(false);
        },

        populate: function(deepCopy: (source: any) => any, source: any, result: any): any {
            // we're not copying the global document, so don't have to populate it either.
            if ( source === document ) {
                return document;
            }

            // if this Node has children, deep copy them one-by-one.
            if ( source.childNodes && source.childNodes.length ) {
                for ( var i: number = 0; i < source.childNodes.length; i++ ) {
                    var childCopy = deepCopy(source.childNodes[i]);
                    result.appendChild(childCopy);
                }
            }
        }
    });

}