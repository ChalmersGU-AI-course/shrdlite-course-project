
TARGETS = TestCircularGraph TestMultipleEnds TestNoPathToEnd Test

.DELETE_ON_ERROR:

.PHONY: help clean $(TARGETS)

dist:
	mkdir dist

help:
	@echo "make help | clean | $(TARGETS:%=% |) ..."

clean:
	rm -f *js
	rm -rf dist

all: $(TARGETS)

$(TARGETS): %:
	tsc --out dist/$@.js $@.ts
	cd dist; node $@.js > $@.log
	cd dist; cat $@.log
