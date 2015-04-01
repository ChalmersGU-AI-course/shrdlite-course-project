
TARGETS = TestCircularGraph TestCircularNoEnd TestGraph TestLinear TestMultipleEnds TestNoPathToEnd TestAStar

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
TSC = C:/Users/David/AppData/Roaming/npm/tsc
else
#Linux stuff
TSC = tsc
endif

$(TARGETS): %:
	$(TSC) --out dist/$@.js $@.ts
	cd dist; node $@.js > $@.log
	cd dist; cat $@.log
