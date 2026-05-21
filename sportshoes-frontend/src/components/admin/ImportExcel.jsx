'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  DocumentArrowDownIcon, 
  DocumentArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

export default function ImportExcel({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const downloadTemplate = async (type = 'simple') => {
    try {
      const endpoint = type === 'simple' 
        ? 'download-template' 
        : 'download-template-sizes';
      
      const response = await api.get(`/products/${endpoint}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'simple' 
        ? 'plantilla_productos.xlsx' 
        : 'plantilla_productos_tallas.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Plantilla ${type === 'simple' ? 'simple' : 'con tallas'} descargada`);
    } catch (error) {
      toast.error('Error al descargar plantilla');
      console.error('Error:', error);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecciona un archivo primero');
      return;
    }

    const validExtensions = ['.xlsx', '.xls'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
      toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/products/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const data = response.data.data;
        setResults(data);
        
        if (data.errors.length === 0) {
          toast.success(`¡${data.success} productos importados correctamente!`);
        } else if (data.success > 0) {
          toast.success(`${data.success} importados, ${data.errors.length} errores`);
        } else {
          toast.error(`Error: ${data.errors.length} productos no se pudieron importar`);
        }
        
        if (onImportComplete) onImportComplete();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al importar archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResults(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <ExclamationTriangleIcon className="h-4 w-4 text-[#7C3AED]" />
          </div>
          <div className="text-sm text-[#1A1A1A]">
            <p className="font-semibold mb-3">Dos tipos de plantilla disponibles:</p>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 bg-white rounded-xl p-2.5">
                <TableCellsIcon className="h-4 w-4 text-[#00FF88] flex-shrink-0" />
                <span><strong>Plantilla Simple:</strong> Productos sin tallas (nombre, SKU, precio, colores, etc.)</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-xl p-2.5">
                <Squares2X2Icon className="h-4 w-4 text-[#7C3AED] flex-shrink-0" />
                <span><strong>Plantilla con Tallas:</strong> Incluye columnas para tallas y stock por cada una</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
          1. Descargar Plantilla
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => downloadTemplate('simple')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-[#E8E8E8] 
                     rounded-xl text-sm font-medium text-[#666666] hover:border-[#00FF88] hover:text-[#1A1A1A]
                     transition-all duration-200 group"
          >
            <DocumentArrowDownIcon className="h-5 w-5 group-hover:text-[#00FF88] transition-colors" />
            Plantilla Simple
            <span className="text-xs text-[#999999]">(sin tallas)</span>
          </button>
          <button
            onClick={() => downloadTemplate('sizes')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] 
                     rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-[#7C3AED]/25 
                     transition-all duration-200 group"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Plantilla con Tallas
            <span className="text-xs opacity-80">(recomendada)</span>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
          2. Subir Archivo
        </h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
            dragOver 
              ? 'border-[#00FF88] bg-[#00FF88]/5 shadow-lg shadow-[#00FF88]/10' 
              : 'border-[#E8E8E8] hover:border-[#7C3AED]/50 hover:bg-[#F5F5F5]'
          }`}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DocumentArrowUpIcon className="h-8 w-8 text-[#999999]" />
            </div>
            <p className="text-[#666666] font-medium mb-2">
              {file ? file.name : 'Arrastra un archivo Excel o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-[#999999]">
              Formatos aceptados: .xlsx, .xls
            </p>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
          3. Importar
        </h3>
        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="w-full py-3.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl font-semibold
                   hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                   flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
              </div>
              Importando productos...
            </>
          ) : (
            <>
              <DocumentArrowUpIcon className="h-5 w-5" />
              Importar Productos
            </>
          )}
        </button>
        {file && (
          <p className="text-xs text-[#999999] mt-2 text-center">
            Archivo: <span className="font-medium text-[#666666]">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {results && (
        <div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
            Resultados de Importación
          </h3>
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-sm">
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#F5F5F5] rounded-2xl p-5 text-center">
                <p className="text-3xl font-bold text-[#1A1A1A] mb-1">{results.total}</p>
                <p className="text-xs text-[#666666] font-medium">Total procesado</p>
              </div>
              <div className="bg-gradient-to-br from-[#00FF88]/10 to-[#00FF88]/5 rounded-2xl p-5 text-center border border-[#00FF88]/20">
                <CheckCircleIcon className="h-6 w-6 text-[#00FF88] mx-auto mb-1" />
                <p className="text-3xl font-bold text-[#00FF88] mb-1">{results.success}</p>
                <p className="text-xs text-[#00FF88] font-medium">Importados con éxito</p>
              </div>
              <div className="bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF6B6B]/5 rounded-2xl p-5 text-center border border-[#FF6B6B]/20">
                <XCircleIcon className="h-6 w-6 text-[#FF6B6B] mx-auto mb-1" />
                <p className="text-3xl font-bold text-[#FF6B6B] mb-1">{results.errors.length}</p>
                <p className="text-xs text-[#FF6B6B] font-medium">Errores</p>
              </div>
            </div>

            {results.products && results.products.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#00FF88] rounded-full" />
                  Detalle de Productos Procesados
                </h4>
                <div className="bg-[#F5F5F5] rounded-xl p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {results.products.map((p, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 text-sm">
                        <span className="font-semibold text-[#1A1A1A]">{p.sku}</span>
                        <span className="text-[#666666]">: {p.variantsCreated || 0} tallas, {p.imagesCreated || 0} imágenes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-[#FF6B6B] mb-3 flex items-center gap-2">
                  <XCircleIcon className="h-5 w-5" />
                  Detalle de errores ({results.errors.length})
                </h4>
                <div className="bg-[#FF6B6B]/5 rounded-xl p-4 max-h-64 overflow-y-auto border border-[#FF6B6B]/10">
                  <div className="space-y-2">
                    {results.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm bg-white rounded-lg p-2.5">
                        <XCircleIcon className="h-4 w-4 text-[#FF6B6B] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-[#1A1A1A]">Fila {err.row}</span>
                          {err.sku && <span className="font-medium text-[#1A1A1A]"> - {err.sku}</span>}
                          <span className="text-[#666666]">: {err.error}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {results.errors.length === 0 && results.success > 0 && (
              <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#7C3AED]/10 rounded-xl p-5 
                            flex items-center gap-3 border border-[#00FF88]/20">
                <CheckCircleIcon className="h-6 w-6 text-[#00FF88]" />
                <p className="text-[#1A1A1A] font-semibold">
                  ¡Todos los productos ({results.success}) fueron importados correctamente!
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}