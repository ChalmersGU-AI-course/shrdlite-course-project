
TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS)

ifeq ($(OS),Windows_NT)
#Windows stuff
TSC = C:/Users/David/AppData/Roaming/npm/tsc
else
#Linux stuff
TSC = tsc
endif


TSFILES = $(wildcard *.ts)

help:
	@echo "make help | clean | all | $(TARGETS:%=% |) ..."

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map

all: $(TARGETS)

$(TARGETS): %: shrdlite-%.js

%.js: %.ts $(TSFILES)
	$(TSC) --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@
