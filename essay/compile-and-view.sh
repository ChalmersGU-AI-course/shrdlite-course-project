#!/bin/bash

test -z "$1" && echo "please specify basename" && exit
test -e "$1".tex || echo "$1.tex missing"
test -e "$1".tex || exit
pdflatex "$1"
echo "wrote pdf; repeating pdflatex just to be sure"
pdflatex "$1"
echo "wrote pdf; starting viewer"
okular "$1".pdf
