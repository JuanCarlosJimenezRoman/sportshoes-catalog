'use client';
import ImportExcel from '@/components/admin/ImportExcel';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Importar Productos</h1>
        <p className="text-gray-600 mt-1">
          Importa productos masivamente desde un archivo Excel
        </p>
      </div>

      <ImportExcel 
        onImportComplete={() => {
          // Opcional: redirigir a productos después de importar
          // router.push('/admin/products');
        }} 
      />
    </div>
  );
}