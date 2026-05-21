'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  CheckIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Edición Masiva de Tallas</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Activa/desactiva tallas para múltiples productos
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {changes.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              {changedProductIds.length} producto(s) modificado(s)
            </span>
          )}
          <button
            onClick={saveChanges}
            disabled={changes.length === 0 || saving}
            className="btn-primary text-xs md:text-sm px-4 py-2 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 md:p-4 rounded-lg shadow-sm">
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          className="input-field text-sm w-full sm:w-40"
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
            className="input-field pl-9 text-sm"
          />
          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Tabla con altura máxima y scroll */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron productos</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Contenedor con altura máxima */}
          <div 
            ref={tableContainerRef}
            className="overflow-auto max-h-[calc(100vh-300px)]"
          >
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              {/* Encabezado fijo */}
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="sticky left-0 z-30 bg-gray-100 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap min-w-[200px] border-b border-gray-200">
                    Producto
                  </th>
                  {safeHeaders.map(talla => (
                    <th key={talla} className="px-2 py-3 text-center text-xs font-mono text-gray-500 whitespace-nowrap bg-gray-100 border-b border-gray-200">
                      {talla}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map(producto => {
                  const hasChanges = changedProductIds.includes(producto.id);
                  
                  return (
                    <tr key={producto.id} className={`hover:bg-gray-50 transition-colors ${hasChanges ? 'bg-yellow-50' : ''}`}>
                      {/* Columna fija del producto */}
                      <td className="sticky left-0 z-10 bg-white px-3 py-2.5 border-r border-gray-100">
                        <div className="flex items-center gap-2 min-w-[200px] max-w-[300px]">
                          <div className="h-8 w-8 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                            {producto.image ? (
                              <img
                                src={getImageUrl(producto.image)}
                                alt=""
                                className="h-8 w-8 object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="h-8 w-8 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                              {producto.name}
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-500 font-mono">
                              {producto.sku}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Checkboxes de tallas */}
                      {safeHeaders.map(talla => {
                        const isChecked = producto.sizes?.[talla] || false;
                        const isChanged = changes.some(
                          c => c.productId === producto.id && c.sizes?.hasOwnProperty(talla)
                        );
                        
                        return (
                          <td key={talla} className={`px-2 py-2.5 text-center ${isChanged ? 'bg-yellow-100' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleCheckboxChange(producto.id, talla, e.target.checked)}
                              className={`h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer ${
                                isChanged ? 'ring-2 ring-yellow-400' : ''
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer siempre visible */}
          <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center gap-4">
            <span>Total: {products.length} productos</span>
            <span>·</span>
            <span>{safeHeaders.length} tallas</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Click en checkbox para modificar</span>
          </div>
        </div>
      )}
    </div>
  );
}