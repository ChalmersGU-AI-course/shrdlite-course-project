
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

run: shrdlite-offline.js
	# node shrdlite-offline.js small "grasp the yellow box"
	# node shrdlite-offline.js small "put the blue table on a box"
	node shrdlite-offline.js small "put the blue table above the red box"
	# node shrdlite-offline.js small "put the white ball on the white ball"
	# node shrdlite-offline.js small "put the blue box in the red box"

medium: shrdlite-offline.js
	# node shrdlite-offline.js medium "put the blue box above the red box"
	# node shrdlite-offline.js medium "put the red box below the blue box"
	node shrdlite-offline.js medium "put the green brick below the yellow pyramid"

floor: shrdlite-offline.js
	node shrdlite-offline.js medium "put the red table on the floor"
	# node shrdlite-offline.js medium "put the green brick above the floor"
