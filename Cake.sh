#!/bin/bash

# The path to the files
path="js-template/"
# The different files to create
files[0]="shrdlite-offline.js"
files[1]="shrdlite-ansi.js"
files[2]="shrdlite-html.js"
files[3]="shrdlite-ajax.js"
# The parts to be compiled
coffee[0]="Planner.coffee"
coffee[1]="Astar.coffee"
coffee[2]="Interpreter.coffee"
# The old parts from typescript
parts[1]="js-template/Parser.js"
#parts[2]="js-template/Interpreter.js"
parts[3]="js-template/Shrdlite.js"

args=()
for ((i=1; i<=$#; i++)); do
   args[i]=${!i}
done
# Create the new files
for file in ${files[*]}
do
  # Remove the old file before creating a new one
  rm $file
  # Add the comiled typescript code
  for part in ${parts[*]}
  do
    if [ -f $part ]; then
      cat $part >> $file
    else
      echo "$part was not found"
    fi
  done
done
# Compile all coffeescript-files
for cf in ${coffee[*]}
do
  code="$(coffee --compile -p -b $cf)"
  for file in ${files[*]}
  do
    echo "$code" >> $file
  done
done
for file in ${files[*]}
do
  # Add the file specific code
  cat $path$file >> $file 
done


