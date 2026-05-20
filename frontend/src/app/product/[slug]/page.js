'use client';
import { useProduct } from '@/hooks/useProducts';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { notFound } from 'next/navigation';

export default function ProductPage({ params }) {
  const { product, loading, error } = useProduct(params.slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error || !product) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductInfo product={product} />
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Reseñas de clientes</h2>
          <div className="space-y-6">
            {product.reviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{review.user?.name}</p>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
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