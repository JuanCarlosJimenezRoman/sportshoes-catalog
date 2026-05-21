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
    <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-4 sm:p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
            Gestión de Tallas
          </h3>
          <p className="text-xs md:text-sm text-[#999999] mt-1 truncate">
            {product.name} · <span className="font-medium text-[#666666]">{product.sku}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-xs md:text-sm text-[#1A1A1A]
                     focus:outline-none focus:border-[#7C3AED] transition-all duration-200"
            disabled={saving}
          >
            <option value="infantil">👶 Infantil</option>
            <option value="mujer">👩 Mujer</option>
            <option value="hombre">👨 Hombre</option>
            <option value="unisex">🔄 Unisex</option>
          </select>
          
          <div className="flex gap-1.5">
            <button
              onClick={handleActivateAll}
              disabled={saving || loading}
              className="px-3 py-2 bg-gradient-to-r from-[#00FF88] to-[#00FF88]/80 text-[#1A1A1A] rounded-xl text-xs md:text-sm 
                       font-semibold hover:shadow-lg hover:shadow-[#00FF88]/25 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Activar Todas</span>
              <span className="sm:hidden">✓ Todos</span>
            </button>
            
            <button
              onClick={handleDeactivateAll}
              disabled={saving || loading || activeSizes.length === 0}
              className="px-3 py-2 bg-white border-2 border-[#E8E8E8] rounded-xl text-xs md:text-sm font-medium
                       text-[#666666] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Desactivar Todas</span>
              <span className="sm:hidden">✕ Todos</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-[#F5F5F5] rounded-2xl p-3 md:p-4 text-center">
          <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1">{safeSizeTable.length}</p>
          <p className="text-[10px] md:text-xs text-[#666666] font-medium uppercase tracking-wider">Total</p>
        </div>
        <div className="bg-gradient-to-br from-[#00FF88]/10 to-[#00FF88]/5 rounded-2xl p-3 md:p-4 text-center border border-[#00FF88]/20">
          <p className="text-2xl md:text-3xl font-bold text-[#00FF88] mb-1">{activeCount}</p>
          <p className="text-[10px] md:text-xs text-[#00FF88] font-medium uppercase tracking-wider">Activas</p>
        </div>
        <div className="bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF6B6B]/5 rounded-2xl p-3 md:p-4 text-center border border-[#FF6B6B]/20">
          <p className="text-2xl md:text-3xl font-bold text-[#FF6B6B] mb-1">{inactiveCount}</p>
          <p className="text-[10px] md:text-xs text-[#FF6B6B] font-medium uppercase tracking-wider">Inactivas</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-[#E8E8E8]" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00FF88] animate-spin" />
          </div>
        </div>
      ) : safeSizeTable.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[#999999] text-sm">No hay tallas para esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {safeSizeTable.map((size) => {
            const sizeStr = String(size);
            const isActive = activeSizes.includes(sizeStr);
            return (
              <button
                key={sizeStr}
                onClick={() => handleToggleSize(sizeStr)}
                disabled={saving}
                className={`
                  relative px-2 md:px-3 py-2.5 md:py-3 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#00FF88]/20 to-[#7C3AED]/20 text-[#7C3AED] border-2 border-[#7C3AED]/50 shadow-md scale-105' 
                    : 'bg-[#F5F5F5] text-[#999999] border-2 border-transparent hover:border-[#E8E8E8] hover:text-[#666666]'
                  }
                  ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                `}
                title={`Talla ${sizeStr} - ${isActive ? 'Activa' : 'Inactiva'}`}
              >
                <span className="block">{sizeStr}</span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FF88] rounded-full border-2 border-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#E8E8E8]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-[#00FF88]/20 to-[#7C3AED]/20 border-2 border-[#7C3AED]/50 rounded-lg" />
          <span className="text-xs md:text-sm text-[#666666] font-medium">Activa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#F5F5F5] border-2 border-transparent rounded-lg" />
          <span className="text-xs md:text-sm text-[#999999] font-medium">Inactiva</span>
        </div>
        <div className="hidden sm:block text-xs text-[#CCCCCC] ml-auto">
          Click para alternar
        </div>
      </div>
    </div>
  );
}