#!/bin/bash

parts[1]="js-template/Parser.js"
parts[2]="js-template/Interpreter.js"
parts[3]="js-template/Shrdlite.js"

path="js-template/"
files[0]="shrdlite-offline.js"
files[1]="shrdlite-ansi.js"
files[2]="shrdlite-html.js"

ajax="shrdlite-ajax.js"
coffee[0]="Planner.coffee"
coffee[1]="Astar.coffee"
#coffee[2]="Interpreter.coffee"

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
  for cf in ${coffee[*]}
  do
    coffee --compile -p -b $cf >> $file
  done
  cat $path$file >> $file
 
done

