export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SportShoes. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}