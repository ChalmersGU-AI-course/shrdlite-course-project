
TARGETS = html ajax ansi offline
OWN     = AStar

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS)


TSFILES = $(wildcard *.ts)

help:
	@echo "make help | clean | all | $(TARGETS:%=% |) ..."

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map

all: $(TARGETS) $(OWN)


$(TARGETS): %: shrdlite-%.js
$(OWN)    : %: %.js

%.js: %.ts $(TSFILES)
	tsc --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
