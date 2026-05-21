'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../lib/api';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';
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
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
        <div className="pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00FF88]/10 to-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                <TagIcon className="h-5 w-5 text-[#7C3AED]" />
              </div>
              Categorías
            </h1>
            <p className="text-sm text-[#999999] mt-2 ml-13">{categories.length} categorías en total</p>
          </div>
          <button 
            onClick={handleCreate} 
            className="px-5 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl text-sm font-semibold
                     hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva Categoría
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-[#E8E8E8]">
          <thead>
            <tr className="bg-[#F5F5F5]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Productos</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E8]">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-[#F5F5F5] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-[#1A1A1A]">{category.name}</span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-sm text-[#999999] bg-[#F5F5F5] px-2 py-1 rounded-lg font-mono">{category.slug}</code>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg text-xs font-semibold">
                    {category._count?.products || 0} productos
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleEdit(category)} 
                      className="p-2 rounded-xl text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)} 
                      className="p-2 rounded-xl text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-all"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Nombre *
        </label>
        <input 
          {...register('name', { required: 'Requerido' })} 
          className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                   transition-all duration-200"
          placeholder="Nombre de la categoría"
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-[#FF6B6B] flex items-center gap-1">
            <span className="w-1 h-1 bg-[#FF6B6B] rounded-full" />
            {errors.name.message}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Slug
        </label>
        <input 
          {...register('slug')} 
          className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   placeholder-[#999999] focus:outline-none focus:border-[#7C3AED] focus:bg-white
                   transition-all duration-200"
          placeholder="slug-de-categoria"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Descripción
        </label>
        <textarea 
          {...register('description')} 
          rows={3} 
          className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                   transition-all duration-200 resize-none"
          placeholder="Descripción opcional..."
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-5 border-t border-[#E8E8E8]">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-5 py-2.5 bg-white border-2 border-[#E8E8E8] rounded-xl text-sm font-medium text-[#666666]
                   hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all duration-200"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-5 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl text-sm font-semibold
                   hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200"
        >
          {category ? 'Actualizar' : 'Crear'} Categoría
        </button>
      </div>
    </form>
  );
}