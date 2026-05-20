'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { PencilIcon, TrashIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
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
    setIsModalOpen(true);
  };

  const handleEdit = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      if (response.data.success) {
        setEditingProduct(response.data.data);
        setIsEditMode(true);
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
        // MODO EDICIÓN: Primero actualizar el producto, luego las variantes
        await updateProductWithVariants(editingProduct.id, formData);
      } else {
        // MODO CREACIÓN: Crear producto con todo incluido
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

  // Función para actualizar producto y sus variantes por separado
  const updateProductWithVariants = async (productId, formData) => {
    const { variants, ...productData } = formData;

    // 1. Actualizar datos básicos del producto (SIN variantes)
    const productResponse = await api.put(`/products/${productId}`, productData);
    
    if (!productResponse.data.success) {
      throw new Error(productResponse.data.message || 'Error al actualizar producto');
    }

    // 2. Procesar variantes
    const existingVariantIds = editingProduct?.variants?.map(v => v.id) || [];
    const updatedVariantIds = [];

    for (const variant of (variants || [])) {
      if (variant.id) {
        // Actualizar variante existente
        await api.put(`/products/variants/${variant.id}`, {
          size: variant.size,
          color: variant.color,
          colorName: variant.colorName || variant.color,
          stock: parseInt(variant.stock) || 0,
          price: variant.price ? parseFloat(variant.price) : null
        });
        updatedVariantIds.push(variant.id);
      } else {
        // Crear nueva variante
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

    // 3. Eliminar variantes que ya no existen
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
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
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                      {product.images?.[0]?.url ? (
 <img
                className="h-10 w-10 object-cover"
                src={product.images[0].url.startsWith('http') 
                  ? product.images[0].url 
                  : `http://localhost:3001${product.images[0].url}`
                }
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect fill="%23e5e7eb" width="40" height="40"/><text x="20" y="20" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10">N/A</text></svg>';
                }}
              />                      ) : (
                        <PhotoIcon className="h-5 w-5 text-gray-400 m-2.5" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{product.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.brand?.name || '-'}</td>
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
                    <button onClick={() => handleEdit(product.id)} className="text-blue-600 hover:text-blue-900">
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
        title={isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
        size="xl"
      >
        <ProductForm
          product={editingProduct}
          isEditMode={isEditMode}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
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
      console.log('Producto recibido:', product); // Debug
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Información básica */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Información Básica</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input {...register('name', { required: 'Requerido' })} className="input-field" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input {...register('sku', { required: 'Requerido' })} className="input-field font-mono" />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
              <select {...register('gender')} className="input-field">
                <option value="UNISEX">Unisex</option>
                <option value="MEN">Hombre</option>
                <option value="WOMEN">Mujer</option>
                <option value="KIDS">Niños</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea {...register('description')} rows={3} className="input-field" />
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Precios</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
            <input type="number" step="0.01" {...register('price', { required: 'Requerido' })} className="input-field" />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Comparado</label>
            <input type="number" step="0.01" {...register('comparePrice')} className="input-field" />
          </div>
        </div>
      </div>

      {/* Clasificación */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Clasificación</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select {...register('categoryId', { required: 'Requerido' })} className="input-field" disabled={loadingData}>
              <option value="">Seleccionar</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <select {...register('brandId', { required: 'Requerido' })} className="input-field" disabled={loadingData}>
              <option value="">Seleccionar</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
            {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId.message}</p>}
          </div>
        </div>
      </div>

      {/* Variantes */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Variantes (Tallas)</h3>
          <button type="button" onClick={addVariant} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            + Agregar variante
          </button>
        </div>
        
        {variants.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Sin variantes</p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-start bg-white p-3 rounded-lg border">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Talla</label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      placeholder="42"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      placeholder="black"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={variant.colorName}
                      onChange={(e) => updateVariant(index, 'colorName', e.target.value)}
                      placeholder="Negro"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                      placeholder="0"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      placeholder="0.00"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Eliminar variante"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atributos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Atributos</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colores</label>
            <input {...register('colors')} className="input-field" placeholder="red, blue, black" />
            <p className="text-xs text-gray-500 mt-1">Separados por coma</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materiales</label>
            <input {...register('materials')} className="input-field" placeholder="Cuero, Malla" />
            <p className="text-xs text-gray-500 mt-1">Separados por coma</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input {...register('tags')} className="input-field" placeholder="running, sport" />
            <p className="text-xs text-gray-500 mt-1">Separados por coma</p>
          </div>
        </div>
      </div>

      {/* Estado */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" {...register('isActive')} className="rounded border-gray-300 text-primary-600 h-4 w-4" />
          <span className="ml-2 text-sm">Activo</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" {...register('isFeatured')} className="rounded border-gray-300 text-primary-600 h-4 w-4" />
          <span className="ml-2 text-sm">Destacado</span>
        </label>
      </div>

      {/* Imágenes (solo edición) */}
      {isEditMode && product && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Imágenes ({images.length})</h3>
          
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
            <PhotoIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
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
            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url?.startsWith('http') ? image.url : `http://localhost:3001${image.url}`}
                    alt={image.altText || ''}
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(image.id)}
                      className={`p-2 rounded-full text-sm ${
                        image.isMain ? 'bg-yellow-400 text-white' : 'bg-white text-gray-600 hover:text-yellow-500'
                      }`}
                      title={image.isMain ? 'Principal' : 'Establecer principal'}
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      className="p-2 rounded-full bg-white text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {image.isMain && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white p-4">
        <button type="button" onClick={onCancel} className="btn-outline px-6">
          Cancelar
        </button>
        <button type="submit" className="btn-primary px-6 flex items-center gap-2" disabled={loadingData || saving}>
          {saving && <LoadingSpinner size="sm" />}
          {isEditMode ? 'Actualizar' : 'Crear'} Producto
        </button>
      </div>
    </form>
  );
}