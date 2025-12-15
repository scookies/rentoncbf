#!/usr/bin/env node

/**
 * Auto-Update Fair Images Script
 * 
 * This script automatically scans the fair image folders and updates all data files
 * to include the new images. Run this whenever you add new images to fair folders.
 * 
 * Usage: node update-fair-images.js
 * 
 * The script will:
 * 1. Scan images/midWinterFair/, images/summerFair/, images/preHolidayMarket/
 * 2. Find all image files (jpg, jpeg, png, webp)
 * 3. Update data/fair-images.json
 * 4. Update js/data/fair-images-data.js
 * 5. Update js/modules/fair-carousel.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const FAIR_FOLDERS = {
    'midWinterFair': 'Mid Winter Fair',
    'summerFair': 'Summer Fair',
    'preHolidayMarket': 'Pre-Holiday Market'
};

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const IMAGES_DIR = 'images';

/**
 * Get all image files from a directory
 */
function getImageFiles(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        return files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return IMAGE_EXTENSIONS.includes(ext);
            })
            .filter(file => !file.startsWith('.')) // Exclude hidden files like .DS_Store
            .sort()
            .map(file => `images/${path.basename(dirPath)}/${file}`);
    } catch (error) {
        console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
        return [];
    }
}

/**
 * Scan all fair directories for images
 */
function scanFairImages() {
    const fairImages = {};
    
    for (const [folderName, displayName] of Object.entries(FAIR_FOLDERS)) {
        const dirPath = path.join(IMAGES_DIR, folderName);
        const images = getImageFiles(dirPath);
        
        if (images.length > 0) {
            fairImages[folderName] = images;
            console.log(`✅ Found ${images.length} images in ${displayName}:`);
            images.forEach(img => console.log(`   - ${img}`));
        } else {
            console.log(`⚠️  No images found in ${displayName} (${dirPath})`);
            fairImages[folderName] = [];
        }
    }
    
    return fairImages;
}

/**
 * Update data/fair-images.json
 */
function updateJsonFile(fairImages) {
    const jsonPath = 'data/fair-images.json';
    const jsonData = {
        fairImages: fairImages
    };
    
    try {
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log(`✅ Updated ${jsonPath}`);
    } catch (error) {
        console.error(`❌ Failed to update ${jsonPath}:`, error.message);
    }
}

/**
 * Update js/data/fair-images-data.js
 */
function updateJavaScriptDataFile(fairImages) {
    const jsPath = 'js/data/fair-images-data.js';
    
    const jsContent = `window.FairImagesData = ${JSON.stringify({ fairImages }, null, 2)};`;
    
    try {
        fs.writeFileSync(jsPath, jsContent);
        console.log(`✅ Updated ${jsPath}`);
    } catch (error) {
        console.error(`❌ Failed to update ${jsPath}:`, error.message);
    }
}

/**
 * Update js/modules/fair-carousel.js
 */
function updateCarouselModule(fairImages) {
    const modulePath = 'js/modules/fair-carousel.js';
    
    try {
        let content = fs.readFileSync(modulePath, 'utf8');
        
        // Create the new imageMap object
        const imageMapEntries = Object.entries(fairImages).map(([folderName, images]) => {
            const imagesList = images.map(img => `                '${img}'`).join(',\n');
            return `            '${folderName}': [\n${imagesList}\n            ]`;
        });
        
        const newImageMap = `        const imageMap = {\n${imageMapEntries.join(',\n')}\n        };`;
        
        // Replace the imageMap in the getExistingImages method
        const regex = /const imageMap = \{[\s\S]*?\};/;
        
        if (regex.test(content)) {
            content = content.replace(regex, newImageMap);
            fs.writeFileSync(modulePath, content);
            console.log(`✅ Updated ${modulePath}`);
        } else {
            console.warn(`⚠️  Could not find imageMap in ${modulePath} - manual update may be needed`);
        }
        
    } catch (error) {
        console.error(`❌ Failed to update ${modulePath}:`, error.message);
    }
}

/**
 * Main execution
 */
function main() {
    console.log('🔄 Scanning fair image directories...');
    console.log('');
    
    // Scan for images
    const fairImages = scanFairImages();
    console.log('');
    
    // Update all data files
    console.log('📝 Updating data files...');
    updateJsonFile(fairImages);
    updateJavaScriptDataFile(fairImages);
    updateCarouselModule(fairImages);
    
    console.log('');
    console.log('🎉 Fair image update complete!');
    console.log('');
    console.log('📋 Summary:');
    Object.entries(fairImages).forEach(([folderName, images]) => {
        const displayName = FAIR_FOLDERS[folderName];
        console.log(`   ${displayName}: ${images.length} images`);
    });
}

// Run the script
if (require.main === module) {
    main();
}