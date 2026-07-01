import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { API_URL } from '../../config';

export default function ImageDropzone({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed!');
      return;
    }
    
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds the 3MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      onChange(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        Product Image
      </label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden",
          isDragging ? "border-vybe-neon bg-vybe-neon/5" : "border-gray-600 bg-vybe-dark hover:border-gray-500 hover:bg-vybe-glass"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleChange}
          accept="image/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <Loader2 className="w-8 h-8 mb-3 animate-spin text-vybe-neon" />
            <p className="mb-1 text-sm font-semibold text-white">Uploading...</p>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                type="button"
                onClick={clearImage}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-transform hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <UploadCloud className={clsx("w-8 h-8 mb-3 transition-colors", isDragging && "text-vybe-neon")} />
            <p className="mb-1 text-sm"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
            <p className="text-xs">SVG, PNG, JPG or WEBP (MAX. 3MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}
