#!/bin/bash

echo "[+] Updating three.js imports..."

# Path setup
VENDOR_DIR="js/vendor"
MODULE_PATH="./js/vendor/three.module.js"

# Update imports in custom JS files (not in vendor)
find . -type f -name "*.js" ! -path "./js/vendor/*" -exec sed -i "s|from ['\"]three['\"]|from '${MODULE_PATH}'|g" {} +

# Update vendor helpers
for file in OrbitControls.js FontLoader.js TextGeometry.js; do
    TARGET="${VENDOR_DIR}/${file}"
    if [[ -f "$TARGET" ]]; then
        echo "  ↪ Patching $file..."
        sed -i "s|from ['\"]three['\"]|from '${MODULE_PATH}'|g" "$TARGET"
    else
        echo "  ⚠️  $file not found in $VENDOR_DIR"
    fi
done

echo "[✓] All three.js imports updated to use relative paths."