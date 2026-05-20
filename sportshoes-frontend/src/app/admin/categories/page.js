'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../lib/api';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Categoría eliminada exitosamente');
        fetchCategories();
      } catch (error) {
        toast.error('Error al eliminar categoría');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await api.post('/categories', formData);
        toast.success('Categoría creada exitosamente');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar categoría');
    }
  };

  if (loading) return <LoadingSpinner size="xl" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categorías ({categories.length})</h1>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{category._count?.products || 0}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        size="md"
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function CategoryForm({ category, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: category ? {
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    } : {
      name: '',
      slug: '',
      description: '',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input {...register('name', { required: 'Requerido' })} className="input-field" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
        <input {...register('slug')} className="input-field" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea {...register('description')} rows={3} className="input-field" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-outline">Cancelar</button>
        <button type="submit" className="btn-primary">
          {category ? 'Actualizar' : 'Crear'} Categoría
        </button>
      </div>
    </form>
  );
}