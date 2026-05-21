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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Producto no encontrado</h1>
          <p className="text-[#666666]">{error || 'El producto que buscas no existe'}</p>
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
          
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white border border-[#E8E8E8] group">
              <img
                src={imgError[`main-${selectedImage}`] ? '/placeholder.svg' : getImageUrl(images[selectedImage]?.url)}
                alt={images[selectedImage]?.altText || product.name}
                className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                onError={() => handleImageError(`main-${selectedImage}`)}
              />
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="absolute top-4 left-4 bg-[#FF6B6B] text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-xl bg-white border-2 transition-all duration-200 ${
                      selectedImage === index 
                        ? 'border-[#00FF88] shadow-md shadow-[#00FF88]/20' 
                        : 'border-[#E8E8E8] hover:border-[#7C3AED]/50'
                    }`}
                  >
                    <img
                      src={imgError[`thumb-${index}`] ? '/placeholder.svg' : getImageUrl(image.url)}
                      alt={image.altText || ''}
                      className="w-full h-full object-contain p-2"
                      onError={() => handleImageError(`thumb-${index}`)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-full text-xs font-medium">
                {product.brand?.name}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span className="px-3 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-full text-xs font-medium animate-pulse">
                  ¡Últimas unidades!
                </span>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A] mb-4 leading-tight">
              {product.name}
            </h1>
            
            {product.averageRating && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.averageRating) ? 'text-[#FFD93D]' : 'text-[#E8E8E8]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#666666]">
                  {product.averageRating.toFixed(1)} 
                  <span className="mx-1">·</span>
                  {reviews.length} reseñas
                </span>
              </div>
            )}

            <div className="mb-8 bg-white rounded-2xl border border-[#E8E8E8] p-6">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-[#1A1A1A]">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-[#999999] line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-[#00FF88]' : 'bg-[#FF6B6B]'}`} />
                <span className="text-sm text-[#666666]">
                  {getStockStatus(product.stock).label}
                </span>
              </div>
            </div>

            {colors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#00FF88] rounded-full" />
                  Colores disponibles
                </h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      className="w-12 h-12 rounded-full border-2 border-[#E8E8E8] hover:border-[#7C3AED] hover:scale-110 transition-all duration-200 shadow-sm"
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#00FF88] rounded-full" />
                  Tallas disponibles
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {variants.map((variant, index) => {
                    const stockStatus = getStockStatus(variant.stock);
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(variant.size)}
                        disabled={variant.stock === 0}
                        className={`relative px-4 py-3 text-sm rounded-xl font-medium transition-all duration-200 ${
                          selectedSize === variant.size
                            ? 'bg-[#1A1A1A] text-white shadow-lg shadow-[#1A1A1A]/20 scale-105'
                            : variant.stock === 0
                            ? 'bg-[#F5F5F5] text-[#CCCCCC] cursor-not-allowed'
                            : 'bg-white border-2 border-[#E8E8E8] hover:border-[#00FF88] hover:shadow-md'
                        }`}
                      >
                        <div className="text-base">{variant.size}</div>
                        <div className={`text-[10px] mt-0.5 ${stockStatus.textColor}`}>
                          {stockStatus.label}
                        </div>
                        {selectedSize === variant.size && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full border-2 border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.description && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-[#00FF88] rounded-full" />
                  Descripción
                </h3>
                <p className="text-[#666666] leading-relaxed">{product.description}</p>
              </div>
            )}

            {materials.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Materiales</h3>
                <div className="flex flex-wrap gap-2">
                  {materials.map((material, index) => (
                    <span key={index} className="px-4 py-2 bg-white border border-[#E8E8E8] rounded-full text-sm text-[#666666] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span key={index} className="px-4 py-1.5 bg-gradient-to-r from-[#00FF88]/10 to-[#7C3AED]/10 text-[#7C3AED] rounded-full text-sm font-medium border border-[#7C3AED]/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-[#E8E8E8]">
              <p className="text-xs text-[#999999]">SKU: {product.sku}</p>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                Reseñas de clientes
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E8E8E8] to-transparent" />
            </div>
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-6 border border-[#E8E8E8] hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">{review.user?.name || 'Usuario'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? 'text-[#FFD93D]' : 'text-[#E8E8E8]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-[#999999] bg-[#F5F5F5] px-3 py-1 rounded-full">
                      {new Date(review.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-[#1A1A1A] mb-2">{review.title}</h4>
                  )}
                  <p className="text-[#666666] leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} //listo