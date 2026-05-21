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
      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Nombre *
          </label>
          <input
            {...register('name', { required: 'El nombre es requerido' })}
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                     transition-all duration-200"
            placeholder="Nombre del producto"
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
            SKU
          </label>
          <input 
            {...register('sku')} 
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#7C3AED] focus:bg-white
                     transition-all duration-200"
            placeholder="SKU-001"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Precio *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-[#999999]">$</span>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'El precio es requerido' })}
              className="w-full pl-7 pr-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                       placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                       transition-all duration-200"
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="mt-1.5 text-xs text-[#FF6B6B] flex items-center gap-1">
              <span className="w-1 h-1 bg-[#FF6B6B] rounded-full" />
              {errors.price.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Precio Comparado
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-[#999999]">$</span>
            <input
              type="number"
              step="0.01"
              {...register('comparePrice')}
              className="w-full pl-7 pr-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                       placeholder-[#999999] focus:outline-none focus:border-[#7C3AED] focus:bg-white
                       transition-all duration-200"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Género
          </label>
          <select 
            {...register('gender')} 
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     focus:outline-none focus:border-[#7C3AED] focus:bg-white transition-all duration-200"
          >
            <option value="MEN">👨 Hombre</option>
            <option value="WOMEN">👩 Mujer</option>
            <option value="UNISEX">🔄 Unisex</option>
            <option value="KIDS">👶 Niños</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Descripción
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#00FF88] focus:bg-white
                     transition-all duration-200 resize-none"
            placeholder="Descripción del producto..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Colores
          </label>
          <input
            {...register('colors')}
            placeholder="black, white, red"
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#7C3AED] focus:bg-white
                     transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Materiales
          </label>
          <input
            {...register('materials')}
            placeholder="Cuero, Malla"
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#7C3AED] focus:bg-white
                     transition-all duration-200"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">
            Tags
          </label>
          <input
            {...register('tags')}
            placeholder="running, deportivo"
            className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                     placeholder-[#999999] focus:outline-none focus:border-[#7C3AED] focus:bg-white
                     transition-all duration-200"
          />
        </div>

        <div className="col-span-2 flex items-center gap-6">
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                {...register('isActive')}
                className="sr-only"
              />
              <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${
                register('isActive').value ? 'bg-[#00FF88]' : 'bg-[#CCCCCC]'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                  register('isActive').value ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-[#1A1A1A]">Activo</span>
          </label>
          
          <label className="flex items-center cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="sr-only"
              />
              <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${
                register('isFeatured').value ? 'bg-[#7C3AED]' : 'bg-[#CCCCCC]'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                  register('isFeatured').value ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
            <span className="ml-3 text-sm font-medium text-[#1A1A1A]">Destacado</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E8E8]">
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
          {product ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
}