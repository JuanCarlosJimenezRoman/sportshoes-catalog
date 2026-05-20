import Link from 'next/link';
import { useState } from 'react';
import { formatPrice, parseJSON } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const colors = parseJSON(product.colors);
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  
  const getImageUrl = (image) => {
    if (!image?.url) return null;
    if (image.url.startsWith('http')) return image.url;
    return `${API_URL}${image.url}`;
  };

  const imageUrl = getImageUrl(mainImage);
  
  return (
    <Link href={`/product/${product.slug}`} className="card group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={mainImage?.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Oferta
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              Destacado
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {product.brand?.name || 'Marca'}
        </p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Colors */}
        {colors.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {colors.slice(0, 5).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-xs text-gray-500">+{colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Sizes */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.variants
              .filter(v => v.stock > 0)
              .slice(0, 4)
              .map((variant, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 font-medium"
                >
                  {variant.size}
                </span>
              ))}
            {product.variants.filter(v => v.stock > 0).length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{product.variants.filter(v => v.stock > 0).length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}