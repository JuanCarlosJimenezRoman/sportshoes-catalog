'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ShoppingBagIcon,
  CloudArrowUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function FacebookSyncPage() {
  const [status, setStatus] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, reportRes] = await Promise.all([
        api.get('/facebook/status'),
        api.get('/facebook/report')
      ]);
      
      if (statusRes.data.success) setStatus(statusRes.data.data);
      if (reportRes.data.success) setReport(reportRes.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos de Facebook');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const syncAll = async () => {
    if (!confirm('¿Sincronizar todos los productos con Facebook?')) return;
    
    setSyncing(true);
    try {
      const response = await api.post('/facebook/sync-all');
      if (response.data.success) {
        toast.success(`Sincronizados: ${response.data.data.synced}/${response.data.data.total}`);
        fetchData();
      }
    } catch (error) {
      toast.error('Error al sincronizar');
      console.error('Error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const syncSingle = async (productId) => {
    try {
      const response = await api.post(`/facebook/sync/${productId}`);
      if (response.data.success) {
        toast.success('Producto sincronizado');
        fetchData();
      }
    } catch (error) {
      toast.error('Error al sincronizar producto');
    }
  };

  const deleteFromFacebook = async (productId) => {
    if (!confirm('¿Eliminar este producto de Facebook?')) return;
    
    try {
      await api.delete(`/facebook/${productId}`);
      toast.success('Producto eliminado de Facebook');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const downloadFeed = () => {
    window.open('http://localhost:3001/api/facebook/feed', '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facebook Catalog Sync</h1>
        <p className="text-gray-500 mt-1">
          Sincroniza tu catálogo de productos con Facebook/Instagram Shop
        </p>
      </div>

      {/* Tarjetas de estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Catálogo</p>
              <p className="text-xl font-bold text-gray-900">
                {status?.name || 'No conectado'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CloudArrowUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En Facebook</p>
              <p className="text-xl font-bold text-gray-900">
                {report?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ExclamationCircleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-xl font-bold text-orange-600">
                {report?.needsSync || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Locales</p>
              <p className="text-xl font-bold text-gray-900">
                {report?.localTotal || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">Sincronización Masiva</h2>
            <p className="text-sm text-gray-500">
              {report?.needsSync || 0} productos pendientes de sincronizar
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadFeed}
              className="btn-outline text-sm flex items-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Descargar XML Feed
            </button>
            <button
              onClick={syncAll}
              disabled={syncing}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-4 w-4" />
                  Sincronizar Todo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Endpoints disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { method: 'GET', path: '/api/facebook/status', desc: 'Estado del catálogo' },
            { method: 'GET', path: '/api/facebook/report', desc: 'Reporte de sincronización' },
            { method: 'GET', path: '/api/facebook/feed', desc: 'XML Feed para Google/Facebook' },
            { method: 'POST', path: '/api/facebook/sync/:id', desc: 'Sincronizar un producto' },
            { method: 'POST', path: '/api/facebook/sync-all', desc: 'Sincronizar todos' },
            { method: 'DELETE', path: '/api/facebook/:id', desc: 'Eliminar de Facebook' },
          ].map((endpoint, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
              <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {endpoint.method}
              </span>
              <div>
                <p className="text-sm font-mono text-gray-700">{endpoint.path}</p>
                <p className="text-xs text-gray-500">{endpoint.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}