#!/bin/bash

#parts[0]="js-template/Planner.js"
parts[1]="js-template/Parser.js"
parts[2]="js-template/Interpreter.js"
parts[3]="js-template/Shrdlite.js"

path="js-template/"
files[0]="shrdlite-offline.js"
files[1]="shrdlite-ansi.js"
files[2]="shrdlite-html.js"

ajax="shrdlite-ajax.js"
plan="Planner.coffee"
interpreter="Interpreter.coffee"

make clean
cp $path$ajax $ajax

for file in ${files[*]}
do
  rm $file
  for part in ${parts[*]}
  do
    if [ -f $part ]; then
      cat $part >> $file
    else
      echo "$part was not found"
    fi
  done
  coffee --compile -p -b Planner.coffee >> $file
  cat $path$file >> $file
done

