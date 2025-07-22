#!/bin/bash

# Base path to your local three.module.js relative to JS files
THREE_REL_PATH="./vendor/three.module.js"

echo "Replacing bare 'three' imports with '$THREE_REL_PATH' in all .js files..."

# Find all .js files recursively
find . -type f -name "*.js" | while read -r file; do
  if grep -q "from ['\"]three['\"]" "$file"; then
    echo "Fixing imports in $file"
    # Replace import lines like: import ... from 'three';
    sed -i "s/from ['\"]three['\"]/from '$THREE_REL_PATH'/g" "$file"
  fi
done

echo "Done!"