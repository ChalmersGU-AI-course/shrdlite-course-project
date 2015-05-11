
TARGETS = html ajax ansi offline

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS) run


TSFILES = $(wildcard *.ts)

help:
	@echo "make help | clean | all | $(TARGETS:%=% |) ..."

clean:
	rm -f $(TSFILES:%.ts=%.js) *.map

all: $(TARGETS)

$(TARGETS): %: shrdlite-%.js

%.js: %.ts $(TSFILES)
	tsc --out $@ $<

grammar.js: grammar.ne
	nearleyc $< > $@

run: offline
	# node shrdlite-offline.js small "grasp the yellow box"
	# node shrdlite-offline.js small "put the blue table on a box"
	# node shrdlite-offline.js small "put the blue table on the red box"
	# node shrdlite-offline.js small "put the white ball on the white ball"
	node shrdlite-offline.js small "put the blue box in the red box"
