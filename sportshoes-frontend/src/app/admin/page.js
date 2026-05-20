'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  ShoppingBagIcon, 
  TagIcon, 
  BuildingStorefrontIcon,
  CurrencyDollarIcon 
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
      color: 'bg-blue-500',
    },
    {
      title: 'Categorías',
      value: stats.totalCategories,
      icon: TagIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Marcas',
      value: stats.totalBrands,
      icon: BuildingStorefrontIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Precio Promedio',
      value: `€${stats.averagePrice.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/products" className="btn-primary text-center">
          Gestionar Productos
        </Link>
        <Link href="/admin/categories" className="btn-outline text-center">
          Gestionar Categorías
        </Link>
        <Link href="/admin/brands" className="btn-accent text-center">
          Gestionar Marcas
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Productos recientes</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={product.images?.[0]?.url || '/placeholder.jpg'}
                          alt={product.name}
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.brand?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">€{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.variants?.reduce((acc, v) => acc + v.stock, 0) > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
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