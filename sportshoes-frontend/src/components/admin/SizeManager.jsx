'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SIZE_TABLES = {
  infantil: ['10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '15.5', '16', '16.5', '17', '17.5', '18', '18.5', '19', '19.5', '20', '20.5', '21', '21.5', '22', '22.5'],
  mujer: ['23', '23.5', '24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5', '29', '29.5', '30', '30.5', '31', '31.5', '32'],
  hombre: ['23', '23.5', '24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5', '29', '29.5', '30', '30.5', '31', '31.5', '32', '32.5', '33', '33.5', '34'],
  unisex: ['23', '23.5', '24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5', '29', '29.5', '30', '30.5', '31', '31.5', '32'],
};

export default function SizeManager({ product, onUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState('hombre');
  const [sizeTable, setSizeTable] = useState([]);
  const [activeSizes, setActiveSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const loadSizeTable = useCallback(() => {
    const table = SIZE_TABLES[selectedCategory] || SIZE_TABLES['hombre'];
    setSizeTable(table);
    setLoading(false);
  }, [selectedCategory]);

  const loadActiveSizes = useCallback(() => {
    if (!product?.id) return;
    
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
      setActiveSizes(prev => {
        const sizeStr = size.toString();
        return prev.includes(sizeStr)
          ? prev.filter(s => s !== sizeStr)
          : [...prev, sizeStr];
      });
      toast.error('Cambio local');
    } finally {
      setSaving(false);
    }
  };

  const handleActivateAll = () => {
    setActiveSizes(sizeTable.map(s => s.toString()));
    toast.success('Todas las tallas activadas');
  };

  const handleDeactivateAll = () => {
    setActiveSizes([]);
    toast.success('Todas las tallas desactivadas');
  };

  if (!product) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <p className="text-gray-500 text-sm">Selecciona un producto para gestionar tallas</p>
      </div>
    );
  }

  const safeSizeTable = Array.isArray(sizeTable) ? sizeTable : [];
  const activeCount = activeSizes.length;
  const inactiveCount = safeSizeTable.length - activeCount;

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
            Gestión de Tallas
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
            {product.name} · {product.sku}
          </p>
        </div>
        
        {/* Controles */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field text-xs md:text-sm w-28 md:w-32 py-1.5"
            disabled={saving}
          >
            <option value="infantil">Infantil</option>
            <option value="mujer">Mujer</option>
            <option value="hombre">Hombre</option>
            <option value="unisex">Unisex</option>
          </select>
          
          <div className="flex gap-1.5">
            <button
              onClick={handleActivateAll}
              disabled={saving || loading}
              className="btn-primary text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
            >
              <span className="hidden sm:inline">Activar Todas</span>
              <span className="sm:hidden">✓ Todos</span>
            </button>
            
            <button
              onClick={handleDeactivateAll}
              disabled={saving || loading || activeSizes.length === 0}
              className="btn-outline text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
            >
              <span className="hidden sm:inline">Desactivar Todas</span>
              <span className="sm:hidden">✕ Todos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
        <div className="bg-gray-50 rounded-lg p-2 md:p-3 text-center">
          <p className="text-lg md:text-2xl font-bold text-gray-900">{safeSizeTable.length}</p>
          <p className="text-[10px] md:text-xs text-gray-600">Total</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 md:p-3 text-center">
          <p className="text-lg md:text-2xl font-bold text-green-700">{activeCount}</p>
          <p className="text-[10px] md:text-xs text-green-600">Activas</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2 md:p-3 text-center">
          <p className="text-lg md:text-2xl font-bold text-red-700">{inactiveCount}</p>
          <p className="text-[10px] md:text-xs text-red-600">Inactivas</p>
        </div>
      </div>

      {/* Grid de tallas */}
      {loading ? (
        <div className="flex justify-center py-8 md:py-12">
          <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : safeSizeTable.length === 0 ? (
        <div className="text-center py-8 md:py-12 text-gray-500 text-sm">
          No hay tallas para esta categoría
        </div>
      ) : (
        <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1 md:gap-2">
          {safeSizeTable.map((size) => {
            const sizeStr = String(size);
            const isActive = activeSizes.includes(sizeStr);
            return (
              <button
                key={sizeStr}
                onClick={() => handleToggleSize(sizeStr)}
                disabled={saving}
                className={`
                  relative px-1.5 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg border-2 transition-all
                  ${isActive 
                    ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100 active:bg-green-200' 
                    : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-gray-400 active:bg-gray-100'
                  }
                  ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                `}
                title={`Talla ${sizeStr} - ${isActive ? 'Activa' : 'Inactiva'}`}
              >
                <span className="block leading-none">{sizeStr}</span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border border-white"></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-6 pt-3 md:pt-4 border-t">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-green-50 border-2 border-green-500 rounded"></div>
          <span className="text-[10px] md:text-sm text-gray-600">Activa</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-50 border-2 border-gray-300 rounded"></div>
          <span className="text-[10px] md:text-sm text-gray-600">Inactiva</span>
        </div>
        <div className="hidden sm:block text-[10px] md:text-xs text-gray-400 ml-auto">
          Click para alternar
        </div>
      </div>
    </div>
  );
}