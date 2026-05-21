'use client';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '../../../components/products/ProductGrid';
import Pagination from '../../../components/ui/Pagination';

export default function CategoryPage({ params }) {
  const { products, loading, error, pagination, filters, updateFilters } = useProducts({
    categoryId: params.slug
  });

  const categoryName = params.slug.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="relative mb-10">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
          <div className="pt-4">
            <p className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2">Categoría</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] capitalize">
              {categoryName}
            </h1>
            {!loading && (
              <p className="text-sm text-[#666666] mt-2">
                {pagination.total} producto{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        <ProductGrid products={products} loading={loading} error={error} />
        
        {!loading && !error && products && products.length > 0 && (
          <div className="mt-12">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => updateFilters({ page })}
            />
          </div>
        )}
      </div>
    </div>
  );
}