
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

# Make TypeScript as strict as possible:
TSC = tsc --noFallthroughCasesInSwitch --noImplicitReturns --noImplicitAny

aStarTests: Graph.ts Test.ts
	$(TSC) --out Test.js Graph.ts Test.ts
	node Test.js

%.js: %.ts $(TSFILES)
	$(TSC) --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
