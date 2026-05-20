'use client';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/products/ProductGrid';
import Pagination from '@/components/ui/Pagination';

export default function BrandPage({ params }) {
  const { products, loading, error, pagination, filters, updateFilters } = useProducts({
    brandId: params.slug
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Marca: {params.slug.replace(/-/g, ' ')}
      </h1>
      
      <ProductGrid products={products} loading={loading} error={error} />
      
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => updateFilters({ page })}
      />
    </div>
  );
}