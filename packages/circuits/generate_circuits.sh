#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Create the "compiled" directory if it doesn't exist
mkdir -p compiled_circuits
cd "$DIR/circuits"

for ((i=2; i<=${1}; i += 1)); do

  echo "Generating circuits for depth $i"

  awk -v i="$i" '{ if ($0 ~ /global LEVELS: Field = [0-9]+;/) $0 = "global LEVELS: Field = " i ";"; print }' src/main.nr > tmp.nr && mv tmp.nr src/main.nr

  cp ./src/main.nr ../compiled_circuits/depth_$i.nr

  # Run nargo compile
  nargo compile

  # Assuming the generated file is always named main.json and is located in ./target
  # Copy the generated file to the "compiled" directory with a unique name for each iteration
  cp ./target/circuits.json ../compiled_circuits/depth_$i.json
done
