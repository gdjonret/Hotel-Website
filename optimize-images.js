const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImage(imagePath) {
    try {
        const stats = fs.statSync(imagePath);
        const originalSize = stats.size;
        
        console.log(`Optimizing ${path.basename(imagePath)}...`);
        
        // Create backup
        fs.copyFileSync(imagePath, `${imagePath}.backup`);
        
        // Optimize: resize to max 1200px width, convert to JPEG with 85% quality
        await sharp(imagePath)
            .resize(1200, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({ quality: 85, progressive: true })
            .toFile(imagePath.replace('.png', '.jpg'));
        
        // Remove original PNG
        fs.unlinkSync(imagePath);
        
        // Rename optimized JPG to original name (but keep .jpg extension)
        const newPath = imagePath.replace('.png', '.jpg');
        
        const newStats = fs.statSync(newPath);
        const newSize = newStats.size;
        const reduction = Math.round((1 - newSize / originalSize) * 100);
        
        console.log(`  ✓ Reduced by ${reduction}% (${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB)`);
        
        return newPath;
    } catch (error) {
        console.error(`  ✗ Error optimizing ${imagePath}:`, error.message);
    }
}

async function optimizeDirectory(dirPath) {
    console.log(`\nProcessing ${dirPath}...`);
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        if (file.endsWith('.png') && !file.includes('.backup')) {
            await optimizeImage(path.join(dirPath, file));
        }
    }
}

async function main() {
    console.log('Starting image optimization...\n');
    
    await optimizeDirectory('public/images/rooms/Deluxe');
    await optimizeDirectory('public/images/rooms/Standard');
    
    console.log('\n✓ Done! Backups saved with .backup extension');
    console.log('If images look good, remove backups with: find public/images/rooms -name "*.backup" -delete');
}

main().catch(console.error);
