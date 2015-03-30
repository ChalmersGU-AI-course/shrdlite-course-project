export PATH := node_modules/.bin:$(PATH)

TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS)


DIST = dist
SOURCE = src
TSFILES = $(wildcard $(SOURCE)/*.ts)

help:
	@echo "make help | clean | all | start | $(TARGETS:%=% |) ..."

clean:
	rm -f $(DIST)/*.js

all: node_modules $(TARGETS)

$(TARGETS): %: $(DIST)/shrdlite-%.js $(DIST)/grammar.js

$(DIST)/%.js: $(SOURCE)/%.ts $(TSFILES)
	tsc --out $@ $<

$(DIST)/grammar.js: $(SOURCE)/grammar.ne
	nearleyc $< > $@

node_modules:
	npm install

start: all
	python -m SimpleHTTPServer 8000
