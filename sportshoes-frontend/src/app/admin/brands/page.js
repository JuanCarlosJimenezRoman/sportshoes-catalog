'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../../lib/api';
import { PencilIcon, TrashIcon, PlusIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
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
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] rounded-full" />
        <div className="pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD93D]/10 to-[#FF6B6B]/10 rounded-xl flex items-center justify-center">
                <BuildingStorefrontIcon className="h-5 w-5 text-[#FF6B6B]" />
              </div>
              Marcas
            </h1>
            <p className="text-sm text-[#999999] mt-2 ml-13">{brands.length} marcas en total</p>
          </div>
          <button 
            onClick={handleCreate} 
            className="px-5 py-2.5 bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] text-white rounded-xl text-sm font-semibold
                     hover:shadow-lg hover:shadow-[#FF6B6B]/25 transition-all duration-200 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva Marca
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
            {brands.map((brand) => (
              <tr key={brand.id} className="hover:bg-[#F5F5F5] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-[#1A1A1A]">{brand.name}</span>
                </td>
                <td className="px-6 py-4">
                  <code className="text-sm text-[#999999] bg-[#F5F5F5] px-2 py-1 rounded-lg font-mono">{brand.slug}</code>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-[#FFD93D]/10 text-[#1A1A1A] rounded-lg text-xs font-semibold">
                    {brand._count?.products || 0} productos
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleEdit(brand)} 
                      className="p-2 rounded-xl text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(brand.id)} 
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
          Nombre *
        </label>
        <input 
          {...register('name', { required: 'Requerido' })} 
          className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                   placeholder-[#999999] focus:outline-none focus:border-[#FFD93D] focus:bg-white
                   transition-all duration-200"
          placeholder="Nombre de la marca"
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
                   placeholder-[#999999] focus:outline-none focus:border-[#FF6B6B] focus:bg-white
                   transition-all duration-200"
          placeholder="slug-de-marca"
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
                   placeholder-[#999999] focus:outline-none focus:border-[#FFD93D] focus:bg-white
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
          className="px-5 py-2.5 bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] text-white rounded-xl text-sm font-semibold
                   hover:shadow-lg hover:shadow-[#FF6B6B]/25 transition-all duration-200"
        >
          {brand ? 'Actualizar' : 'Crear'} Marca
        </button>
      </div>
    </form>
  );
}