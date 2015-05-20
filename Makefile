
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
	# node shrdlite-offline.js small "put the blue table above the red box"
	# node shrdlite-offline.js small "put the white ball on the white ball"
	# node shrdlite-offline.js small "put the blue box in the red box"
	# node shrdlite-offline.js small "put the red box on the floor"
	# node shrdlite-offline.js small "put the table below the blue box"
	# node shrdlite-offline.js small "move the blue table beside the yellow box" # tests 'beside'
	# node shrdlite-offline.js small "put the blue table right of the blue box" # tests 'right of'
	# node shrdlite-offline.js small "put the yellow box left of the blue box" # tests 'left of'
	# node shrdlite-offline.js small "put the blue table below the blue box"
	node shrdlite-offline.js small "put a table below the blue box"

medium: shrdlite-offline.js
	# node shrdlite-offline.js medium "put the blue box above the red box"
	# node shrdlite-offline.js medium "put the red box below the blue box"
	# node shrdlite-offline.js medium "put the green brick below the yellow pyramid"

bug: shrdlite-offline.js
	node shrdlite-offline.js medium "put the red plank beside the green plank"
	# node shrdlite-offline.js medium "put the red plank right of the red table"

floor: shrdlite-offline.js
	node shrdlite-offline.js medium "put the red table on the floor"
	# node shrdlite-offline.js medium "put the green brick above the floor"
