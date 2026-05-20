import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SportShoes - Tu tienda de calzado deportivo',
  description: 'Encuentra las mejores zapatillas deportivas de marcas como Nike, Adidas, Puma y más.',
  keywords: 'zapatillas, deportivas, nike, adidas, running, basketball',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toast />
      </body>
    </html>
  );
}