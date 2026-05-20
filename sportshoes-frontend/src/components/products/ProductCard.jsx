import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, parseJSON } from '../../lib/utils';

export default function ProductCard({ product }) {
  const colors = parseJSON(product.colors);
  const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
  
  return (
    <Link href={`/product/${product.slug}`} className="card group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={mainImage?.url || '/placeholder.jpg'}
          alt={mainImage?.altText || product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {product.comparePrice && product.comparePrice > product.price && (
          <div className="absolute top-2 left-2">
            <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">Oferta</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.brand?.name}</p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>
        {colors.length > 0 && (
          <div className="flex items-center gap-1">
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
      </div>
    </Link>
  );
}