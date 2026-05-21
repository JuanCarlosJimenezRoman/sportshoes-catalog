'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  ShoppingBagIcon, 
  TagIcon, 
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get('/products', { params: { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' } }),
          api.get('/categories'),
          api.get('/brands'),
        ]);

        setRecentProducts(productsRes.data.data || []);
        
        setStats({
          totalProducts: productsRes.data.pagination?.total || 0,
          totalCategories: categoriesRes.data.data?.length || 0,
          totalBrands: brandsRes.data.data?.length || 0,
          averagePrice: productsRes.data.data?.length > 0
            ? productsRes.data.data.reduce((acc, p) => acc + (p.price || 0), 0) / productsRes.data.data.length
            : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="xl" className="mt-20" />;

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      gradient: 'from-[#00FF88] to-[#00FF88]/80',
      bgGradient: 'from-[#00FF88]/10 to-[#00FF88]/5',
      iconBg: 'bg-[#00FF88]/10',
      iconColor: 'text-[#00FF88]',
    },
    {
      title: 'Categorías',
      value: stats.totalCategories,
      icon: TagIcon,
      gradient: 'from-[#7C3AED] to-[#7C3AED]/80',
      bgGradient: 'from-[#7C3AED]/10 to-[#7C3AED]/5',
      iconBg: 'bg-[#7C3AED]/10',
      iconColor: 'text-[#7C3AED]',
    },
    {
      title: 'Marcas',
      value: stats.totalBrands,
      icon: BuildingStorefrontIcon,
      gradient: 'from-[#FFD93D] to-[#FFD93D]/80',
      bgGradient: 'from-[#FFD93D]/10 to-[#FFD93D]/5',
      iconBg: 'bg-[#FFD93D]/10',
      iconColor: 'text-[#FFD93D]',
    },
    {
      title: 'Precio Promedio',
      value: `$${stats.averagePrice.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      gradient: 'from-[#FF6B6B] to-[#FF6B6B]/80',
      bgGradient: 'from-[#FF6B6B]/10 to-[#FF6B6B]/5',
      iconBg: 'bg-[#FF6B6B]/10',
      iconColor: 'text-[#FF6B6B]',
    },
  ];

  return (
    <div>
      <div className="relative mb-10">
        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
        <div className="pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">Dashboard</h1>
            <p className="text-sm text-[#999999] mt-1">Resumen general de tu tienda</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F5F5F5] rounded-xl">
            <ArrowTrendingUpIcon className="h-4 w-4 text-[#00FF88]" />
            <span className="text-xs text-[#666666] font-medium">Actualizado ahora</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-5 md:p-6 border border-[#E8E8E8] 
                       hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
                  {card.title}
                </p>
                <p className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">{card.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className={`h-1 rounded-full bg-gradient-to-r ${card.gradient} opacity-50`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        <Link 
          href="/admin/products" 
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#00FF88] to-[#00FF88]/80 
                   text-[#1A1A1A] rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-[#00FF88]/25 
                   transition-all duration-200 group"
        >
          <ShoppingBagIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          Gestionar Productos
        </Link>
        <Link 
          href="/admin/categories" 
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-[#E8E8E8] 
                   rounded-xl font-semibold text-sm text-[#666666] hover:border-[#7C3AED] hover:text-[#7C3AED] 
                   transition-all duration-200 group"
        >
          <TagIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          Gestionar Categorías
        </Link>
        <Link 
          href="/admin/brands" 
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border-2 border-[#E8E8E8] 
                   rounded-xl font-semibold text-sm text-[#666666] hover:border-[#FFD93D] hover:text-[#1A1A1A] 
                   transition-all duration-200 group"
        >
          <BuildingStorefrontIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
          Gestionar Marcas
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
            Productos recientes
          </h2>
          <Link 
            href="/admin/products" 
            className="text-xs font-medium text-[#7C3AED] hover:text-[#7C3AED]/80 flex items-center gap-1 transition-colors"
          >
            Ver todos
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-[#E8E8E8]">
            <thead>
              <tr className="bg-[#F5F5F5]">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Stock
                </th>
              </tr>
            </thead> 
            <tbody className="divide-y divide-[#E8E8E8]">
              {recentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#F5F5F5] overflow-hidden border border-[#E8E8E8]">
                        <img
                          className="h-10 w-10 object-contain p-1"
                          src={product.images?.[0]?.url?.startsWith('http') ? product.images?.[0]?.url : `http://localhost:3001${product.images[0]?.url}`}
                          alt={product.name}
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1A1A1A]">{product.name}</div>
                        <div className="text-xs text-[#999999]">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg text-xs font-medium">
                      {product.brand?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1A1A1A]">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      product.variants?.reduce((acc, v) => acc + v.stock, 0) > 0
                        ? 'bg-[#00FF88]/10 text-[#00FF88]'
                        : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                    }`}>
                      {product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0} uds.
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}