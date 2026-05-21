'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function TestAuthPage() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    setToken(storedToken);
    
    if (storedToken) {
      api.get('/auth/profile')
        .then(response => {
          setUserData(response.data.data);
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Error al obtener perfil');
        });
    } else {
      setError('No hay token almacenado');
    }
  }, []);

  const testEndpoints = async () => {
    setTesting(true);
    try {
      const productsRes = await api.get('/products', { params: { limit: 1 } });
      console.log('Productos:', productsRes.data);
      
      const categoriesRes = await api.get('/categories');
      console.log('Categorías:', categoriesRes.data);
      
      const brandsRes = await api.get('/brands');
      console.log('Marcas:', brandsRes.data);
      
      alert('Todos los endpoints responden correctamente. Ver consola para detalles.');
    } catch (error) {
      console.error('Error en endpoints:', error);
      alert('Error en endpoints: ' + (error.response?.data?.message || error.message));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
        <h1 className="text-2xl font-bold text-[#1A1A1A] pt-4">Test de Autenticación</h1>
        <p className="text-sm text-[#999999] mt-1">Verifica el estado de autenticación y conexión</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
          Información del Token
        </h2>
        
        {token ? (
          <div className="bg-gradient-to-r from-[#00FF88]/10 to-[#00FF88]/5 rounded-xl p-4 mb-4 border border-[#00FF88]/20 flex items-center gap-3">
            <CheckCircleIcon className="h-5 w-5 text-[#00FF88] flex-shrink-0" />
            <span className="text-sm font-medium text-[#00FF88]">Token encontrado</span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF6B6B]/5 rounded-xl p-4 mb-4 border border-[#FF6B6B]/20 flex items-center gap-3">
            <XCircleIcon className="h-5 w-5 text-[#FF6B6B] flex-shrink-0" />
            <span className="text-sm font-medium text-[#FF6B6B]">No hay token</span>
          </div>
        )}
        
        <div className="bg-[#F5F5F5] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Token Value</p>
          <code className="text-sm text-[#1A1A1A] break-all font-mono">
            {token ? `${token.substring(0, 50)}...` : 'No token'}
          </code>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-[#00FF88] to-[#7C3AED] rounded-full" />
          Datos del Usuario
        </h2>
        
        {error ? (
          <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-[#FF6B6B]/5 rounded-xl p-4 border border-[#FF6B6B]/20 flex items-center gap-3">
            <XCircleIcon className="h-5 w-5 text-[#FF6B6B] flex-shrink-0" />
            <span className="text-sm text-[#FF6B6B]">{error}</span>
          </div>
        ) : userData ? (
          <div className="bg-[#F5F5F5] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">Profile Data</p>
              <span className="px-2 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg text-xs font-medium">
                {userData.role}
              </span>
            </div>
            <pre className="text-sm text-[#1A1A1A] overflow-auto font-mono bg-white rounded-lg p-3 border border-[#E8E8E8]">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}
      </div>

      <button 
        onClick={testEndpoints}
        disabled={testing}
        className="w-full py-3.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl font-semibold
                 hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {testing ? (
          <>
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
            Probando endpoints...
          </>
        ) : (
          'Probar Endpoints'
        )}
      </button>
    </div>
  );
}