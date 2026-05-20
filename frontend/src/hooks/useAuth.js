'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = auth.getUser();
    if (userData) {
      setUser(userData);
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      auth.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        auth.login(token, user);
        setUser(user);
        toast.success('¡Inicio de sesión exitoso!');
        
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        auth.login(token, user);
        setUser(user);
        toast.success('¡Registro exitoso!');
        router.push('/');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrarse');
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
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };
}