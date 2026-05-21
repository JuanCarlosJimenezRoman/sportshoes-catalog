import Link from 'next/link';
import { useState } from 'react';
import { formatPrice, parseJSON } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const colors = parseJSON(product.colors);
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  
  const getImageUrl = (image) => {
    if (!image?.url) return null;
    if (image.url.startsWith('http')) return image.url;
    return `${API_URL}${image.url}`;
  };

  const imageUrl = getImageUrl(mainImage);
  const availableSizes = product.availableSizes || 
    (product.variants ? product.variants.filter(v => v.stock > 0).map(v => v.size) : []);
  const totalStock = product.totalStock || 
    (product.variants ? product.variants.reduce((sum, v) => sum + v.stock, 0) : 0);
  
  return (
    <Link href={`/product/${product.slug}`} className="card group flex flex-col">
      <div className="relative aspect-[3/4] md:aspect-square overflow-hidden bg-gray-50">
        {!imgLoaded && imageUrl && !imgError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={mainImage?.altText || product.name}
            className={`w-full h-full object-contain p-2 md:p-4 group-hover:scale-105 transition-all duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-10 h-10 md:w-16 md:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 flex flex-wrap gap-1 z-10">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="bg-accent-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium shadow-sm">
              -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
            </span>
          )}
          {totalStock <= 5 && totalStock > 0 && (
            <span className="bg-yellow-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium shadow-sm">
              ¡Últimas!
            </span>
          )}
        </div>

        {/* Agotado overlay */}
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-white text-gray-900 text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 md:p-4 flex-1 flex flex-col">
        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider mb-0.5 md:mb-1">
          {product.brand?.name || 'Marca'}
        </p>
        <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-xs md:text-sm leading-snug">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-baseline gap-1.5 md:gap-2 mb-2 md:mb-3">
          <span className="text-sm md:text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[10px] md:text-sm text-gray-500 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Stock info */}
        <div className="mb-2 md:mb-3">
          {totalStock > 0 ? (
            <p className="text-[10px] md:text-xs text-gray-500">
              {totalStock} en stock · {availableSizes.length} tallas
            </p>
          ) : (
            <p className="text-[10px] md:text-xs text-red-500 font-medium">
              Sin stock disponible
            </p>
          )}
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 md:gap-1.5 mb-2 md:mb-3">
            {colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] md:text-xs text-gray-500 ml-0.5">+{colors.length - 4}</span>
            )}
          </div>
        )}

        {/* Available sizes */}
        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {availableSizes.slice(0, 3).map((size, index) => (
              <span
                key={index}
                className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded bg-green-50 text-green-700 font-medium"
              >
                {size}
              </span>
            ))}
            {availableSizes.length > 3 && (
              <span className="text-[10px] md:text-xs text-gray-500 px-1.5 py-0.5">
                +{availableSizes.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}