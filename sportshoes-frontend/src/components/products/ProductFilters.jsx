import { useState, useEffect } from 'react';
import { useFilters } from '../../hooks/useProducts';

export default function ProductFilters({ currentFilters, onFilterChange, onClearFilters }) {
  const { filters, loading } = useFilters();
  const [search, setSearch] = useState(currentFilters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search });
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <button onClick={onClearFilters} className="text-sm text-primary-600">Limpiar</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar zapatillas..."
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
        <select
          value={currentFilters.categoryId || ''}
          onChange={(e) => onFilterChange({ categoryId: e.target.value })}
          className="input-field"
          disabled={loading}
        >
          <option value="">Todas las categorías</option>
          {filters.categories?.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
        <select
          value={currentFilters.brandId || ''}
          onChange={(e) => onFilterChange({ brandId: e.target.value })}
          className="input-field"
          disabled={loading}
        >
          <option value="">Todas las marcas</option>
          {filters.brands?.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
        <div className="grid grid-cols-2 gap-2">
          {['MEN', 'WOMEN', 'UNISEX', 'KIDS'].map(gender => (
            <button
              key={gender}
              onClick={() => onFilterChange({ gender: currentFilters.gender === gender ? '' : gender })}
              className={`px-3 py-2 text-sm rounded-lg border ${
                currentFilters.gender === gender
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 hover:border-primary-600'
              }`}
            >
              {gender === 'MEN' ? 'Hombre' : gender === 'WOMEN' ? 'Mujer' : gender === 'UNISEX' ? 'Unisex' : 'Niños'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rango de precio</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={currentFilters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            placeholder="Min"
            className="input-field"
          />
          <span>-</span>
          <input
            type="number"
            value={currentFilters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            placeholder="Max"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
        <select
          value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            onFilterChange({ sortBy, sortOrder });
          }}
          className="input-field"
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