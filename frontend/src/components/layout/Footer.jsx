import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShoppingBagIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Sport<span className="text-primary-400">Shoes</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Tu tienda de calzado deportivo favorita. Encuentra las mejores marcas y modelos para tu actividad deportiva.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Enlaces rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/brand/nike" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Nike
                </Link>
              </li>
              <li>
                <Link href="/brand/adidas" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Adidas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Contacto
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">info@sportshoes.com</li>
              <li className="text-gray-400 text-sm">+34 900 123 456</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SportShoes. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}