'use client';
import { useState, useEffect } from 'react';
import { useFilters } from '@/hooks/useProducts';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function ProductFilters({ currentFilters, onFilterChange, onClearFilters }) {
  const { filters, loading } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(currentFilters.search || '');
  const [selectedColors, setSelectedColors] = useState([]);

  const commonColors = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'gray'
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleColorToggle = (color) => {
    setSelectedColors(prev => {
      const newColors = prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color];
      return newColors;
    });
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-30 bg-primary-600 text-white p-3 rounded-full shadow-lg"
      >
        <AdjustmentsHorizontalIcon className="h-6 w-6" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Sidebar */}
      <aside className={`${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:sticky top-16 lg:top-0 left-0 z-50 lg:z-0 w-80 h-[calc(100vh-4rem)] overflow-y-auto bg-white border-r border-gray-200 p-6 transition-transform duration-300`}>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <button
              onClick={onClearFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Limpiar
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar Tenis..."
                className="input-field pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={currentFilters.categoryId || ''}
              onChange={(e) => onFilterChange({ categoryId: e.target.value })}
              className="input-field"
              disabled={loading}
            >
              <option value="">Todas las categorías</option>
              {filters.categories?.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <select
              value={currentFilters.brandId || ''}
              onChange={(e) => onFilterChange({ brandId: e.target.value })}
              className="input-field"
              disabled={loading}
            >
              <option value="">Todas las marcas</option>
              {filters.brands?.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['MEN', 'WOMEN', 'UNISEX', 'KIDS'].map(gender => (
                <button
                  key={gender}
                  onClick={() => onFilterChange({
                    gender: currentFilters.gender === gender ? '' : gender
                  })}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    currentFilters.gender === gender
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:border-primary-600'
                  }`}
                >
                  {gender === 'MEN' ? 'Hombre' :
                   gender === 'WOMEN' ? 'Mujer' :
                   gender === 'UNISEX' ? 'Unisex' : 'Niños'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango de precio
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={currentFilters.minPrice || ''}
                onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                placeholder="Min"
                className="input-field"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={currentFilters.maxPrice || ''}
                onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                placeholder="Max"
                className="input-field"
              />
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talla
            </label>
            <div className="grid grid-cols-4 gap-2">
              {filters.sizes?.map(size => (
                <button
                  key={size}
                  onClick={() => onFilterChange({ size: size })}
                  className={`px-2 py-1.5 text-sm rounded border transition-colors ${
                    currentFilters.size === size
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:border-primary-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colores
            </label>
            <div className="flex flex-wrap gap-2">
              {commonColors.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColors.includes(color)
                      ? 'border-primary-600 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                onFilterChange({ sortBy, sortOrder });
              }}
              className="input-field"
            >
              <option value="createdAt-desc">Más recientes</option>
              <option value="createdAt-asc">Más antiguos</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>
        </div>
      </aside>
    </>
  );
}