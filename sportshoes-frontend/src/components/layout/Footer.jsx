export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/5 to-[#7C3AED]/5" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00FF88] to-[#7C3AED] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">
                Sport<span className="text-[#00FF88]">Shoes</span>
              </span>
            </div>
            <p className="text-[#999999] text-sm leading-relaxed">
              Tu tienda de confianza para encontrar los mejores tenis. Calidad, estilo y comodidad en cada paso.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#00FF88] rounded-full" />
              Enlaces rápidos
            </h3>
            <ul className="space-y-2">
              {['Catálogo', 'Nuevos lanzamientos', 'Ofertas', 'Contacto'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#999999] hover:text-[#00FF88] text-sm transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#7C3AED] rounded-full" />
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-[#999999]">
              <li className="hover:text-[#00FF88] transition-colors duration-200 cursor-pointer">
                📧 info@sportshoes.com
              </li>
              <li className="hover:text-[#00FF88] transition-colors duration-200 cursor-pointer">
                📱 WhatsApp: +52 55 1234 5678
              </li>
              <li className="hover:text-[#00FF88] transition-colors duration-200 cursor-pointer">
                🚚 Envíos a todo México
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#333333]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#666666] text-sm">
              &copy; {new Date().getFullYear()} SportShoes. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              {['Términos', 'Privacidad', 'Cookies'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs text-[#666666] hover:text-[#00FF88] transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 