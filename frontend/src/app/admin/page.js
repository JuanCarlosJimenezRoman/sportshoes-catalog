'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  ShoppingBagIcon, 
  TagIcon, 
  BuildingStorefrontIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get('/products', { params: { limit: 1 } }),
          api.get('/categories'),
          api.get('/brands'),
        ]);

        const products = productsRes.data.data || [];
        const avgPrice = products.length > 0
          ? products.reduce((acc, p) => acc + (p.price || 0), 0) / products.length
          : 0;

        setStats({
          totalProducts: productsRes.data.pagination?.total || 0,
          totalCategories: categoriesRes.data.data?.length || 0,
          totalBrands: brandsRes.data.data?.length || 0,
          averagePrice: avgPrice,
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
      value: `$${stats.averagePrice.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Panel de Administración
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/products" className="btn-primary text-center">
            Gestionar Productos
          </a>
          <a href="/admin/categories" className="btn-outline text-center">
            Gestionar Categorías
          </a>
          <a href="/admin/brands" className="btn-accent text-center">
            Gestionar Marcas
          </a>
        </div>
      </div>
    </div>
  );
}