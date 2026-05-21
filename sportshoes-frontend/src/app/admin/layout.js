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
  HomeIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Productos', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categorías', href: '/admin/categories', icon: TagIcon },
  { name: 'Marcas', href: '/admin/brands', icon: BuildingStorefrontIcon },
  { name: 'Gestión de Tallas', href: '/admin/sizes', icon: AdjustmentsVerticalIcon },
  { name: 'Importar Excel', href: '/admin/import', icon: DocumentArrowUpIcon },
  { name: 'Edición Masiva', href: '/admin/sizes/massive', icon: TableCellsIcon },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        <button onClick={closeSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-0.5 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <HomeIcon className="h-5 w-5 flex-shrink-0" />
          Volver a la tienda
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-16 left-3 z-30 bg-white p-2 rounded-lg shadow-md border hover:bg-gray-50"
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-5 w-5 text-gray-700" />
      </button>

      {/* Desktop sidebar - SIEMPRE visible en pantallas grandes */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-16 lg:left-0 lg:w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Fondo oscuro */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={closeSidebar} 
          />
          {/* Panel lateral */}
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl p-4 overflow-y-auto animate-slide-in">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:pl-64 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}