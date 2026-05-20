'use client';
import { useState } from 'react';
import { useAdminData } from '@/hooks/useAdmin';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/ui/Modal';
import ProductForm from '@/components/admin/ProductForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { formatPrice } from '@/lib/utils';

export default function AdminProducts() {
  const { data: products, loading, total, page, setPage, limit, create, update, remove, refetch } = useAdminData('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
      setDeletingId(id);
      await remove(id);
      setDeletingId(null);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await update(editingProduct.id, formData);
      } else {
        await create(formData);
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  if (loading) return <LoadingSpinner size="xl" className="mt-20" />;

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Marca
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
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
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.sku}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.brand?.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.variants?.reduce((acc, v) => acc + v.stock, 0) > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0} uds.
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="text-red-600 hover:text-red-900"
                    >
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
        size="lg"
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