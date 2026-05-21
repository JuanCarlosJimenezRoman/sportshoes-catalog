'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import SizeManager from '@/components/admin/SizeManager';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, CubeIcon } from '@heroicons/react/24/outline';

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
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
        <h1 className="text-2xl font-bold text-[#1A1A1A] pt-4">Gestión de Tallas por Producto</h1>
        <p className="text-sm text-[#999999] mt-1">Administra las tallas disponibles para cada producto</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-5">
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
              Productos
            </h2>
            
            <div className="relative mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar producto..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                         placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                         transition-all duration-200"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-[#999999]" />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                       focus:outline-none focus:border-[#7C3AED] transition-all duration-200 mb-4"
            >
              <option value="">Todas las categorías</option>
              <option value="infantil">👶 Infantil</option>
              <option value="mujer">👩 Mujer</option>
              <option value="hombre">👨 Hombre</option>
              <option value="unisex">🔄 Unisex</option>
            </select>

            {loading ? (
              <LoadingSpinner size="md" className="py-8" />
            ) : (
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      selectedProduct?.id === product.id
                        ? 'bg-gradient-to-r from-[#00FF88]/10 to-[#7C3AED]/10 border-2 border-[#7C3AED]/50 shadow-sm'
                        : 'bg-[#F5F5F5] border-2 border-transparent hover:bg-white hover:border-[#E8E8E8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden bg-white border border-[#E8E8E8]">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url.startsWith('http') 
                              ? product.images[0].url 
                              : `http://localhost:3001${product.images[0].url}`
                            }
                            alt=""
                            className="h-10 w-10 object-contain p-1"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-[#CCCCCC]">
                            <CubeIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#999999]">SKU: {product.sku}</span>
                          <span className="w-1 h-1 bg-[#E8E8E8] rounded-full" />
                          <span className="text-[10px] text-[#999999]">{product.gender}</span>
                        </div>
                        <p className="text-[10px] text-[#7C3AED] font-medium mt-1">
                          {product.variants?.length || 0} variantes
                        </p>
                      </div>
                      {selectedProduct?.id === product.id && (
                        <div className="w-2 h-2 bg-[#00FF88] rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-[#E8E8E8]">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E8E8E8] text-[#666666]
                           hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                <span className="text-xs font-medium text-[#666666] bg-[#F5F5F5] px-3 py-1.5 rounded-lg">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E8E8E8] text-[#666666]
                           hover:bg-[#F5F5F5] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedProduct ? (
            <SizeManager 
              product={selectedProduct} 
              onUpdate={() => handleSelectProduct(selectedProduct)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                Selecciona un producto
              </h3>
              <p className="text-[#999999] text-sm max-w-sm mx-auto">
                Elige un producto de la lista para gestionar sus tallas disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}