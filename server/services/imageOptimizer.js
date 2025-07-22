import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

class ImageOptimizer {
  constructor() {
    this.uploadDir = 'uploads';
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  // Optimize image with multiple formats and sizes
  async optimizeImage(file, options = {}) {
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 80,
      formats = ['webp', 'jpeg'],
      thumbnail = true
    } = options;

    const originalName = path.parse(file.originalname).name;
    const results = {};

    try {
      // Process original image
      let image = sharp(file.buffer);

      // Get image metadata
      const metadata = await image.metadata();
      
      // Resize if needed
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        image = image.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Generate different formats
      for (const format of formats) {
        const filename = `${originalName}_${uuidv4().slice(0, 8)}.${format}`;
        const filepath = path.join(this.uploadDir, filename);

        let processedImage = image.clone();

        switch (format) {
          case 'webp':
            processedImage = processedImage.webp({ quality });
            break;
          case 'jpeg':
            processedImage = processedImage.jpeg({ 
              quality,
              progressive: true,
              mozjpeg: true
            });
            break;
          case 'png':
            processedImage = processedImage.png({ 
              quality,
              progressive: true,
              compressionLevel: 9
            });
            break;
          case 'avif':
            processedImage = processedImage.avif({ quality });
            break;
        }

        await processedImage.toFile(filepath);
        
        // Get file stats
        const stats = await fs.stat(filepath);
        
        results[format] = {
          filename,
          filepath,
          size: stats.size,
          url: `/uploads/${filename}`,
          format
        };
      }

      // Generate thumbnail if requested
      if (thumbnail) {
        const thumbnailFilename = `${originalName}_thumb_${uuidv4().slice(0, 8)}.webp`;
        const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);

        await image
          .resize(200, 200, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 70 })
          .toFile(thumbnailPath);

        const thumbStats = await fs.stat(thumbnailPath);
        results.thumbnail = {
          filename: thumbnailFilename,
          filepath: thumbnailPath,
          size: thumbStats.size,
          url: `/uploads/${thumbnailFilename}`,
          format: 'webp'
        };
      }

      // Get original file size for comparison
      const originalSize = file.size;
      const optimizedSize = results.webp?.size || results.jpeg?.size || originalSize;
      const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

      results.metadata = {
        originalSize,
        optimizedSize,
        compressionRatio: `${compressionRatio}%`,
        dimensions: {
          width: metadata.width,
          height: metadata.height
        }
      };

      return {
        success: true,
        data: results
      };

    } catch (error) {
      console.error('Image optimization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Optimize multiple images
  async optimizeMultipleImages(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      const result = await this.optimizeImage(file, options);
      results.push({
        originalName: file.originalname,
        ...result
      });
    }

    return results;
  }

  // Delete image files
  async deleteImage(filename) {
    try {
      const filepath = path.join(this.uploadDir, filename);
      await fs.unlink(filepath);
      return { success: true };
    } catch (error) {
      console.error('Delete image error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get image info
  async getImageInfo(filepath) {
    try {
      const image = sharp(filepath);
      const metadata = await image.metadata();
      const stats = await fs.stat(filepath);
      
      return {
        success: true,
        data: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: stats.size,
          channels: metadata.channels,
          hasAlpha: metadata.hasAlpha
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create image variants for different use cases
  async createImageVariants(file, variants = {}) {
    const defaultVariants = {
      small: { width: 300, height: 300, quality: 70 },
      medium: { width: 600, height: 600, quality: 80 },
      large: { width: 1200, height: 1200, quality: 85 },
      ...variants
    };

    const results = {};
    const originalName = path.parse(file.originalname).name;

    for (const [variantName, config] of Object.entries(defaultVariants)) {
      const filename = `${originalName}_${variantName}_${uuidv4().slice(0, 8)}.webp`;
      const filepath = path.join(this.uploadDir, filename);

      try {
        await sharp(file.buffer)
          .resize(config.width, config.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: config.quality })
          .toFile(filepath);

        const stats = await fs.stat(filepath);
        results[variantName] = {
          filename,
          filepath,
          size: stats.size,
          url: `/uploads/${filename}`,
          dimensions: { width: config.width, height: config.height }
        };
      } catch (error) {
        console.error(`Error creating ${variantName} variant:`, error);
      }
    }

    return results;
  }
}

export default new ImageOptimizer(); 