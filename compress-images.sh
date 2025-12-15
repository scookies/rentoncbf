#!/bin/bash

# Image Compression Script for macOS (using built-in tools)
# Compresses large images to web-friendly sizes
# 
# Usage: bash compress-images.sh
#
# This script uses macOS built-in 'sips' command (no additional software needed)

echo "🖼️  Image Compression for Renton CBF Website"
echo "============================================="
echo ""

# Configuration
MAX_WIDTH=1200
MAX_HEIGHT=900
QUALITY=85

# Function to get file size in KB
get_size_kb() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local size_bytes=$(stat -f%z "$file")
        echo $((size_bytes / 1024))
    else
        echo "0"
    fi
}

# Function to compress a single image
compress_image() {
    local image_path="$1"
    local filename=$(basename "$image_path")
    
    echo "📸 Processing: $filename"
    
    # Get original size
    local original_size_kb=$(get_size_kb "$image_path")
    echo "   Original size: ${original_size_kb}KB"
    
    # Skip if already small enough (under 500KB)
    if [[ $original_size_kb -lt 500 ]]; then
        echo "   ✅ Already optimized (under 500KB)"
        echo ""
        return 0
    fi
    
    # Create backup if it doesn't exist
    local backup_path="${image_path%.*}.original.${image_path##*.}"
    if [[ ! -f "$backup_path" ]]; then
        cp "$image_path" "$backup_path"
        echo "   💾 Backup created: $(basename "$backup_path")"
    fi
    
    # Get original dimensions
    local original_info=$(sips -g pixelWidth -g pixelHeight "$image_path" 2>/dev/null)
    local original_width=$(echo "$original_info" | grep "pixelWidth" | awk '{print $2}')
    local original_height=$(echo "$original_info" | grep "pixelHeight" | awk '{print $2}')
    
    echo "   Original dimensions: ${original_width}x${original_height}"
    
    # Calculate new dimensions (maintain aspect ratio)
    local scale_factor=1
    if [[ $original_width -gt $MAX_WIDTH ]] || [[ $original_height -gt $MAX_HEIGHT ]]; then
        local width_scale=$(echo "scale=4; $MAX_WIDTH / $original_width" | bc -l)
        local height_scale=$(echo "scale=4; $MAX_HEIGHT / $original_height" | bc -l)
        
        # Use the smaller scale factor to maintain aspect ratio
        if (( $(echo "$width_scale < $height_scale" | bc -l) )); then
            scale_factor=$width_scale
        else
            scale_factor=$height_scale
        fi
    fi
    
    local new_width=$(echo "scale=0; $original_width * $scale_factor / 1" | bc)
    local new_height=$(echo "scale=0; $original_height * $scale_factor / 1" | bc)
    
    # Compress the image
    sips -Z $new_width --setProperty formatOptions $QUALITY "$image_path" >/dev/null 2>&1
    
    if [[ $? -eq 0 ]]; then
        local new_size_kb=$(get_size_kb "$image_path")
        local reduction=$(echo "scale=0; (1 - $new_size_kb / $original_size_kb) * 100 / 1" | bc)
        
        echo "   ✅ Compressed: ${new_width}x${new_height}, ${new_size_kb}KB (${reduction}% smaller)"
    else
        echo "   ❌ Failed to compress"
    fi
    
    echo ""
}

# Find and process all fair images
total_processed=0
for folder in "images/midWinterFair" "images/summerFair" "images/preHolidayMarket"; do
    if [[ -d "$folder" ]]; then
        echo "📁 Processing folder: $folder"
        
        # Process JPEG and JPG files (skip .original. files)
        for image in "$folder"/*.jpeg "$folder"/*.jpg "$folder"/*.JPEG "$folder"/*.JPG; do
            if [[ -f "$image" ]] && [[ ! "$image" =~ \.original\. ]]; then
                compress_image "$image"
                ((total_processed++))
            fi
        done
    fi
done

echo "📊 Summary:"
echo "   Total images processed: $total_processed"
echo ""
echo "🎉 Compression complete!"
echo "💡 Run 'node update-fair-images.js' to update data files"
echo "💡 Run 'git add . && git commit -m \"Compress images for web\"' to commit changes"