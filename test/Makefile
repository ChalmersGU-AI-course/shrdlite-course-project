
TARGETS = TestCircularGraph TestMultipleEnds TestNoPathToEnd Test

.DELETE_ON_ERROR:

.PHONY: help clean all $(TARGETS)

dist:
	mkdir dist

help:
	@echo "make help | clean | all | $(TARGETS:%=% |) ..."

clean:
	rm -f *js
	rm -rf dist

all: $(TARGETS)

ifeq ($(OS),Windows_NT)
#Windows stuff
else
#Linux stuff
TSC = tsc
endif

$(TARGETS): %:
	$(TSC) --out dist/$@.js $@.ts
	cd dist; node $@.js > $@.log
	cd dist; cat $@.log
