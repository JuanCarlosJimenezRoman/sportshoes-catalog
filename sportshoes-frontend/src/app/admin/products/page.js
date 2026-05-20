'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../lib/api';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Pagination from '../../../components/ui/Pagination';
import { formatPrice, parseJSON } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const limit = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', { params: { page, limit } });
      if (response.data.success) {
        setProducts(response.data.data);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Producto eliminado exitosamente');
        fetchProducts();
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await api.post('/products', formData);
        toast.success('Producto creado exitosamente');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar producto');
    }
  };

  if (loading && products.length === 0) return <LoadingSpinner size="xl" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos ({total})</h1>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={product.images?.[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.brand?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.category?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatPrice(product.price)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={setPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="xl"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function ProductForm({ product, onSubmit, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: product ? {
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      gender: product.gender || 'UNISEX',
      categoryId: product.categoryId || product.category?.id || '',
      brandId: product.brandId || product.brand?.id || '',
      colors: Array.isArray(product.colors) 
        ? product.colors.join(', ') 
        : typeof product.colors === 'string' 
          ? parseJSON(product.colors).join(', ') 
          : '',
      materials: Array.isArray(product.materials) 
        ? product.materials.join(', ') 
        : typeof product.materials === 'string' 
          ? parseJSON(product.materials).join(', ') 
          : '',
      tags: Array.isArray(product.tags) 
        ? product.tags.join(', ') 
        : typeof product.tags === 'string' 
          ? parseJSON(product.tags).join(', ') 
          : '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
    } : {
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      gender: 'UNISEX',
      categoryId: '',
      brandId: '',
      colors: '',
      materials: '',
      tags: '',
      isActive: true,
      isFeatured: false,
    }
  });

  // Cargar categorías y marcas para los selects
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]);
        
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.data);
        }
        if (brandsRes.data.success) {
          setBrands(brandsRes.data.data);
        }
      } catch (error) {
        toast.error('Error al cargar datos');
        console.error('Error loading form data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  const handleFormSubmit = (data) => {
    // Convertir strings a arrays para el backend
    const formattedData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price) || 0,
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      gender: data.gender,
      categoryId: data.categoryId,
      brandId: data.brandId,
      colors: data.colors 
        ? data.colors.split(',').map(c => c.trim()).filter(Boolean) 
        : [],
      materials: data.materials 
        ? data.materials.split(',').map(m => m.trim()).filter(Boolean) 
        : [],
      tags: data.tags 
        ? data.tags.split(',').map(t => t.trim()).filter(Boolean) 
        : [],
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    };

    console.log('Enviando datos:', formattedData);
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del producto *
        </label>
        <input 
          {...register('name', { required: 'El nombre es requerido' })} 
          className="input-field"
          placeholder="Ej: Nike Air Max 90"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea 
          {...register('description')} 
          rows={3} 
          className="input-field"
          placeholder="Describe el producto..."
        />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio *
          </label>
          <input 
            type="number" 
            step="0.01" 
            {...register('price', { 
              required: 'El precio es requerido',
              min: { value: 0, message: 'El precio debe ser positivo' }
            })} 
            className="input-field"
            placeholder="0.00"
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio comparado (opcional)
          </label>
          <input 
            type="number" 
            step="0.01" 
            {...register('comparePrice')} 
            className="input-field"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Género */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Género
        </label>
        <select {...register('gender')} className="input-field">
          <option value="UNISEX">Unisex</option>
          <option value="MEN">Hombre</option>
          <option value="WOMEN">Mujer</option>
          <option value="KIDS">Niños</option>
        </select>
      </div>

      {/* Categoría y Marca */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select 
            {...register('categoryId', { required: 'La categoría es requerida' })} 
            className="input-field"
            disabled={loadingData}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca *
          </label>
          <select 
            {...register('brandId', { required: 'La marca es requerida' })} 
            className="input-field"
            disabled={loadingData}
          >
            <option value="">Seleccionar marca</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId.message}</p>}
        </div>
      </div>

      {/* Arrays: Colores, Materiales, Tags */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Colores
          </label>
          <input 
            {...register('colors')} 
            className="input-field"
            placeholder="red, blue, black"
          />
          <p className="text-xs text-gray-500 mt-1">Separados por coma</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Materiales
          </label>
          <input 
            {...register('materials')} 
            className="input-field"
            placeholder="Cuero, Malla, Sintético"
          />
          <p className="text-xs text-gray-500 mt-1">Separados por coma</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags/Etiquetas
          </label>
          <input 
            {...register('tags')} 
            className="input-field"
            placeholder="running, deportivo, casual"
          />
          <p className="text-xs text-gray-500 mt-1">Separados por coma</p>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            {...register('isActive')} 
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
          />
          <span className="ml-2 text-sm text-gray-700 font-medium">Producto Activo</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            {...register('isFeatured')} 
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
          />
          <span className="ml-2 text-sm text-gray-700 font-medium">Producto Destacado</span>
        </label>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-outline px-6"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-primary px-6"
          disabled={loadingData}
        >
          {product ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
}