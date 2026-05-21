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
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        {/* Header Section */}
        <div className="relative mb-8 md:mb-10">
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A1A] tracking-tight">
                Catálogo de
                <span className="bg-gradient-to-r from-[#00FF88] to-[#7C3AED] bg-clip-text text-transparent"> Tenis</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-sm md:text-base text-[#666666]">
                  {pagination.total} productos encontrados
                </p>
                <div className="h-1 w-1 rounded-full bg-[#00FF88]" />
                <span className="text-xs text-[#999999]">
                  Envío gratis en +$999
                </span>
              </div>
            </div>
            
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden mt-4 sm:mt-0 group relative overflow-hidden px-5 py-2.5 rounded-xl 
                         bg-[#1A1A1A] text-white text-sm font-medium
                         hover:bg-[#333333] transition-all duration-300
                         flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
              Filtros
              <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8 xl:gap-10">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-6 
                            hover:shadow-md transition-shadow duration-300">
                <ProductFilters
                  currentFilters={filters}
                  onFilterChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div 
                className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm" 
                onClick={() => setMobileFiltersOpen(false)} 
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl 
                            animate-slide-in-right">
                <div className="sticky top-0 bg-white z-10">
                  <div className="flex items-center justify-between p-5 border-b border-[#E8E8E8]">
                    <h2 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#00FF88] rounded-full" />
                      Filtros
                    </h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-[#F5F5F5] rounded-xl transition-colors duration-200
                               text-[#666666] hover:text-[#1A1A1A]"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-5">
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
            {/* Results count badge */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full 
                            border border-[#E8E8E8] text-sm text-[#666666]">
                <div className="w-2 h-2 bg-[#00FF88] rounded-full animate-pulse" />
                {pagination.total} resultados
              </div>
            </div>

            <ProductGrid 
              products={products} 
              loading={loading} 
              error={error} 
            />

            {!loading && !error && (
              <div className="mt-10">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => updateFilters({ page })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 