TARGETS = Test

TSFILES = $(wildcard *.ts)

$(TARGETS): %: graphRandom%.js

%.js: %.ts $(TSFILES)
	tsc --out $@ $<
