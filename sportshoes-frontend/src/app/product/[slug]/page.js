'use client';
import { useProduct } from '@/hooks/useProducts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPrice, parseJSON, getStockStatus } from '@/lib/utils';
import { StarIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProductPage({ params }) {
  const { product, loading, error } = useProduct(params.slug);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [imgError, setImgError] = useState({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600">{error || 'El producto que buscas no existe'}</p>
        </div>
      </div>
    );
  }

  const colors = parseJSON(product.colors);
  const materials = parseJSON(product.materials);
  const tags = parseJSON(product.tags);
  const images = product.images || [];
  const variants = product.variants || [];
  const reviews = product.reviews || [];

  const getImageUrl = (url) => {
    if (!url) return '/placeholder.svg';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const handleImageError = (index) => {
    setImgError(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4">
            <img
              src={imgError[`main-${selectedImage}`] ? '/placeholder.svg' : getImageUrl(images[selectedImage]?.url)}
              alt={images[selectedImage]?.altText || product.name}
              className="w-full h-full object-contain"
              onError={() => handleImageError(`main-${selectedImage}`)}
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                    selectedImage === index ? 'ring-2 ring-primary-600' : ''
                  }`}
                >
                  <img
                    src={imgError[`thumb-${index}`] ? '/placeholder.svg' : getImageUrl(image.url)}
                    alt={image.altText || ''}
                    className="w-full h-full object-contain"
                    onError={() => handleImageError(`thumb-${index}`)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-gray-500 mb-2">{product.brand?.name}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {product.averageRating.toFixed(1)} ({reviews.length} reseñas)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Colores disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tallas disponibles</h3>
              <div className="grid grid-cols-4 gap-2">
                {variants.map((variant, index) => {
                  const stockStatus = getStockStatus(variant.stock);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(variant.size)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        selectedSize === variant.size
                          ? 'bg-primary-600 text-white border-primary-600'
                          : variant.stock === 0
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:border-primary-600'
                      }`}
                    >
                      <div>{variant.size}</div>
                      <div className={`text-xs ${stockStatus.textColor}`}>
                        {stockStatus.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Materials */}
          {materials.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Materiales</h3>
              <div className="flex flex-wrap gap-2">
                {materials.map((material, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SKU */}
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Reseñas de clientes</h2>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{review.user?.name || 'Usuario'}</p>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}