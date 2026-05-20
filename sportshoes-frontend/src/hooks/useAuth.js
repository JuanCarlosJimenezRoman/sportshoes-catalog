'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/api';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = auth.getUser();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        auth.login(token, user);
        setUser(user);
        toast.success('¡Inicio de sesión exitoso!');
        
        // Redirigir según el rol
        if (user.role === 'ADMIN' || user.role === 'GESTOR') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    toast.success('Sesión cerrada');
    router.push('/');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'GESTOR',
  };
}