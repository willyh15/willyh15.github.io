#!/bin/bash

VENDOR_DIR="js/vendor"

echo "Replacing './three.core.js' with './three.module.js' in $VENDOR_DIR..."

find "$VENDOR_DIR" -type f -name "*.js" | while read -r file; do
  if grep -q "\.\/three\.core\.js" "$file"; then
    echo "Fixing $file"
    sed -i 's/\.\/three\.core\.js/\.\/three.module.js/g' "$file"
  fi
done

echo "Done!"