// Temporary fallback to test image upload without BLOB storage
// This will help identify if the issue is with BLOB storage or something else

const fs = require('fs');
const path = require('path');

// Simple file-based image storage (temporary)
function storeImageAsFile(file, itemId, type = 'inventory') {
  try {
    const uploadDir = path.join(__dirname, 'uploads', type);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filename = `${type}-${itemId}-${Date.now()}.jpg`;
    const filepath = path.join(uploadDir, filename);
    
    // Copy the uploaded file
    fs.copyFileSync(file.path, filepath);
    
    // Clean up the temp file
    fs.unlinkSync(file.path);
    
    console.log(`✅ Image stored as file: ${filepath}`);
    return `/uploads/${type}/${filename}`;
  } catch (error) {
    console.error('❌ Error storing image as file:', error);
    throw error;
  }
}

// Test function
async function testImageStorage() {
  console.log('🧪 Testing image storage...');
  
  // Create a test image buffer
  const testImageData = Buffer.from('test image data for debugging');
  
  // Test file storage
  try {
    const testFile = {
      path: path.join(__dirname, 'temp-test.jpg'),
      mimetype: 'image/jpeg'
    };
    
    // Write test data to temp file
    fs.writeFileSync(testFile.path, testImageData);
    
    const result = storeImageAsFile(testFile, 'test123', 'test');
    console.log('✅ File storage test successful:', result);
    
    // Clean up
    if (fs.existsSync(testFile.path)) {
      fs.unlinkSync(testFile.path);
    }
    
  } catch (error) {
    console.error('❌ File storage test failed:', error);
  }
}

module.exports = { storeImageAsFile, testImageStorage };

// Run test if this file is executed directly
if (require.main === module) {
  testImageStorage();
} 