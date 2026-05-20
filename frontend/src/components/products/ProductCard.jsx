import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, parseJSON, getStockStatus } from '@/lib/utils';
import { StarIcon } from '@heroicons/react/24/solid';

export default function ProductCard({ product }) {
  const colors = parseJSON(product.colors);
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  const availableSizes = product.variants?.filter(v => v.stock > 0) || [];
  
  return (
    <Link href={`/product/${product.slug}`} className="card group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={mainImage?.url || '/placeholder.jpg'}
          alt={mainImage?.altText || product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
              Oferta
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              Destacado
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {product.brand?.name}
        </p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        {product.averageRating && (
          <div className="flex items-center mb-2">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{product.averageRating.toFixed(1)}</span>
          </div>
        )}

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
        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availableSizes.slice(0, 4).map((variant, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-1 rounded ${
                  getStockStatus(variant.stock).color === 'bg-green-500'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}
              >
                {variant.size}
              </span>
            ))}
            {availableSizes.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{availableSizes.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}