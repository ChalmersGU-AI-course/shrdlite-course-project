
TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all doc

TSFILES = $(wildcard *.ts)

help:
	@echo "make help | clean | all | aStarTests | shrdlite-html.js | shrdlite-offline.js"

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map
	rm -rf doc

doc:
	typedoc --name Shrdlite --out doc .

all: shrdlite-html.js shrdlite-offline.js

aStarTests: TestAStar.js
	node $< all

# Make TypeScript as strict as possible:
TSC = tsc --noFallthroughCasesInSwitch --noImplicitReturns --noImplicitAny

%.js: %.ts $(TSFILES)
	$(TSC) --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
