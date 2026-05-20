'use client';
import { useForm } from 'react-hook-form';
import { parseJSON } from '@/lib/utils';

export default function ProductForm({ product, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product ? {
      ...product,
      colors: Array.isArray(product.colors) 
        ? product.colors.join(', ') 
        : parseJSON(product.colors).join(', '),
      materials: Array.isArray(product.materials) 
        ? product.materials.join(', ') 
        : parseJSON(product.materials).join(', '),
      tags: Array.isArray(product.tags) 
        ? product.tags.join(', ') 
        : parseJSON(product.tags).join(', '),
    } : {
      name: '',
      sku: '',
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

  const handleFormSubmit = (data) => {
    // Convert comma-separated strings to arrays
    const formattedData = {
      ...data,
      colors: JSON.stringify(data.colors.split(',').map(c => c.trim()).filter(Boolean)),
      materials: JSON.stringify(data.materials.split(',').map(m => m.trim()).filter(Boolean)),
      tags: JSON.stringify(data.tags.split(',').map(t => t.trim()).filter(Boolean)),
      price: parseFloat(data.price),
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            {...register('name', { required: 'El nombre es requerido' })}
            className="input-field"
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input {...register('sku')} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
          <input
            type="number"
            step="0.01"
            {...register('price', { required: 'El precio es requerido' })}
            className="input-field"
          />
          {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio Comparado</label>
          <input
            type="number"
            step="0.01"
            {...register('comparePrice')}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
          <select {...register('gender')} className="input-field">
            <option value="MEN">Hombre</option>
            <option value="WOMEN">Mujer</option>
            <option value="UNISEX">Unisex</option>
            <option value="KIDS">Niños</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            {...register('description')}
            rows={4}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Colores (separados por coma)</label>
          <input
            {...register('colors')}
            placeholder="black, white, red"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Materiales (separados por coma)</label>
          <input
            {...register('materials')}
            placeholder="Cuero, Malla"
            className="input-field"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separados por coma)</label>
          <input
            {...register('tags')}
            placeholder="running, deportivo"
            className="input-field"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              className="rounded border-gray-300 text-primary-600"
            />
            <span className="ml-2 text-sm text-gray-700">Activo</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isFeatured')}
              className="rounded border-gray-300 text-primary-600"
            />
            <span className="ml-2 text-sm text-gray-700">Destacado</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {product ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
}