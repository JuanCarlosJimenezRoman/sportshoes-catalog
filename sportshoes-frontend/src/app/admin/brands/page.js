'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../lib/api';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/brands');
      if (response.data.success) {
        setBrands(response.data.data);
      }
    } catch (error) {
      toast.error('Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta marca?')) {
      try {
        await api.delete(`/brands/${id}`);
        toast.success('Marca eliminada exitosamente');
        fetchBrands();
      } catch (error) {
        toast.error('Error al eliminar marca');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, formData);
        toast.success('Marca actualizada exitosamente');
      } else {
        await api.post('/brands', formData);
        toast.success('Marca creada exitosamente');
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar marca');
    }
  };

  if (loading) return <LoadingSpinner size="xl" className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Marcas ({brands.length})</h1>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Nueva Marca
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
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{brand.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{brand._count?.products || 0}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(brand)} className="text-blue-600 hover:text-blue-900">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(brand.id)} className="text-red-600 hover:text-red-900">
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
        title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
        size="md"
      >
        <BrandForm
          brand={editingBrand}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function BrandForm({ brand, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: brand ? {
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
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
          {brand ? 'Actualizar' : 'Crear'} Marca
        </button>
      </div>
    </form>
  );
}