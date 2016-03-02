
TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all 

TSFILES = $(wildcard *.ts)

help:
	@echo "make help | clean | all | shrdlite-html.js | shrdlite-offline.js"

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map

all: shrdlite-html.js shrdlite-offline.js

# Make TypeScript as strict as possible:
TSC = tsc --noFallthroughCasesInSwitch --noImplicitReturns --noImplicitAny

%.js: %.ts $(TSFILES)
	$(TSC) --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
