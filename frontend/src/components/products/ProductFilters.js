// frontend/src/components/products/ProductFilters.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductFilters({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands`)
      ]);

      const categoriesData = await categoriesRes.json();
      const brandsData = await brandsRes.json();

      setCategories(categoriesData.data);
      setBrands(brandsData.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  // Tallas comunes de calzado deportivo
  const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  
  const colors = [
    { name: 'Negro', value: 'black' },
    { name: 'Blanco', value: 'white' },
    { name: 'Rojo', value: 'red' },
    { name: 'Azul', value: 'blue' },
    { name: 'Verde', value: 'green' },
    { name: 'Gris', value: 'gray' }
  ];

  const genderOptions = [
    { label: 'Hombre', value: 'MEN' },
    { label: 'Mujer', value: 'WOMEN' },
    { label: 'Unisex', value: 'UNISEX' },
    { label: 'Niños', value: 'KIDS' }
  ];

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleSizeToggle = (size) => {
    const currentSizes = filters.sizes ? filters.sizes.split(',') : [];
    const updatedSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    
    handleInputChange('sizes', updatedSizes.join(','));
  };

  const handleColorToggle = (color) => {
    const currentColors = filters.colors ? filters.colors.split(',') : [];
    const updatedColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];
    
    handleInputChange('colors', updatedColors.join(','));
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      brand: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
      sizes: '',
      colors: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Limpiar todo
        </button>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          placeholder="Buscar producto..."
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Categorías */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Marca */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Marca
        </label>
        <select
          value={filters.brand}
          onChange={(e) => handleInputChange('brand', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las marcas</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* Género */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Género
        </label>
        <select
          value={filters.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos</option>
          {genderOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rango de Precio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rango de Precio
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            placeholder="Min"
            className="w-1/2 px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            placeholder="Max"
            className="w-1/2 px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Tallas */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tallas
        </label>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map(size => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`px-2 py-1 text-sm rounded border ${
                filters.sizes?.includes(size)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Colores
        </label>
        <div className="grid grid-cols-3 gap-2">
          {colors.map(color => (
            <button
              key={color.value}
              onClick={() => handleColorToggle(color.value)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded border ${
                filters.colors?.includes(color.value)
                  ? 'bg-blue-50 border-blue-600 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color.value }}
              />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Botón Aplicar Filtros */}
      <button
        onClick={() => onFilterChange(filters)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Aplicar Filtros
      </button>
    </div>
  );
}