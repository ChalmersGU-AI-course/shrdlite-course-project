The Shrdlite course project
============================

Roadmap
--------------------------
#### A* planner (due **30. April**)
- [x] The planner should at least be an A* search forward planner, using some kind of heuristics.

#### Natural language interpreter (due **14. May**)
- [ ] It must obey all requirements of the world, in particular the [physical laws](http://chalmersgu-ai-course.github.io/shrdlite.html#physical-laws) and the [spatial relations](http://chalmersgu-ai-course.github.io/shrdlite.html#spatial-relations).

- [ ] It must try to disambiguate ambiguous utterances by interpreting each parse tree in the current world. If there are several possible meaningful parse trees, it must at least fail by saying that the utterance is ambiguous.

- [ ] It must translate a meaningful parse tree into a goal in a logical representation.

- [ ] It does not have to handle the plural all quantifier, and it may use the same meaning for the as the singular any.

- [ ] It must be able to plan a command sequence that solves a goal in a small world (such as the one described [here](http://chalmersgu-ai-course.github.io/shrdlite.html#interpreting-the-parse-results)), still obeying the physical laws.

#### Extensions and final tweaks (due **28. May**)
Possible extensions:

- To be able to handle all quantifiers in a sensible manner.

- To ask the user clarification questions when the utterance is ambiguous, e.g. “do you mean the large red pyramid or the small green?”

- To implement another planning algorithm than A*, e.g., a planner that handle larger worlds and more complicated goals.

- To make the planner describe what it is doing, in a way that is understandable to humans. One important part of this will be to know how to describe the different objects in concise way. (E.g., if there is only one ball, then you don’t have to say that it is white.)
- To add new linguistic structures to the grammar, such as:
  - user questions (e.g., “where is the white ball?”)
  - complex commands (e.g., “stack up all red bricks”)
  - anaphoric references (e.g., “put the red brick under the green one”)
- Or something else, but talk to the supervisor first!



Build Info
--------------------------

There is a Makefile if you want to use the GNU Make system. Here's what it can do:

- `make clean`: Removes all auto-generated Javascript files
- `make all`: Calls TypeScript for all targets
- `make shrdlite-html.js | shrdlite-offline.js`:
  Calls TypeScript for the given target,
  i.e., it compiles the file `shrdlite-X.ts` into `shrdlite-X.js`
