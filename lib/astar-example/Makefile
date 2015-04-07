TARGETS = Test

TSFILES = $(wildcard *.ts)

$(TARGETS): %: graph%.js

%.js: %.ts $(TSFILES)
	tsc --out $@ $<
