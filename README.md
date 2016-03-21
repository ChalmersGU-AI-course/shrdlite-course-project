The Shrdlite course project
============================

Todo-List
--------------------------

- [ ] It must obey all requirements of the world, in particular the [physical laws](http://chalmersgu-ai-course.github.io/shrdlite.html#physical-laws) and the [spatial relations](http://chalmersgu-ai-course.github.io/shrdlite.html#spatial-relations).

- [ ] It must try to disambiguate ambiguous utterances by interpreting each parse tree in the current world. If there are several possible meaningful parse trees, it must at least fail by saying that the utterance is ambiguous.

- [ ] It must translate a meaningful parse tree into a goal in a logical representation.

- [ ] It does not have to handle the plural all quantifier, and it may use the same meaning for the as the singular any.

- [ ] It must be able to plan a command sequence that solves a goal in a small world (such as the one described [here](http://chalmersgu-ai-course.github.io/shrdlite.html#interpreting-the-parse-results)), still obeying the physical laws.

- [ ] The planner should at least be an A* search forward planner, using some kind of heuristics.


Build Info
--------------------------

There is a Makefile if you want to use the GNU Make system. Here's what it can do:

- `make clean`: Removes all auto-generated Javascript files
- `make all`: Calls TypeScript for all targets
- `make shrdlite-html.js | shrdlite-offline.js`:
  Calls TypeScript for the given target,
  i.e., it compiles the file `shrdlite-X.ts` into `shrdlite-X.js`
