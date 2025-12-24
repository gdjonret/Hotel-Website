#!/bin/bash

# Script to optimize room images for web/mobile
# Requires ImageMagick: brew install imagemagick

echo "Optimizing room images..."

# Function to optimize images in a directory
optimize_directory() {
    local dir=$1
    echo "Processing $dir..."
    
    for img in "$dir"/*.png; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            echo "  Optimizing $filename..."
            
            # Create backup
            cp "$img" "$img.backup"
            
            # Resize to max width 1200px and compress
            magick "$img" -resize '1200>' -quality 85 -strip "$img"
            
            # Show size reduction
            original_size=$(stat -f%z "$img.backup")
            new_size=$(stat -f%z "$img")
            reduction=$((100 - (new_size * 100 / original_size)))
            echo "    Reduced by ${reduction}% ($(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size))"
        fi
    done
}

# Optimize Deluxe room images
optimize_directory "public/images/rooms/Deluxe"

# Optimize Standard room images
optimize_directory "public/images/rooms/Standard"

echo "Done! Backups saved with .backup extension"
echo "If images look good, you can remove backups with: find public/images/rooms -name '*.backup' -delete"
