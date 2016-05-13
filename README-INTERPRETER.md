We implemented the function interpretCommand in Interpreter.ts, and changed nothing else.

The implementation passes all 13 standard tests as well as the extra 3 tests for the ALL quantifier.
One thing to note here is that the real "magic" happens in the inner function getEntities, which returns
all entities in the world that fulfills a specific condition. This function is implemented recursively
to be able to handle more complex conditions. The rest of the implementation is pretty straight forward.
