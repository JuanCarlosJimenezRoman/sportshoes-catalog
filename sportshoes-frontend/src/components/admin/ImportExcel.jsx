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
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Dos tipos de plantilla disponibles:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <TableCellsIcon className="h-4 w-4 flex-shrink-0" />
                <span><strong>Plantilla Simple:</strong> Productos sin tallas (nombre, SKU, precio, colores, etc.)</span>
              </li>
              <li className="flex items-center gap-2">
                <Squares2X2Icon className="h-4 w-4 flex-shrink-0" />
                <span><strong>Plantilla con Tallas:</strong> Incluye columnas para tallas y stock por cada una</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botones de descarga */}
      <div>
        <h3 className="text-lg font-semibold mb-3">1. Descargar Plantilla</h3>
        <div className="flex gap-3">
          <button
            onClick={() => downloadTemplate('simple')}
            className="btn-outline flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Plantilla Simple
            <span className="text-xs text-gray-500">(sin tallas)</span>
          </button>
          <button
            onClick={() => downloadTemplate('sizes')}
            className="btn-primary flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Plantilla con Tallas
            <span className="text-xs opacity-75">(recomendada)</span>
          </button>
        </div>
      </div>

      {/* Área de subida */}
      <div>
        <h3 className="text-lg font-semibold mb-3">2. Subir Archivo</h3>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
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
            <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">
              {file ? file.name : 'Arrastra un archivo Excel o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-500">
              Formatos aceptados: .xlsx, .xls
            </p>
          </label>
        </div>
      </div>

      {/* Botón de importación */}
      <div>
        <h3 className="text-lg font-semibold mb-3">3. Importar</h3>
        <button
          onClick={handleImport}
          disabled={loading || !file}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <p className="text-xs text-gray-500 mt-2 text-center">
            Archivo: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Resultados */}
{results && (
  <div>
    <h3 className="text-lg font-semibold mb-3">Resultados de Importación</h3>
    <div className="bg-white rounded-lg shadow-sm border p-6">
      
      {/* Grid de Contadores Principales */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{results.total}</p>
          <p className="text-sm text-gray-600">Total procesado</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircleIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-green-700">{results.success}</p>
          <p className="text-sm text-green-600">Importados con éxito</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircleIcon className="h-6 w-6 text-red-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-700">{results.errors.length}</p>
          <p className="text-sm text-red-600">Errores</p>
        </div>
      </div>

      {/* DETALLE DE PRODUCTOS IMPORTADOS (Nuevo bloque integrado sin perder nada) */}
      {results.products && results.products.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            📦 Detalle de Productos Procesados:
          </h4>
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-100">
            <div className="space-y-1.5">
              {results.products.map((p, i) => (
                <p key={i} className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">{p.sku}</span>: {p.variantsCreated || 0} tallas, {p.imagesCreated || 0} imágenes creadas.
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LISTA DE ERRORES (Combinando el estilo limpio con tus variables originales) */}
      {results.errors.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
            <XCircleIcon className="h-5 w-5" />
            Detalle de errores ({results.errors.length}):
          </h4>
          <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {results.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-red-700">Fila {err.row}</span>
                    {err.sku && <span className="font-medium text-red-700"> - {err.sku}</span>}
                    <span className="text-red-600">: {err.error}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de Éxito Limpio Total */}
      {results.errors.length === 0 && results.success > 0 && (
        <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
          <p className="text-green-800 font-medium">
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