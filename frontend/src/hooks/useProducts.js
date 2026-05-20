'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    brandId: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
    ...initialFilters,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clean empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await api.get('/products', { params: cleanFilters });
      
      if (response.data.success) {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1, // Reset to page 1 when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      brandId: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
    });
  };

  return {
    products,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchProducts,
  };
}

export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/products/${slug}`);
        if (response.data.success) {
          setProduct(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
}

export function useFilters() {
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    sizes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products/filters');
        if (response.data.success) {
          setFilters(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  return { filters, loading };
}