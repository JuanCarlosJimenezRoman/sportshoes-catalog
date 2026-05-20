'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  BuildingStorefrontIcon 
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Productos', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Categorías', href: '/admin/categories', icon: TagIcon },
  { name: 'Marcas', href: '/admin/brands', icon: BuildingStorefrontIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Administración
      </h2>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}