'use client';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const searchParams = useSearchParams();
  const { products, loading, error, pagination, filters, updateFilters, clearFilters } = useProducts();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      updateFilters({ search });
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Catálogo de Zapatillas
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">
            {pagination.total} productos encontrados
          </p>
        </div>
        
        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden btn-outline text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-1.5"
        >
          <FunnelIcon className="h-4 w-4" />
          Filtros
        </button>
      </div>

      <div className="flex gap-4 lg:gap-6 xl:gap-8">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
          <div className="sticky top-20">
            <ProductFilters
              currentFilters={filters}
              onFilterChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <ProductFilters
                  currentFilters={filters}
                  onFilterChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ProductGrid 
            products={products} 
            loading={loading} 
            error={error} 
          />

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