'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export default function TestAuthPage() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

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
    try {
      // Probar productos
      const productsRes = await api.get('/products', { params: { limit: 1 } });
      console.log('Productos:', productsRes.data);
      
      // Probar categorías
      const categoriesRes = await api.get('/categories');
      console.log('Categorías:', categoriesRes.data);
      
      // Probar marcas
      const brandsRes = await api.get('/brands');
      console.log('Marcas:', brandsRes.data);
      
      alert('Todos los endpoints responden correctamente. Ver consola para detalles.');
    } catch (error) {
      console.error('Error en endpoints:', error);
      alert('Error en endpoints: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Test de Autenticación</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Información del Token</h2>
        {token ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
            ✓ Token encontrado
          </div>
        ) : (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            ✗ No hay token
          </div>
        )}
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {token ? `${token.substring(0, 50)}...` : 'No token'}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Datos del Usuario</h2>
        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : userData ? (
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify(userData, null, 2)}
          </pre>
        ) : (
          <LoadingSpinner />
        )}
      </div>

      <button onClick={testEndpoints} className="btn-primary">
        Probar Endpoints
      </button>
    </div>
  );
}