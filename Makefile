
TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS)


TSFILES = $(wildcard *.ts)

help:
	@echo "make help | clean | all | $(TARGETS:%=% |) ..."

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map

all: html ajax ansi offline

html ajax ansi offline: %: shrdlite-%.js

%.js: %.ts $(TSFILES)
	tsc --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
