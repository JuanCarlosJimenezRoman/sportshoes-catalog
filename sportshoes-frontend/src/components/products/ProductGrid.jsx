import ProductCard from './ProductCard';
import EmptyState from '@/components/ui/EmptyState';

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden animate-pulse">
            <div className="aspect-[3/4] md:aspect-square bg-gradient-to-br from-[#F5F5F5] via-[#E8E8E8] to-[#F5F5F5] flex items-center justify-center">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-3 md:p-4 space-y-3">
              <div className="h-3 bg-[#E8E8E8] rounded-full w-1/4" />
              <div className="h-4 bg-[#E8E8E8] rounded-lg w-3/4" />
              <div className="h-4 bg-[#E8E8E8] rounded-lg w-1/2" />
              <div className="flex gap-2 mt-2">
                <div className="h-6 w-10 bg-[#E8E8E8] rounded-lg" />
                <div className="h-6 w-10 bg-[#E8E8E8] rounded-lg" />
                <div className="h-6 w-10 bg-[#E8E8E8] rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-[#FF6B6B] mb-6 font-medium text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl font-semibold
                   hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <EmptyState 
          title="No se encontraron productos" 
          description="Intenta ajustar los filtros o busca con otros términos" 
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}