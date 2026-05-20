'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import SizeManager from '@/components/admin/SizeManager';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SizesManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;

      const response = await api.get('/products', { params });
      if (response.data.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory]);

  const handleSelectProduct = async (product) => {
    try {
      // Cargar producto completo con variantes
      const response = await api.get(`/products/${product.id}`);
      if (response.data.success) {
        setSelectedProduct(response.data.data);
      }
    } catch (error) {
      toast.error('Error al cargar producto');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Tallas por Producto</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>
            
            {/* Buscador */}
            <div className="relative mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar producto..."
                className="input-field pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Filtro por categoría */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="input-field mb-4"
            >
              <option value="">Todas las categorías</option>
              <option value="infantil">Infantil</option>
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="unisex">Unisex</option>
            </select>

            {/* Lista de productos */}
            {loading ? (
              <LoadingSpinner size="md" className="py-8" />
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedProduct?.id === product.id
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url.startsWith('http') 
                              ? product.images[0].url 
                              : `http://localhost:3001${product.images[0].url}`
                            }
                            alt=""
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-gray-400 text-xs">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku} | {product.gender}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.variants?.length || 0} variantes
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gestor de tallas */}
        <div className="lg:col-span-2">
          {selectedProduct ? (
            <SizeManager 
              product={selectedProduct} 
              onUpdate={() => handleSelectProduct(selectedProduct)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecciona un producto
              </h3>
              <p className="text-gray-500">
                Elige un producto de la lista para gestionar sus tallas disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}