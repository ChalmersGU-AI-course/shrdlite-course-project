
.DELETE_ON_ERROR:

.PHONY: help clean

# Make TypeScript as strict as possible, and compile to UMD modules:
TSC = tsc --module umd --alwaysStrict --noFallthroughCasesInSwitch --noImplicitReturns --noImplicitAny --noImplicitThis

TSFILES = $(wildcard *.ts)

help:
	@echo "Usage: make test-astar.js | test-interpreter.js | shrdlite-offline.js | shrdlite-html.js"
	@echo "Usage: make clean | Grammar.ts"

%.js: %.ts $(TSFILES)
	$(TSC) $<

Grammar.ts: Grammar.ne
	nearleyc $< > $@

# Only delete JS files that have a TS counterpart:
clean:
	rm -f $(TSFILES:%.ts=%.js) *.map
