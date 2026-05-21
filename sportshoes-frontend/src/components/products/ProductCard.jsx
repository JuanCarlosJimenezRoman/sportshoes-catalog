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
    <Link 
      href={`/product/${product.slug}`} 
      className="group flex flex-col bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden 
                 hover:shadow-xl hover:shadow-[#1A1A1A]/5 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[3/4] md:aspect-square overflow-hidden bg-[#F5F5F5]">
        {!imgLoaded && imageUrl && !imgError && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F5] via-[#E8E8E8] to-[#F5F5F5] animate-shimmer" />
        )}
        
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={mainImage?.altText || product.name}
            className={`w-full h-full object-contain p-4 md:p-6 group-hover:scale-110 transition-transform duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 md:w-16 md:h-16 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="bg-[#FF6B6B] text-white text-[10px] md:text-xs px-2 py-1 rounded-lg font-semibold shadow-lg shadow-[#FF6B6B]/20">
              -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
            </span>
          )}
          {totalStock <= 5 && totalStock > 0 && (
            <span className="bg-[#FFD93D] text-[#1A1A1A] text-[10px] md:text-xs px-2 py-1 rounded-lg font-semibold shadow-lg shadow-[#FFD93D]/20">
              ¡Últimas!
            </span>
          )}
          {product.averageRating && product.averageRating >= 4.5 && (
            <span className="bg-[#7C3AED] text-white text-[10px] md:text-xs px-2 py-1 rounded-lg font-semibold shadow-lg shadow-[#7C3AED]/20">
              Top
            </span>
          )}
        </div>

        {totalStock === 0 && (
          <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-[#1A1A1A] text-xs md:text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">
              Agotado
            </span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <p className="text-[10px] md:text-xs text-[#999999] uppercase tracking-wider font-medium mb-1">
          {product.brand?.name || 'Marca'}
        </p>
        <h3 className="font-semibold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#7C3AED] transition-colors text-xs md:text-sm leading-snug">
          {product.name}
        </h3>
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-base md:text-lg font-bold text-[#1A1A1A]">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[10px] md:text-xs text-[#999999] line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        <div className="mb-2">
          {totalStock > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
              <p className="text-[10px] md:text-xs text-[#666666]">
                {totalStock} en stock · {availableSizes.length} tallas
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
              <p className="text-[10px] md:text-xs text-[#FF6B6B] font-medium">
                Sin stock disponible
              </p>
            </div>
          )}
        </div>

        {colors.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 mb-2">
            {colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white shadow-md ring-1 ring-[#E8E8E8] hover:scale-110 transition-transform"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[10px] md:text-xs text-[#999999] ml-1 font-medium">
                +{colors.length - 4}
              </span>
            )}
          </div>
        )}

        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {availableSizes.slice(0, 3).map((size, index) => (
              <span
                key={index}
                className="text-[10px] md:text-xs px-2 py-1 rounded-lg bg-[#00FF88]/10 text-[#00FF88] font-medium border border-[#00FF88]/20"
              >
                {size}
              </span>
            ))}
            {availableSizes.length > 3 && (
              <span className="text-[10px] md:text-xs text-[#999999] px-2 py-1 font-medium">
                +{availableSizes.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
} 