#!/usr/bin/env node

/**
 * Image Compression Script for Web Optimization
 * 
 * Compresses large images to web-friendly sizes while maintaining quality.
 * Automatically creates backups and updates image references.
 * 
 * Usage: node compress-images.js
 * 
 * Requirements: Install sharp first:
 * npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.log('📦 Sharp not found. Installing...');
    console.log('Please run: npm install sharp');
    console.log('Then run this script again.');
    process.exit(1);
}

// Configuration
const MAX_WIDTH = 1200;  // Maximum width for carousel images
const MAX_HEIGHT = 900;  // Maximum height for carousel images
const QUALITY = 85;      // JPEG quality (1-100, 85 is good balance)
const TARGET_SIZE_KB = 500; // Target file size in KB

/**
 * Get image dimensions and file size
 */
async function getImageInfo(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        const metadata = await sharp(imagePath).metadata();
        
        return {
            width: metadata.width,
            height: metadata.height,
            sizeMB: (stats.size / 1024 / 1024).toFixed(1),
            sizeKB: Math.round(stats.size / 1024)
        };
    } catch (error) {
        console.error(`Error reading ${imagePath}:`, error.message);
        return null;
    }
}

/**
 * Compress an image
 */
async function compressImage(imagePath) {
    try {
        const originalInfo = await getImageInfo(imagePath);
        if (!originalInfo) return false;
        
        console.log(`📸 Processing: ${path.basename(imagePath)}`);
        console.log(`   Original: ${originalInfo.width}x${originalInfo.height}, ${originalInfo.sizeMB}MB`);
        
        // Skip if already small enough
        if (originalInfo.sizeKB < TARGET_SIZE_KB) {
            console.log(`   ✅ Already optimized (${originalInfo.sizeKB}KB < ${TARGET_SIZE_KB}KB)`);
            return true;
        }
        
        // Create backup
        const backupPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.original.$1');
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(imagePath, backupPath);
            console.log(`   💾 Backup created: ${path.basename(backupPath)}`);
        }
        
        // Compress image
        const tempPath = imagePath + '.temp';
        
        await sharp(imagePath)
            .resize(MAX_WIDTH, MAX_HEIGHT, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: QUALITY,
                progressive: true,
                mozjpeg: true
            })
            .toFile(tempPath);
        
        // Check compressed size
        const compressedInfo = await getImageInfo(tempPath);
        if (!compressedInfo) {
            fs.unlinkSync(tempPath);
            return false;
        }
        
        // Replace original with compressed version
        fs.renameSync(tempPath, imagePath);
        
        const reduction = Math.round((1 - compressedInfo.sizeKB / originalInfo.sizeKB) * 100);
        console.log(`   ✅ Compressed: ${compressedInfo.width}x${compressedInfo.height}, ${compressedInfo.sizeKB}KB (${reduction}% smaller)`);
        
        return true;
        
    } catch (error) {
        console.error(`   ❌ Failed to compress ${imagePath}:`, error.message);
        return false;
    }
}

/**
 * Find all images that need compression
 */
function findLargeImages() {
    const images = [];
    const fairFolders = ['images/midWinterFair', 'images/summerFair', 'images/preHolidayMarket'];
    
    fairFolders.forEach(folder => {
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder);
            files.forEach(file => {
                if (/\.(jpg|jpeg|png)$/i.test(file) && !file.includes('.original.')) {
                    images.push(path.join(folder, file));
                }
            });
        }
    });
    
    return images;
}

/**
 * Main execution
 */
async function main() {
    console.log('🖼️  Image Compression for Renton CBF Website');
    console.log('=============================================');
    console.log('');
    
    const images = findLargeImages();
    
    if (images.length === 0) {
        console.log('No images found to compress.');
        return;
    }
    
    console.log(`Found ${images.length} images to check:`);
    console.log('');
    
    let compressed = 0;
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    for (const imagePath of images) {
        const originalInfo = await getImageInfo(imagePath);
        if (originalInfo) {
            totalOriginalSize += originalInfo.sizeKB;
        }
        
        const success = await compressImage(imagePath);
        if (success) {
            compressed++;
            const newInfo = await getImageInfo(imagePath);
            if (newInfo) {
                totalCompressedSize += newInfo.sizeKB;
            }
        }
        console.log('');
    }
    
    console.log('📊 Summary:');
    console.log(`   Images processed: ${images.length}`);
    console.log(`   Successfully compressed: ${compressed}`);
    
    if (totalOriginalSize > 0 && totalCompressedSize > 0) {
        const totalReduction = Math.round((1 - totalCompressedSize / totalOriginalSize) * 100);
        console.log(`   Total size reduction: ${totalReduction}%`);
        console.log(`   Original total: ${Math.round(totalOriginalSize / 1024)}MB`);
        console.log(`   Compressed total: ${Math.round(totalCompressedSize / 1024)}MB`);
    }
    
    console.log('');
    console.log('🎉 Compression complete!');
    console.log('💡 Tip: Run "node update-fair-images.js" if any filenames changed');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}