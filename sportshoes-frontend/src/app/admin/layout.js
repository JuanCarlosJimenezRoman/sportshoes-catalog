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
  TableCellsIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Productos', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categorías', href: '/admin/categories', icon: TagIcon },
  { name: 'Marcas', href: '/admin/brands', icon: BuildingStorefrontIcon },
  { name: 'Gestión de Tallas', href: '/admin/sizes', icon: AdjustmentsVerticalIcon },
  { name: 'Importar Excel', href: '/admin/import', icon: DocumentArrowUpIcon },
  { name: 'Edición Masiva', href: '/admin/sizes/massive', icon: TableCellsIcon },
  { name: 'Facebook Sync', href: '/admin/facebook', icon: ShareIcon },
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#00FF88] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">Admin Panel</h2>
            <p className="text-[10px] text-[#999999] uppercase tracking-wider font-medium">SportShoes</p>
          </div>
        </div>
        <button 
          onClick={closeSidebar} 
          className="lg:hidden p-2 rounded-xl hover:bg-[#F5F5F5] text-[#666666] hover:text-[#1A1A1A] transition-all"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#00FF88]/10 to-[#7C3AED]/10 text-[#7C3AED] shadow-sm'
                  : 'text-[#666666] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#7C3AED]/10' 
                  : 'bg-[#F5F5F5] group-hover:bg-[#E8E8E8]'
              }`}>
                <item.icon className={`h-4 w-4 flex-shrink-0 ${
                  isActive ? 'text-[#7C3AED]' : 'text-[#999999] group-hover:text-[#666666]'
                }`} />
              </div>
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] block" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#E8E8E8] pt-4 mt-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#666666] 
                   hover:bg-[#F5F5F5] hover:text-[#1A1A1A] transition-all duration-200 group"
        >
          <div className="p-1.5 rounded-lg bg-[#F5F5F5] group-hover:bg-[#E8E8E8] transition-all">
            <HomeIcon className="h-4 w-4 text-[#999999] group-hover:text-[#666666]" />
          </div>
          <span>Volver a la tienda</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#FF6B6B] 
                   hover:bg-[#FF6B6B]/10 transition-all duration-200 w-full group"
        >
          <div className="p-1.5 rounded-lg bg-[#FF6B6B]/10 group-hover:bg-[#FF6B6B]/20 transition-all">
            <ArrowLeftOnRectangleIcon className="h-4 w-4" />
          </div>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA]">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-20 left-3 z-30 bg-white p-2.5 rounded-xl shadow-lg border border-[#E8E8E8] 
                 hover:shadow-xl hover:border-[#00FF88]/50 transition-all duration-200 group"
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-5 w-5 text-[#666666] group-hover:text-[#1A1A1A]" />
      </button>

      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-16 lg:left-0 lg:w-64 bg-white border-r border-[#E8E8E8] p-5 xl:p-6 overflow-y-auto">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm transition-opacity" 
            onClick={closeSidebar} 
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl p-5 overflow-y-auto animate-slide-in-left">
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="lg:pl-64 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}