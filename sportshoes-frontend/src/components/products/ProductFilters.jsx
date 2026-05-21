'use client';
import { useState, useEffect } from 'react';
import { useFilters } from '@/hooks/useProducts';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

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
    <aside className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00FF88] to-[#7C3AED] rounded-lg flex items-center justify-center">
            <FunnelIcon className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Filtros</h2>
        </div>
        {activeFiltersCount > 0 && (
          <button 
            onClick={onClearFilters} 
            className="text-xs font-medium text-[#FF6B6B] hover:text-[#FF6B6B]/80 px-3 py-1.5 rounded-lg 
                     hover:bg-[#FF6B6B]/10 transition-all duration-200"
          >
            Limpiar ({activeFiltersCount})
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Buscar
        </label>
        <div className="relative group">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tenis..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                     transition-all duration-200"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-[#999999] group-focus-within:text-[#00FF88] transition-colors" />
        </div>
      </div>

      <div className="bg-[#F5F5F5] rounded-xl p-3">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={currentFilters.hideOutOfStock || false}
              onChange={(e) => onFilterChange({ hideOutOfStock: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${
              currentFilters.hideOutOfStock ? 'bg-[#00FF88]' : 'bg-[#CCCCCC]'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                currentFilters.hideOutOfStock ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
              }`} />
            </div>
          </div>
          <span className="ml-3 text-sm font-medium text-[#1A1A1A]">
            Solo con stock
          </span>
        </label>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Categoría
        </label>
        <select
          value={currentFilters.categoryId || ''}
          onChange={(e) => onFilterChange({ categoryId: e.target.value })}
          className="w-full px-3 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all duration-200"
          disabled={loading}
        >
          <option value="">Todas las categorías</option>
          {filters.categories?.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Marca
        </label>
        <select
          value={currentFilters.brandId || ''}
          onChange={(e) => onFilterChange({ brandId: e.target.value })}
          className="w-full px-3 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all duration-200"
          disabled={loading}
        >
          <option value="">Todas las marcas</option>
          {filters.brands?.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Género
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'MEN', label: 'Hombre', emoji: '👨' },
            { value: 'WOMEN', label: 'Mujer', emoji: '👩' },
            { value: 'UNISEX', label: 'Unisex', emoji: '🔄' },
            { value: 'KIDS', label: 'Niños', emoji: '👶' }
          ].map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => onFilterChange({ gender: currentFilters.gender === value ? '' : value })}
              className={`px-3 py-2 text-xs rounded-xl font-medium transition-all duration-200 ${
                currentFilters.gender === value
                  ? 'bg-gradient-to-r from-[#00FF88]/20 to-[#7C3AED]/20 text-[#7C3AED] border-2 border-[#7C3AED]/50 shadow-md'
                  : 'bg-[#F5F5F5] border-2 border-transparent text-[#666666] hover:border-[#E8E8E8] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="mr-1">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Precio
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-xs text-[#999999]">$</span>
            <input
              type="number"
              value={currentFilters.minPrice || ''}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              placeholder="Min"
              className="w-full pl-7 pr-2 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm
                       focus:outline-none focus:border-[#00FF88] focus:bg-white transition-all duration-200"
            />
          </div>
          <span className="text-[#999999] text-xs font-medium">a</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-xs text-[#999999]">$</span>
            <input
              type="number"
              value={currentFilters.maxPrice || ''}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              placeholder="Max"
              className="w-full pl-7 pr-2 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm
                       focus:outline-none focus:border-[#00FF88] focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {filters.sizes && filters.sizes.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Tallas
          </label>
          <div className="flex flex-wrap gap-2">
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
                  className={`w-10 h-10 text-xs font-medium rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white shadow-lg shadow-[#1A1A1A]/20 scale-105'
                      : 'bg-[#F5F5F5] text-[#666666] hover:bg-white hover:border-[#00FF88] hover:text-[#1A1A1A] border-2 border-transparent'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Ordenar
        </label>
        <select
          value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            onFilterChange({ sortBy, sortOrder });
          }}
          className="w-full px-3 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all duration-200"
        >
          <option value="createdAt-desc">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>

      <div className="pt-4 border-t border-[#E8E8E8]">
        <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#7C3AED]/10 rounded-xl p-4">
          <p className="text-xs text-[#666666]">
            <span className="font-semibold text-[#1A1A1A]">{activeFiltersCount}</span> filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </aside>
  );
} 