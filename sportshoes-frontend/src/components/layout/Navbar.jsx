'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
    window.location.reload();
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'GESTOR';

  return (
    <nav className="bg-[#1A1A1A] sticky top-0 z-40 backdrop-blur-md bg-opacity-95 border-b border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#00FF88] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-[#00FF88]/20 group-hover:shadow-[#00FF88]/40 transition-shadow">
              <ShoppingBagIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Sport<span className="text-[#00FF88]">Shoes</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tenis..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#2A2A2A] border border-[#333333] rounded-xl text-white 
                         placeholder-[#666666] focus:outline-none focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88]/50
                         transition-all duration-200"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-[#666666] group-focus-within:text-[#00FF88] transition-colors" />
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="relative px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#7C3AED]/80 text-white rounded-xl text-sm font-medium 
                             hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200 overflow-hidden group"
                  >
                    <span className="relative z-10">Panel Admin</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )}
                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-[#CCCCCC] hover:text-white transition-colors">
                  <UserCircleIcon className="h-5 w-5 text-[#00FF88]" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[#999999] hover:text-[#FF6B6B] px-3 py-2 rounded-lg hover:bg-[#FF6B6B]/10 transition-all duration-200"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="px-5 py-2.5 bg-[#00FF88] text-[#1A1A1A] rounded-xl text-sm font-semibold
                         hover:bg-[#00FF88]/90 hover:shadow-lg hover:shadow-[#00FF88]/25 transition-all duration-200"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-white hover:bg-[#2A2A2A] transition-colors"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}