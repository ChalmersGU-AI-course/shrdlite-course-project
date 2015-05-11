export PATH := node_modules/.bin:$(PATH)

TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS) start run_example FORCE

DIST = dist
SOURCE = src
TSFILES = $(wildcard $(SOURCE)/*.ts)

FORCE:

help:
	@echo "make help | clean | all | start | $(TARGETS:%=% |) ..."

clean:
	rm -f $(DIST)/*.js

all: $(TARGETS)

start: all
	python -m SimpleHTTPServer 8000

# start-offline: all
# 	node dist/shrdlite-offline.js complex 3

run_example: $(DIST)/astar_example.js FORCE
	node --harmony dist/astar_example.js

$(TARGETS): %: $(DIST)/shrdlite-%.js $(DIST)/grammar.js $(DIST)/AStar.js

$(DIST)/%.js: $(SOURCE)/%.ts $(TSFILES)
	tsc --out $@ $<

$(DIST)/grammar.js: $(SOURCE)/grammar.ne
	nearleyc $< > $@

$(DIST)/astar_example.js: test/astar_example.ts $(TSFILES)
	tsc --out $@ $<
