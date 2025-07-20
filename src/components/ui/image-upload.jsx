import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { toast } from './use-toast';
import { Upload, X, Image, Loader2, CheckCircle } from 'lucide-react';

const ImageUpload = ({ 
  onUpload, 
  multiple = false, 
  maxFiles = 5,
  maxSize = 10, // MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  showPreview = true,
  optimizationOptions = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 80,
    formats: ['webp', 'jpeg'],
    thumbnail: true
  }
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSize}MB limit.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles));
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      const formData = new FormData();
      
      if (multiple) {
        files.forEach(file => {
          formData.append('images', file);
        });
      } else {
        formData.append('image', files[0]);
      }

      // Add optimization options
      Object.entries(optimizationOptions).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, value.join(','));
        } else {
          formData.append(key, value.toString());
        }
      });

      const token = localStorage.getItem('moonland_token');
      const response = await fetch(
        multiple ? '/api/upload/images' : '/api/upload/image',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Upload successful",
          description: result.message
        });

        if (onUpload) {
          onUpload(result.data);
        }

        setFiles([]);
        setUploadProgress({});
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/10');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/10');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/10');
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const event = { target: { files: imageFiles } };
      handleFileSelect(event);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <div
        className="border-2 border-dashed border-amber-800/50 rounded-lg p-6 text-center hover:border-amber-600/50 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-amber-600 mb-4" />
        <div className="text-amber-200">
          <p className="text-lg font-medium">
            {multiple ? 'Drop images here or click to select' : 'Drop an image here or click to select'}
          </p>
          <p className="text-sm text-amber-300/70 mt-2">
            Supports: JPEG, PNG, WebP, GIF (Max {maxSize}MB each)
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-100">
              Selected Files ({files.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-amber-950/20 rounded-lg border border-amber-800/30"
                >
                  <div className="flex items-center space-x-3">
                    <Image className="h-8 w-8 text-amber-500" />
                    <div>
                      <p className="text-amber-100 font-medium">{file.name}</p>
                      <p className="text-amber-300/70 text-sm">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={uploadFiles}
                disabled={uploading}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {files.length} {files.length === 1 ? 'Image' : 'Images'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Info */}
      <Card className="bg-amber-950/10 border-amber-800/30">
        <CardHeader>
          <CardTitle className="text-amber-100 text-sm">
            Optimization Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-amber-300/70">Max Size</Label>
              <p className="text-amber-100">
                {optimizationOptions.maxWidth} × {optimizationOptions.maxHeight}px
              </p>
            </div>
            <div>
              <Label className="text-amber-300/70">Quality</Label>
              <p className="text-amber-100">{optimizationOptions.quality}%</p>
            </div>
            <div>
              <Label className="text-amber-300/70">Formats</Label>
              <p className="text-amber-100">
                {optimizationOptions.formats.join(', ').toUpperCase()}
              </p>
            </div>
            <div>
              <Label className="text-amber-300/70">Thumbnail</Label>
              <p className="text-amber-100">
                {optimizationOptions.thumbnail ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUpload; 