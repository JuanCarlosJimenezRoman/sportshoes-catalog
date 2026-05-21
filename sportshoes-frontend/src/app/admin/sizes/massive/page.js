'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  CheckIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

const GENDER_CATEGORIES = {
  'KIDS': 'infantil',
  'WOMEN': 'mujer',
  'MEN': 'hombre',
  'UNISEX': 'unisex',
};

export default function MassiveSizesPage() {
  const [products, setProducts] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGender, setSelectedGender] = useState('MEN');
  const [search, setSearch] = useState('');
  const [changes, setChanges] = useState([]);
  const tableContainerRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const category = GENDER_CATEGORIES[selectedGender] || 'hombre';
      
      const tableRes = await api.get(`/sizes/table?category=${category}`);
      
      if (tableRes.data.success && tableRes.data.data) {
        const { headers: sizesHeaders, products: sizesProducts } = tableRes.data.data;
        
        if (Array.isArray(sizesHeaders)) {
          setHeaders(sizesHeaders);
        } else {
          setHeaders([]);
        }

        if (Array.isArray(sizesProducts)) {
          let filtered = sizesProducts;
          if (search) {
            const searchLower = search.toLowerCase();
            filtered = sizesProducts.filter(p => 
              p.name?.toLowerCase().includes(searchLower) || 
              p.sku?.toLowerCase().includes(searchLower)
            );
          }
          setProducts(filtered);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
      setHeaders([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGender, search]);

  useEffect(() => {
    fetchData();
    setChanges([]);
  }, [fetchData]);

  const handleCheckboxChange = (productId, talla, checked) => {
    setChanges(prev => {
      const existing = prev.find(c => c.productId === productId);
      
      if (existing) {
        return prev.map(c => 
          c.productId === productId
            ? { ...c, sizes: { ...c.sizes, [talla]: checked } }
            : c
        );
      }
      
      return [...prev, { productId, sizes: { [talla]: checked } }];
    });

    setProducts(prev => 
      prev.map(p => 
        p.id === productId 
          ? { ...p, sizes: { ...p.sizes, [talla]: checked } }
          : p
      )
    );
  };

  const saveChanges = async () => {
    if (changes.length === 0) {
      toast.error('No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/sizes/update-multiple', changes);
      
      if (response.data.success) {
        const results = response.data.data;
        const errors = results?.filter(r => r.error) || [];
        
        if (errors.length === 0) {
          toast.success('¡Todos los cambios guardados!');
        } else {
          toast.success(`${results.length - errors.length} guardados, ${errors.length} errores`);
        }
        
        setChanges([]);
        fetchData();
      }
    } catch (error) {
      toast.error('Error al guardar cambios');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${API_URL}${image}`;
  };

  const changedProductIds = [...new Set(changes.map(c => c.productId))];
  const safeHeaders = Array.isArray(headers) ? headers : [];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
          <div className="pt-4">
            <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Edición Masiva de Tallas</h1>
            <p className="text-xs md:text-sm text-[#999999] mt-1">
              Activa/desactiva tallas para múltiples productos
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {changes.length > 0 && (
            <span className="bg-[#FFD93D]/10 text-[#FFD93D] px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#FFD93D]/20">
              {changedProductIds.length} producto(s) modificado(s)
            </span>
          )}
          <button
            onClick={saveChanges}
            disabled={changes.length === 0 || saving}
            className="px-5 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl text-sm font-semibold
                     hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="relative w-4 h-4">
                  <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                Guardando...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-[#E8E8E8] p-4 shadow-sm">
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   focus:outline-none focus:border-[#7C3AED] transition-all duration-200 w-full sm:w-44"
        >
          <option value="MEN">👨 Hombre</option>
          <option value="WOMEN">👩 Mujer</option>
          <option value="UNISEX">🔄 Unisex</option>
          <option value="KIDS">👶 Infantil</option>
        </select>

        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                     transition-all duration-200"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-[#999999]" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E8E8]">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-[#CCCCCC]" />
          </div>
          <p className="text-[#999999] font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
          <div 
            ref={tableContainerRef}
            className="overflow-auto max-h-[calc(100vh-300px)]"
          >
            <table className="min-w-full divide-y divide-[#E8E8E8] text-sm">
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="sticky left-0 z-30 bg-[#F5F5F5] px-4 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider whitespace-nowrap min-w-[220px] border-b border-[#E8E8E8]">
                    Producto
                  </th>
                  {safeHeaders.map(talla => (
                    <th key={talla} className="px-2 py-3.5 text-center text-xs font-semibold text-[#666666] whitespace-nowrap bg-[#F5F5F5] border-b border-[#E8E8E8]">
                      {talla}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8] bg-white">
                {products.map(producto => {
                  const hasChanges = changedProductIds.includes(producto.id);
                  
                  return (
                    <tr key={producto.id} className={`hover:bg-[#F5F5F5] transition-colors ${
                      hasChanges ? 'bg-[#FFD93D]/5' : ''
                    }`}>
                      <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r border-[#E8E8E8]">
                        <div className="flex items-center gap-3 min-w-[220px] max-w-[320px]">
                          <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-[#F5F5F5] overflow-hidden border border-[#E8E8E8]">
                            {producto.image ? (
                              <img
                                src={getImageUrl(producto.image)}
                                alt=""
                                className="h-9 w-9 object-contain p-1"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="h-9 w-9 flex items-center justify-center">
                                <TableCellsIcon className="h-4 w-4 text-[#CCCCCC]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                              {producto.name}
                            </p>
                            <p className="text-[11px] text-[#999999] font-mono">
                              {producto.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      {safeHeaders.map(talla => {
                        const isChecked = producto.sizes?.[talla] || false;
                        const isChanged = changes.some(
                          c => c.productId === producto.id && c.sizes?.hasOwnProperty(talla)
                        );
                        
                        return (
                          <td key={talla} className={`px-2 py-3 text-center ${isChanged ? 'bg-[#FFD93D]/10' : ''}`}>
                            <div className="flex justify-center">
                              <div className={`relative ${isChanged ? 'scale-110' : ''} transition-transform`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleCheckboxChange(producto.id, talla, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-5 h-5 rounded-md border-2 cursor-pointer transition-all duration-200
                                  ${isChecked 
                                    ? 'bg-[#00FF88] border-[#00FF88]' 
                                    : 'bg-white border-[#CCCCCC] hover:border-[#00FF88]'
                                  }
                                  ${isChanged ? 'ring-2 ring-[#FFD93D] ring-offset-1' : ''}
                                `}>
                                  {isChecked && (
                                    <CheckIcon className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-[#F5F5F5] border-t border-[#E8E8E8] text-xs text-[#999999] flex items-center gap-4">
            <span className="font-medium text-[#666666]">{products.length} productos</span>
            <span className="w-1 h-1 bg-[#CCCCCC] rounded-full" />
            <span className="font-medium text-[#666666]">{safeHeaders.length} tallas</span>
            <span className="hidden sm:inline w-1 h-1 bg-[#CCCCCC] rounded-full" />
            <span className="hidden sm:inline">Click en checkbox para modificar</span>
            {changes.length > 0 && (
              <>
                <span className="w-1 h-1 bg-[#FFD93D] rounded-full" />
                <span className="text-[#FFD93D] font-medium">{changes.length} cambios pendientes</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}