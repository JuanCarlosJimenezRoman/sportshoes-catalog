'use client';
import { useState } from 'react';
import { TrashIcon, StarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function ImageUploader({ productId, sku, existingImages = [], onImagesUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages || []);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const formData = new FormData();
    
    for (let file of files) {
      formData.append('images', file);
    }

    try {
      const response = await api.post(
        `/products/${productId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.success) {
        const newImages = response.data.data;
        setImages(prev => [...prev, ...newImages]);
        if (onImagesUpdate) onImagesUpdate([...images, ...newImages]);
        toast.success(`${files.length} imagen(es) subida(s) exitosamente`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.response?.data?.message || 'Error al subir imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      if (onImagesUpdate) onImagesUpdate(updatedImages);
      toast.success('Imagen eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar imagen');
    }
  };

  const handleSetMain = async (imageId) => {
    try {
      const response = await api.put(`/products/${productId}/images/${imageId}/main`);
      if (response.data.success) {
        const updatedImages = images.map(img => ({
          ...img,
          isMain: img.id === imageId
        }));
        setImages(updatedImages);
        if (onImagesUpdate) onImagesUpdate(updatedImages);
        toast.success('Imagen principal actualizada');
      }
    } catch (error) {
      toast.error('Error al establecer imagen principal');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-3">
          Imágenes del producto
          {sku && (
            <span className="text-[#999999] font-normal normal-case tracking-normal ml-2">
              SKU: {sku}
            </span>
          )}
        </label>
        
        <div className="border-2 border-dashed border-[#E8E8E8] rounded-2xl p-8 text-center 
                      hover:border-[#00FF88] hover:bg-[#00FF88]/5 transition-all duration-200 group">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer flex flex-col items-center"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-[#E8E8E8]" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00FF88] animate-spin" />
                </div>
                <span className="text-[#666666] font-medium">Subiendo imágenes...</span>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-4 
                              group-hover:bg-[#00FF88]/10 transition-colors">
                  <PhotoIcon className="w-7 h-7 text-[#999999] group-hover:text-[#00FF88] transition-colors" />
                </div>
                <span className="text-[#666666] font-medium">
                  <span className="text-[#00FF88]">Haz clic para subir</span> o arrastra las imágenes
                </span>
                <span className="text-xs text-[#999999] mt-2">PNG, JPG, WEBP hasta 5MB</span>
              </>
            )}
          </label>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
              {images.length} imagen{images.length !== 1 ? 'es' : ''}
            </h4>
            <span className="text-[10px] text-[#999999]">
              {images.filter(img => img.isMain).length} principal{images.filter(img => img.isMain).length !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-[#F5F5F5] border border-[#E8E8E8]">
                  <img
                    src={image.url.startsWith('http') ? image.url : `http://localhost:3001${image.url}`}
                    alt={image.altText || 'Imagen del producto'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/50 
                              transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5 
                              opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleSetMain(image.id)}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      image.isMain 
                        ? 'bg-[#FFD93D] text-[#1A1A1A] shadow-lg' 
                        : 'bg-white text-[#666666] hover:text-[#FFD93D] hover:scale-110'
                    }`}
                    title={image.isMain ? 'Imagen principal' : 'Establecer como principal'}
                  >
                    {image.isMain ? (
                      <StarIconSolid className="h-4 w-4" />
                    ) : (
                      <StarIcon className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 rounded-xl bg-white text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white 
                             transition-all duration-200 hover:scale-110"
                    title="Eliminar imagen"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {image.isMain && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-gradient-to-r from-[#FFD93D] to-[#FFD93D]/90 text-[#1A1A1A] text-[10px] px-2.5 py-1 
                                   rounded-lg font-semibold shadow-lg flex items-center gap-1">
                      <StarIconSolid className="h-3 w-3" />
                      Principal
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}