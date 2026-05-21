'use client';
import { useState, useEffect } from 'react';
import { useFilters } from '@/hooks/useProducts';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ProductFilters({ currentFilters, onFilterChange, onClearFilters }) {
  const { filters, loading } = useFilters();
  const [search, setSearch] = useState(currentFilters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const activeFiltersCount = [
    currentFilters.categoryId,
    currentFilters.brandId,
    currentFilters.gender,
    currentFilters.minPrice,
    currentFilters.maxPrice,
    currentFilters.hideOutOfStock,
    currentFilters.sizes,
  ].filter(Boolean).length;

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros</h2>
        {activeFiltersCount > 0 && (
          <button onClick={onClearFilters} className="text-sm text-primary-600 hover:text-primary-700">
            Limpiar ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Buscar</label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar Tenis..."
            className="input-field pl-9 text-sm"
          />
          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Solo con stock */}
      <div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={currentFilters.hideOutOfStock || false}
            onChange={(e) => onFilterChange({ hideOutOfStock: e.target.checked })}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
          />
          <span className="ml-2 text-sm text-gray-700">
            Solo productos con stock
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Oculta productos agotados
        </p>
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
        <select
          value={currentFilters.categoryId || ''}
          onChange={(e) => onFilterChange({ categoryId: e.target.value })}
          className="input-field text-sm"
          disabled={loading}
        >
          <option value="">Todas las categorías</option>
          {filters.categories?.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {/* Marca */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca</label>
        <select
          value={currentFilters.brandId || ''}
          onChange={(e) => onFilterChange({ brandId: e.target.value })}
          className="input-field text-sm"
          disabled={loading}
        >
          <option value="">Todas las marcas</option>
          {filters.brands?.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>

      {/* Género */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Género</label>
        <div className="grid grid-cols-2 gap-1.5">
          {['MEN', 'WOMEN', 'UNISEX', 'KIDS'].map(gender => (
            <button
              key={gender}
              onClick={() => onFilterChange({ gender: currentFilters.gender === gender ? '' : gender })}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
                currentFilters.gender === gender
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 hover:border-primary-600 text-gray-700'
              }`}
            >
              {gender === 'MEN' ? '👨 Hombre' : gender === 'WOMEN' ? '👩 Mujer' : gender === 'UNISEX' ? '🔄 Unisex' : '👶 Niños'}
            </button>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Rango de precio</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={currentFilters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            placeholder="Min"
            className="input-field text-sm"
          />
          <span className="text-gray-400 text-sm">-</span>
          <input
            type="number"
            value={currentFilters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            placeholder="Max"
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* Tallas */}
      {filters.sizes && filters.sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tallas disponibles</label>
          <div className="flex flex-wrap gap-1.5">
            {filters.sizes.map(size => {
              const isSelected = currentFilters.sizes?.split(',').includes(size.toString());
              return (
                <button
                  key={size}
                  onClick={() => {
                    const currentSizes = currentFilters.sizes ? currentFilters.sizes.split(',') : [];
                    const newSizes = currentSizes.includes(size.toString())
                      ? currentSizes.filter(s => s !== size.toString())
                      : [...currentSizes, size.toString()];
                    onFilterChange({ sizes: newSizes.join(',') });
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:border-primary-600 text-gray-700'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Ordenar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ordenar por</label>
        <select
          value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            onFilterChange({ sortBy, sortOrder });
          }}
          className="input-field text-sm"
        >
          <option value="createdAt-desc">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>
    </aside>
  );
}