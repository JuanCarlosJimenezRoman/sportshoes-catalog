import ProductCard from './ProductCard';
import EmptyState from '@/components/ui/EmptyState';

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="aspect-[3/4] md:aspect-square bg-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="h-2.5 md:h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-1.5 md:gap-2 mt-1 md:mt-2">
                <div className="h-4 md:h-5 w-8 md:w-10 bg-gray-200 rounded" />
                <div className="h-4 md:h-5 w-8 md:w-10 bg-gray-200 rounded" />
                <div className="h-4 md:h-5 w-8 md:w-10 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyState title="No se encontraron productos" description="Intenta ajustar los filtros" />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}