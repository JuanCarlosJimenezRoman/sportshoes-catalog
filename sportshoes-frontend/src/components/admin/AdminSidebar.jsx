'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  BuildingStorefrontIcon,
  AdjustmentsVerticalIcon,
  DocumentArrowUpIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Productos', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categorías', href: '/admin/categories', icon: TagIcon },
  { name: 'Marcas', href: '/admin/brands', icon: BuildingStorefrontIcon },
  { name: 'Gestión de Tallas', href: '/admin/sizes', icon: AdjustmentsVerticalIcon },
  { name: 'Importar Excel', href: '/admin/import', icon: DocumentArrowUpIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-0.5 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t pt-4 mt-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <HomeIcon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Volver a la tienda</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-20 left-3 z-40 bg-white p-2 rounded-lg shadow-md border hover:bg-gray-50"
      >
        <Bars3Icon className="h-5 w-5 text-gray-700" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 xl:p-6">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setMobileOpen(false)} 
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl p-4">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}