'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SIZE_TABLES = {
  infantil: ['17', '17.5', '18', '18.5', '19', '19.5', '20', '20.5', '21', '21.5', '22', '22.5', '23', '23.5', '24', '24.5', '25'],
  mujer: ['35', '35.5', '36', '36.5', '37', '37.5', '38', '38.5', '39', '39.5', '40', '40.5', '41', '41.5', '42'],
  hombre: ['38', '38.5', '39', '39.5', '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5', '46'],
  unisex: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
};

export default function SizeManager({ product, onUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState('hombre');
  const [sizeTable, setSizeTable] = useState([]);
  const [activeSizes, setActiveSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Determinar categoría según género del producto
  useEffect(() => {
    if (product?.gender) {
      const genderMap = {
        'KIDS': 'infantil',
        'WOMEN': 'mujer',
        'MEN': 'hombre',
        'UNISEX': 'unisex'
      };
      setSelectedCategory(genderMap[product.gender] || 'hombre');
    }
  }, [product]);

  // Cargar tabla de tallas
  const loadSizeTable = useCallback(() => {
    // Usar tabla local directamente
    const table = SIZE_TABLES[selectedCategory] || SIZE_TABLES['hombre'];
    setSizeTable(table);
    setLoading(false);
  }, [selectedCategory]);

  // Cargar tallas activas del producto
  const loadActiveSizes = useCallback(() => {
    if (!product?.id) return;
    
    // Usar las variantes del producto
    if (product.variants && Array.isArray(product.variants)) {
      const sizes = product.variants
        .filter(v => v.stock > 0)
        .map(v => String(v.size));
      setActiveSizes(sizes);
    } else {
      setActiveSizes([]);
    }
  }, [product]);

  useEffect(() => {
    loadSizeTable();
  }, [loadSizeTable]);

  useEffect(() => {
    loadActiveSizes();
  }, [loadActiveSizes]);

  // Toggle de talla individual
  const handleToggleSize = async (size) => {
    if (!product?.id) return;
    
    setSaving(true);
    try {
      const response = await api.post('/sizes/toggle', {
        productId: product.id,
        size: size.toString()
      });
      
      if (response.data.success) {
        setActiveSizes(prev => {
          const sizeStr = size.toString();
          return prev.includes(sizeStr)
            ? prev.filter(s => s !== sizeStr)
            : [...prev, sizeStr];
        });
        toast.success(`Talla ${size} actualizada`);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      // Si falla el endpoint, actualizar localmente de todos modos
      setActiveSizes(prev => {
        const sizeStr = size.toString();
        return prev.includes(sizeStr)
          ? prev.filter(s => s !== sizeStr)
          : [...prev, sizeStr];
      });
      toast.error('Error al actualizar talla (cambio local)');
    } finally {
      setSaving(false);
    }
  };

  // Activar todas las tallas
  const handleActivateAll = () => {
    setActiveSizes(sizeTable.map(s => s.toString()));
    toast.success('Todas las tallas activadas (local)');
  };

  // Desactivar todas las tallas
  const handleDeactivateAll = () => {
    setActiveSizes([]);
    toast.success('Todas las tallas desactivadas (local)');
  };

  if (!product) {
    return <p className="text-gray-500 text-sm p-4">Selecciona un producto para gestionar tallas</p>;
  }

  // Asegurar que sizeTable sea siempre un array
  const safeSizeTable = Array.isArray(sizeTable) ? sizeTable : [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestión de Tallas
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Producto: {product.name} | SKU: {product.sku}
          </p>
        </div>
        
        {/* Selector de categoría */}
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field text-sm w-32"
            disabled={saving}
          >
            <option value="infantil">Infantil</option>
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
            <option value="unisex">Unisex</option>
          </select>
          
          <button
            onClick={handleActivateAll}
            disabled={saving || loading}
            className="btn-primary text-sm px-4 py-2"
          >
            Activar Todas
          </button>
          
          <button
            onClick={handleDeactivateAll}
            disabled={saving || loading || activeSizes.length === 0}
            className="btn-outline text-sm px-4 py-2"
          >
            Desactivar Todas
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-gray-600">
          Total tallas: <strong className="text-gray-900">{safeSizeTable.length}</strong>
        </span>
        <span className="text-green-600">
          Activas: <strong>{activeSizes.length}</strong>
        </span>
        <span className="text-red-600">
          Inactivas: <strong>{safeSizeTable.length - activeSizes.length}</strong>
        </span>
      </div>

      {/* Grid de tallas */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : safeSizeTable.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay tallas disponibles para esta categoría
        </div>
      ) : (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {safeSizeTable.map((size) => {
            const sizeStr = String(size);
            const isActive = activeSizes.includes(sizeStr);
            return (
              <button
                key={sizeStr}
                onClick={() => handleToggleSize(sizeStr)}
                disabled={saving}
                className={`
                  relative px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all
                  ${isActive 
                    ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100' 
                    : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-gray-400'
                  }
                  ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                `}
                title={`Talla ${sizeStr} - ${isActive ? 'Activa' : 'Inactiva'}`}
              >
                {sizeStr}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center gap-6 mt-6 pt-4 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
          <span className="text-gray-600">Talla activa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
          <span className="text-gray-600">Talla inactiva</span>
        </div>
      </div>
    </div>
  );
}