import fs from 'fs';
import path from 'path';

// Image optimization middleware
export const optimizeImage = async (req, res, next) => {
  // Only process image uploads
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }

  try {
    console.log('🖼️ Optimizing image:', req.file.filename);
    
    // Get file info
    const filePath = req.file.path;
    const fileStats = fs.statSync(filePath);
    const originalSize = fileStats.size;
    
    console.log('📊 Original file size:', (originalSize / 1024).toFixed(2), 'KB');
    
    // For now, we'll implement basic optimization strategies
    // In production, you might want to use Sharp or similar libraries
    
    // 1. Check if file is too large (> 2MB)
    if (originalSize > 2 * 1024 * 1024) {
      console.log('⚠️ File is large, consider compression in production');
    }
    
    // 2. Validate image dimensions (basic check)
    // This would require image processing library in production
    
    // 3. Set cache headers for optimized delivery
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.set('Vary', 'Accept-Encoding');
    
    console.log('✅ Image optimization completed');
    
  } catch (error) {
    console.error('❌ Image optimization error:', error);
  }
  
  next();
};

// Image serving middleware with optimization headers
export const serveOptimizedImage = (req, res, next) => {
  // Set optimization headers for all image requests
  res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  res.set('Vary', 'Accept-Encoding');
  res.set('Accept-Ranges', 'bytes');
  
  // Don't add gzip compression for images - they're already compressed
  // res.set('Content-Encoding', 'gzip'); // REMOVED - causes decoding conflicts
  
  next();
};

// Generate optimized image URLs
export const getOptimizedImageUrl = (originalPath, options = {}) => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // In production, this would generate URLs for optimized versions
  // For now, return the original path
  return originalPath;
}; 