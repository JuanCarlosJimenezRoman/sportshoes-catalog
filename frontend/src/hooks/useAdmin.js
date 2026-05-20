'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useAdminData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/${endpoint}`, {
        params: { page, limit }
      });
      
      if (response.data.success) {
        setData(response.data.data);
        if (response.data.pagination) {
          setTotal(response.data.pagination.total);
        } else {
          setTotal(response.data.data.length);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || `Error al cargar ${endpoint}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, page]);

  const create = async (formData) => {
    try {
      const response = await api.post(`/${endpoint}`, formData);
      if (response.data.success) {
        toast.success('Creado exitosamente');
        fetchData();
        return response.data.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear');
      throw error;
    }
  };

  const update = async (id, formData) => {
    try {
      const response = await api.put(`/${endpoint}/${id}`, formData);
      if (response.data.success) {
        toast.success('Actualizado exitosamente');
        fetchData();
        return response.data.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/${endpoint}/${id}`);
      toast.success('Eliminado exitosamente');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    total,
    page,
    setPage,
    limit,
    create,
    update,
    remove,
    refetch: fetchData,
  };
}