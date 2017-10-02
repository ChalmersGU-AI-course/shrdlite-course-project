TSC = ./node_modules/.bin/tsc


TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS)


TSFILES = World.ts Parser.ts Constrains.ts Searcher.ts Interpreter.ts InnerWorld.ts Planner.ts SVGWorld.ts Shrdlite.ts ExampleWorlds.ts

help:
	@echo "make help | clean | all | $(TARGETS:%=% |) ..."

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map
	rm -f generated_code/*

all: $(TARGETS)

$(TARGETS): %: generated_code/collections.js $(addprefix generated_code/, $(addsuffix .js, $(basename $(TSFILES)))) generated_code/shrdlite-%.js


generated_code/collections.js: lib/collections.ts
	$(TSC) --out $@ lib/collections.ts

generated_code/%.js: %.ts $(TSFILES)
	$(TSC) --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
