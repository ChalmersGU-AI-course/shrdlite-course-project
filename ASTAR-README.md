# A* README for group: "Team Not Sure"

We do not use any auxiliary files at all, all modifications are in `Graph.ts` and nowhere else.

Our implementation of `A*` is very standard.

We use a `PriorityQueue` to enqueue nodes to visit and then dequeue the one with the lowest `f(node)` value.

Since we have access to an comparison function yielding an `Ord` (haskell parlance), a `Binary Search Tree` is now used instead of a hashed set. It was not realized until after our first submission that there was such a data structure already implemented in the collections library.

Using a `HashMap` (dictionary) should be about as fast as not using it,
but it was mentally simpler to implement. Unfortunately, the collections `HashMap` does not use `ES6` `Map`s and rather rely on `Object.toString()` as the hashing function which yields subpar performance. However, it would be very simple to just use the memory address as a hasing function instead and this would yield better performance. Allocating new objects in a GCed language such as `ES6` (`ECMAScript 6 == Javascript`) is not free.

Using `continue` in loops might not be pretty, but you don't refactor incomplete and buggy solutions. Only when a solution works should refactoring be done.