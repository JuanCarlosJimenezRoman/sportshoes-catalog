'use client';
import ImportExcel from '@/components/admin/ImportExcel';
import { useRouter } from 'next/navigation';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function ImportPage() {
  const router = useRouter();

  return (
    <div>
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00FF88]/10 to-[#7C3AED]/10 rounded-xl flex items-center justify-center">
              <DocumentArrowUpIcon className="h-5 w-5 text-[#7C3AED]" />
            </div>
            Importar Productos
          </h1>
          <p className="text-sm text-[#999999] mt-2 ml-13">
            Importa productos masivamente desde un archivo Excel
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm p-6">
        <ImportExcel 
          onImportComplete={() => {
            // Opcional: redirigir a productos después de importar
            // router.push('/admin/products');
          }} 
        />
      </div>
    </div>
  );
}