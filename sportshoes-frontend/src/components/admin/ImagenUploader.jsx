'use client';
import { useState } from 'react';
import { TrashIcon, StarIcon } from '@heroicons/react/24/outline';
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes del producto {sku && <span className="text-gray-500">(SKU: {sku})</span>}
        </label>
        
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
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
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Subiendo imágenes...</span>
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-gray-600">
                  <span className="text-primary-600 font-medium">Haz clic para subir</span> o arrastra las imágenes
                </span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 5MB</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {images.length} imagen(es)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url.startsWith('http') ? image.url : `http://localhost:3001${image.url}`}
                  alt={image.altText || 'Imagen del producto'}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Botón de imagen principal */}
                  <button
                    onClick={() => handleSetMain(image.id)}
                    className={`p-2 rounded-full ${
                      image.isMain 
                        ? 'bg-yellow-400 text-white' 
                        : 'bg-white text-gray-600 hover:text-yellow-500'
                    }`}
                    title={image.isMain ? 'Imagen principal' : 'Establecer como principal'}
                  >
                    {image.isMain ? (
                      <StarIconSolid className="h-5 w-5" />
                    ) : (
                      <StarIcon className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Botón de eliminar */}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 rounded-full bg-white text-red-600 hover:bg-red-50"
                    title="Eliminar imagen"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Badge de imagen principal */}
                {image.isMain && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}