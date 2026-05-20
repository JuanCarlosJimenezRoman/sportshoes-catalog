'use client';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const { products, loading, error, pagination, filters, updateFilters, clearFilters } = useProducts();

  // Read initial filters from URL
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      updateFilters({ search });
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <ProductFilters
            currentFilters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Catálogo de Zapatillas
            </h1>
            <p className="text-gray-600">
              {pagination.total} productos encontrados
            </p>
          </div>

          {/* Product Grid */}
          <ProductGrid 
            products={products} 
            loading={loading} 
            error={error} 
          />

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      </div>
    </div>
  );
}