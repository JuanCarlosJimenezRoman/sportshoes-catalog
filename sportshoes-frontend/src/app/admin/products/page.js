'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { PencilIcon, TrashIcon, PlusIcon, PhotoIcon, AdjustmentsVerticalIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { formatPrice } from '@/lib/utils';
import SizeManager from '@/components/admin/SizeManager';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
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
    setIsEditMode(false);
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleEdit = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      if (response.data.success) {
        setEditingProduct(response.data.data);
        setIsEditMode(true);
        setActiveTab('info');
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error('Error al cargar producto');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Producto eliminado');
        fetchProducts();
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (isEditMode && editingProduct) {
        await updateProductWithVariants(editingProduct.id, formData);
      } else {
        const response = await api.post('/products', formData);
        if (response.data.success) {
          toast.success('Producto creado exitosamente');
          setIsModalOpen(false);
          fetchProducts();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al guardar producto');
    }
  };

  const updateProductWithVariants = async (productId, formData) => {
    const { variants, ...productData } = formData;

    const productResponse = await api.put(`/products/${productId}`, productData);
    
    if (!productResponse.data.success) {
      throw new Error(productResponse.data.message || 'Error al actualizar producto');
    }

    const existingVariantIds = editingProduct?.variants?.map(v => v.id) || [];
    const updatedVariantIds = [];

    for (const variant of (variants || [])) {
      if (variant.id) {
        await api.put(`/products/variants/${variant.id}`, {
          size: variant.size,
          color: variant.color,
          colorName: variant.colorName || variant.color,
          stock: parseInt(variant.stock) || 0,
          price: variant.price ? parseFloat(variant.price) : null
        });
        updatedVariantIds.push(variant.id);
      } else {
        const newVariant = await api.post(`/products/${productId}/variants`, {
          size: variant.size,
          color: variant.color,
          colorName: variant.colorName || variant.color,
          stock: parseInt(variant.stock) || 0,
          price: variant.price ? parseFloat(variant.price) : null
        });
        if (newVariant.data?.data?.id) {
          updatedVariantIds.push(newVariant.data.data.id);
        }
      }
    }

    const variantsToDelete = existingVariantIds.filter(id => !updatedVariantIds.includes(id));
    for (const variantId of variantsToDelete) {
      await api.delete(`/products/variants/${variantId}`);
    }

    toast.success('Producto actualizado exitosamente');
    setIsModalOpen(false);
    fetchProducts();
  };

  if (loading && products.length === 0) return <LoadingSpinner size="xl" className="mt-20" />;

  return (
    <div>
      <div className="relative mb-8">
        <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] rounded-full" />
        <div className="pt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Productos</h1>
            <p className="text-sm text-[#999999] mt-1">{total} productos en total</p>
          </div>
          <button 
            onClick={handleCreate} 
            className="px-5 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl text-sm font-semibold
                     hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-[#E8E8E8]">
          <thead>
            <tr className="bg-[#F5F5F5]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#666666] uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E8]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#F5F5F5] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#F5F5F5] overflow-hidden border border-[#E8E8E8]">
                      {product.images?.[0]?.url ? (
                        <img
                          className="h-10 w-10 object-contain p-1"
                          src={product.images[0].url.startsWith('http') 
                            ? product.images[0].url 
                            : `http://localhost:3001${product.images[0].url}`
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23e5e7eb" width="40" height="40"/><text x="20" y="20" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10">N/A</text></svg>';
                          }}
                        />
                      ) : (
                        <PhotoIcon className="h-5 w-5 text-[#CCCCCC] m-2.5" />
                      )}
                    </div>
                    <div className="text-sm font-semibold text-[#1A1A1A]">{product.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#999999] font-mono">{product.sku}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-[#7C3AED]/10 text-[#7C3AED] rounded-lg text-xs font-medium">
                    {product.brand?.name || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-[#1A1A1A]">{formatPrice(product.price)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    product.isActive 
                      ? 'bg-[#00FF88]/10 text-[#00FF88]' 
                      : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  }`}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleEdit(product.id)} 
                      className="p-2 rounded-xl text-[#7C3AED] hover:bg-[#7C3AED]/10 transition-all" 
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        handleEdit(product.id);
                        setActiveTab('sizes');
                      }} 
                      className="p-2 rounded-xl text-[#00FF88] hover:bg-[#00FF88]/10 transition-all" 
                      title="Gestionar tallas"
                    >
                      <AdjustmentsVerticalIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)} 
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

      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
        size="xl"
      >
        <div>
          <div className="flex border-b border-[#E8E8E8] mb-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === 'info' 
                  ? 'border-[#00FF88] text-[#00FF88]' 
                  : 'border-transparent text-[#999999] hover:text-[#666666]'
              }`}
            >
              Información del Producto
            </button>
            {isEditMode && (
              <button
                onClick={() => setActiveTab('sizes')}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'sizes' 
                    ? 'border-[#7C3AED] text-[#7C3AED]' 
                    : 'border-transparent text-[#999999] hover:text-[#666666]'
                }`}
              >
                Gestión de Tallas
              </button>
            )}
            {isEditMode && (
              <button
                onClick={() => setActiveTab('images')}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === 'images' 
                    ? 'border-[#FFD93D] text-[#1A1A1A]' 
                    : 'border-transparent text-[#999999] hover:text-[#666666]'
                }`}
              >
                Imágenes
              </button>
            )}
          </div>

          {activeTab === 'info' && (
            <ProductForm 
              product={editingProduct} 
              isEditMode={isEditMode} 
              onSubmit={handleSubmit} 
              onCancel={() => setIsModalOpen(false)} 
            />
          )}
          {activeTab === 'sizes' && isEditMode && editingProduct && (
            <SizeManager 
              product={editingProduct} 
              onUpdate={fetchProducts} 
            />
          )}
          {activeTab === 'images' && isEditMode && editingProduct && (
            <div className="p-4">
              <ImageManager 
                product={editingProduct} 
                onUpdate={fetchProducts} 
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function ProductForm({ product, isEditMode, onSubmit, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (product && isEditMode) {
      const parseField = (field) => {
        if (!field) return '';
        if (Array.isArray(field)) return field.join(', ');
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed.join(', ') : field;
          } catch {
            return field;
          }
        }
        return '';
      };
      setTimeout(() => {
        reset({
          name: product.name || '',
          sku: product.sku || '',
          description: product.description || '',
          price: product.price || '',
          comparePrice: product.comparePrice || '',
          gender: product.gender || 'UNISEX',
          categoryId: product.categoryId || product.category?.id || '',
          brandId: product.brandId || product.brand?.id || '',
          colors: parseField(product.colors),
          materials: parseField(product.materials),
          tags: parseField(product.tags),
          isActive: product.isActive !== undefined ? product.isActive : true,
          isFeatured: product.isFeatured || false,
        });
      }, 100);

      setVariants(product.variants?.map(v => ({
        id: v.id,
        size: v.size || '',
        color: v.color || '',
        colorName: v.colorName || '',
        stock: v.stock || 0,
        price: v.price || ''
      })) || []);

      setImages(product.images || []);
    }
  }, [product, isEditMode, reset]);

  const loadFormData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands')
      ]);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      if (brandsRes.data.success) setBrands(brandsRes.data.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { size: '', color: '', colorName: '', stock: '', price: '' }]);
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    if (!product?.id) {
      toast.error('Guarda el producto primero');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    for (let file of files) {
      formData.append('images', file);
    }

    try {
      const response = await api.post(`/products/${product.id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setImages(prev => [...prev, ...response.data.data]);
        toast.success('Imágenes subidas');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al subir imágenes');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('¿Eliminar imagen?')) return;
    try {
      await api.delete(`/products/${product.id}/images/${imageId}`);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Imagen eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await api.put(`/products/${product.id}/images/${imageId}/main`);
      setImages(prev => prev.map(img => ({ ...img, isMain: img.id === imageId })));
      toast.success('Principal actualizada');
    } catch (error) {
      toast.error('Error');
    }
  };

  const handleFormSubmit = async (data) => {
    setSaving(true);
    
    const formattedData = {
      name: data.name?.trim() || '',
      sku: data.sku?.trim() || '',
      description: data.description || '',
      price: parseFloat(data.price) || 0,
      comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
      gender: data.gender || 'UNISEX',
      categoryId: data.categoryId,
      brandId: data.brandId,
      colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      materials: data.materials ? data.materials.split(',').map(m => m.trim()).filter(Boolean) : [],
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isActive: Boolean(data.isActive),
      isFeatured: Boolean(data.isFeatured),
      variants: variants
        .filter(v => v.size && v.color)
        .map(v => ({
          ...(v.id ? { id: v.id } : {}),
          size: v.size.toString(),
          color: v.color.trim(),
          colorName: v.colorName?.trim() || v.color.trim(),
          stock: parseInt(v.stock) || 0,
          price: v.price ? parseFloat(v.price) : null
        }))
    };

    await onSubmit(formattedData);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
      <div className="bg-[#F5F5F5] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#00FF88] rounded-full" />
          Información Básica
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Nombre *</label>
            <input 
              {...register('name', { required: 'Requerido' })} 
              className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm text-[#1A1A1A]
                       focus:outline-none focus:border-[#00FF88] transition-all duration-200" 
            />
            {errors.name && <p className="mt-1.5 text-xs text-[#FF6B6B]">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">SKU *</label>
              <input 
                {...register('sku', { required: 'Requerido' })} 
                className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm font-mono
                         focus:outline-none focus:border-[#00FF88] transition-all duration-200" 
              />
              {errors.sku && <p className="mt-1.5 text-xs text-[#FF6B6B]">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Género</label>
              <select 
                {...register('gender')} 
                className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                         focus:outline-none focus:border-[#00FF88] transition-all duration-200"
              >
                <option value="UNISEX">🔄 Unisex</option>
                <option value="MEN">👨 Hombre</option>
                <option value="WOMEN">👩 Mujer</option>
                <option value="KIDS">👶 Niños</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Descripción</label>
            <textarea 
              {...register('description')} 
              rows={3} 
              className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm resize-none
                       focus:outline-none focus:border-[#00FF88] transition-all duration-200" 
            />
          </div>
        </div>
      </div>

      <div className="bg-[#F5F5F5] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#7C3AED] rounded-full" />
          Precios
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Precio *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-[#999999]">$</span>
              <input 
                type="number" 
                step="0.01" 
                {...register('price', { required: 'Requerido' })} 
                className="w-full pl-7 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                         focus:outline-none focus:border-[#00FF88] transition-all duration-200" 
              />
            </div>
            {errors.price && <p className="mt-1.5 text-xs text-[#FF6B6B]">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Precio Comparado</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-[#999999]">$</span>
              <input 
                type="number" 
                step="0.01" 
                {...register('comparePrice')} 
                className="w-full pl-7 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                         focus:outline-none focus:border-[#00FF88] transition-all duration-200" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F5F5F5] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#FFD93D] rounded-full" />
          Clasificación
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Categoría *</label>
            <select 
              {...register('categoryId', { required: 'Requerido' })} 
              className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                       focus:outline-none focus:border-[#00FF88] transition-all duration-200" 
              disabled={loadingData}
            >
              <option value="">Seleccionar</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1.5 text-xs text-[#FF6B6B]">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Marca *</label>
            <select 
              {...register('brandId', { required: 'Requerido' })} 
              className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                       focus:outline-none focus:border-[#00FF88] transition-all duration-200" 
              disabled={loadingData}
            >
              <option value="">Seleccionar</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            {errors.brandId && <p className="mt-1.5 text-xs text-[#FF6B6B]">{errors.brandId.message}</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#F5F5F5] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
            <span className="w-1 h-4 bg-[#7C3AED] rounded-full" />
            Variantes (Tallas)
          </h3>
          <button 
            type="button" 
            onClick={addVariant} 
            className="text-xs font-semibold text-[#00FF88] hover:text-[#00FF88]/80 transition-colors"
          >
            + Agregar variante
          </button>
        </div>
        
        {variants.length === 0 ? (
          <p className="text-sm text-[#999999] text-center py-6">Sin variantes</p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-start bg-white p-4 rounded-xl border border-[#E8E8E8]">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#999999] mb-1">Talla</label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      placeholder="42"
                      className="w-full px-2 py-1.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg text-sm
                               focus:outline-none focus:border-[#00FF88] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#999999] mb-1">Color</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      placeholder="black"
                      className="w-full px-2 py-1.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg text-sm
                               focus:outline-none focus:border-[#00FF88] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#999999] mb-1">Nombre</label>
                    <input
                      type="text"
                      value={variant.colorName}
                      onChange={(e) => updateVariant(index, 'colorName', e.target.value)}
                      placeholder="Negro"
                      className="w-full px-2 py-1.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg text-sm
                               focus:outline-none focus:border-[#00FF88] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#999999] mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg text-sm
                               focus:outline-none focus:border-[#00FF88] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#999999] mb-1">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg text-sm
                               focus:outline-none focus:border-[#00FF88] transition-all"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="mt-6 p-1.5 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-all"
                  title="Eliminar variante"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#F5F5F5] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#FFD93D] rounded-full" />
          Atributos
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Colores</label>
            <input 
              {...register('colors')} 
              className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                       focus:outline-none focus:border-[#00FF88] transition-all" 
              placeholder="red, blue, black" 
            />
            <p className="text-[10px] text-[#999999] mt-1">Separados por coma</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Materiales</label>
            <input 
              {...register('materials')} 
              className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                       focus:outline-none focus:border-[#00FF88] transition-all" 
              placeholder="Cuero, Malla" 
            />
            <p className="text-[10px] text-[#999999] mt-1">Separados por coma</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-2">Tags</label>
            <input 
              {...register('tags')} 
              className="w-full px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm
                       focus:outline-none focus:border-[#00FF88] transition-all" 
              placeholder="running, sport" 
            />
            <p className="text-[10px] text-[#999999] mt-1">Separados por coma</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 p-5 bg-[#F5F5F5] rounded-2xl">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input type="checkbox" {...register('isActive')} className="sr-only peer" />
            <div className="w-9 h-5 rounded-full bg-[#CCCCCC] peer-checked:bg-[#00FF88] transition-colors duration-200">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ml-0.5 peer-checked:translate-x-4" />
            </div>
          </div>
          <span className="ml-3 text-sm font-medium text-[#1A1A1A]">Activo</span>
        </label>
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input type="checkbox" {...register('isFeatured')} className="sr-only peer" />
            <div className="w-9 h-5 rounded-full bg-[#CCCCCC] peer-checked:bg-[#7C3AED] transition-colors duration-200">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ml-0.5 peer-checked:translate-x-4" />
            </div>
          </div>
          <span className="ml-3 text-sm font-medium text-[#1A1A1A]">Destacado</span>
        </label>
      </div>

      {isEditMode && product && (
        <div className="bg-[#F5F5F5] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#00FF88] rounded-full" />
            Imágenes ({images.length})
          </h3>
          
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#E8E8E8] 
                           rounded-xl hover:border-[#00FF88] hover:bg-[#00FF88]/5 transition-all duration-200">
            <PhotoIcon className="h-5 w-5 text-[#999999]" />
            <span className="text-sm text-[#666666] font-medium">
              {uploadingImage ? 'Subiendo...' : 'Subir imágenes'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url?.startsWith('http') ? image.url : `http://localhost:3001${image.url}`}
                    alt={image.altText || ''}
                    className="w-full h-32 object-cover rounded-xl border border-[#E8E8E8]"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/50 transition-all rounded-xl 
                                flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(image.id)}
                      className={`p-2 rounded-xl text-sm transition-all ${
                        image.isMain 
                          ? 'bg-[#FFD93D] text-[#1A1A1A]' 
                          : 'bg-white text-[#666666] hover:text-[#FFD93D]'
                      }`}
                      title={image.isMain ? 'Principal' : 'Establecer principal'}
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-2 rounded-xl bg-white text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white transition-all"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {image.isMain && (
                    <span className="absolute top-2 left-2 bg-[#FFD93D] text-[#1A1A1A] text-[10px] px-2 py-1 rounded-lg font-semibold">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-5 border-t border-[#E8E8E8] sticky bottom-0 bg-white p-4">
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
          className="px-6 py-2.5 bg-gradient-to-r from-[#00FF88] to-[#7C3AED] text-white rounded-xl text-sm font-semibold
                   hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-200 flex items-center gap-2" 
          disabled={loadingData || saving}
        >
          {saving && <LoadingSpinner size="sm" />}
          {isEditMode ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
}