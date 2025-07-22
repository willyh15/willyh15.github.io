#!/bin/bash

VENDOR_DIR="js/vendor"

echo "Fixing 'three.core.js' references to 'three.module.js' in $VENDOR_DIR..."

# Find all .js files in vendor folder
find "$VENDOR_DIR" -type f -name "*.js" | while read -r file; do
  if grep -q "three.core.js" "$file"; then
    echo "Fixing $file"
    # Use sed to replace 'three.core.js' with 'three.module.js' in-place (Linux version)
    sed -i 's/three\.core\.js/three.module.js/g' "$file"
  fi
done

echo "Done!"