import { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function ImageDropzone({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
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

  const handleFile = (file) => {
    // In a real app, this would upload to Cloudinary/S3.
    // Here we create a local object URL for immediate preview.
    const url = URL.createObjectURL(file);
    onChange(url);
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

        {value ? (
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
            <p className="text-xs">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}
