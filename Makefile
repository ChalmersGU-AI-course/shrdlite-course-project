
TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS)


TSFILES = $(wildcard *.ts)

help:
	@echo "make help | clean | all | $(TARGETS:%=% |) ..."

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map

astar:
	tsc -target ES5 --out astar.js astar.ts

all: $(TARGETS)

$(TARGETS): %: shrdlite-%.js

%.js: %.ts $(TSFILES)
	tsc --target es5 --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
