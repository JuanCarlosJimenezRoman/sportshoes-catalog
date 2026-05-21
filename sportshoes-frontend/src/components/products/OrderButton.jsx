
'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const WHATSAPP_NUMBER = '529541852933';

export default function OrderButton({ product, selectedSize }) {
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedVariant = product?.variants?.find(v => v.size === selectedSize);
  const isAvailable = selectedVariant && selectedVariant.stock > 0;
  const unitPrice = selectedVariant?.price || product?.price || 0;
  const total = (unitPrice * quantity).toFixed(2);

  const getImageUrl = (image) => {
    if (!image?.url) return null;
    if (image.url.startsWith('http')) return image.url;
    return `http://localhost:3001${image.url}`;
  };

  const mainImage = getImageUrl(product?.images?.[0]);

  const handleOrder = async () => {
    if (!product?.id || !selectedSize) return;
    
    setSending(true);
    try {
      const response = await api.post('/orders/create', {
        productId: product.id,
        size: selectedSize,
        quantity
      });

      if (response.data.success) {
        const data = response.data.data;
        
        // Usar valores seguros con fallback al producto actual
        const productName = data?.productSnapshot?.name || product.name || 'Producto';
        const productSku = data?.productSnapshot?.sku || product.sku || 'N/A';
        const productBrand = data?.productSnapshot?.brand || product.brand?.name || 'N/A';
        const productPrice = data?.productSnapshot?.price || unitPrice;
        const productImage = data?.productSnapshot?.imageUrl || mainImage || '';
        const orderSize = data?.size || selectedSize;
        const orderQuantity = data?.quantity || quantity;
        const orderTotal = data?.total || total;

        const message = encodeURIComponent(
          `🛒 *NUEVO PEDIDO*\n\n` +
          `📦 *Producto:* ${productName}\n` +
          `🔢 *SKU:* ${productSku}\n` +
          `🏷️ *Marca:* ${productBrand}\n` +
          `📏 *Talla:* ${orderSize}\n` +
          `📦 *Cantidad:* ${orderQuantity}\n` +
          `💰 *Precio unitario:* $${Number(productPrice).toFixed(2)}\n` +
          `💵 *Total:* $${Number(orderTotal).toFixed(2)}\n\n` +
          `🖼️ *Imagen:* ${productImage}`
        );

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
        setShowModal(false);
        toast.success('Pedido enviado a WhatsApp');
      } else {
        toast.error(response.data.message || 'Error al crear pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error al crear el pedido');
    } finally {
      setSending(false);
    }
  };

  if (!product) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!selectedSize || !isAvailable}
        className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
        </svg>
        {!selectedSize 
          ? 'Selecciona una talla' 
          : !isAvailable 
            ? 'Talla agotada' 
            : 'Pedir por WhatsApp'
        }
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Confirmar Pedido</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  <p className="text-sm text-gray-500">Marca: {product.brand?.name}</p>
                  <p className="text-sm text-gray-500">Talla: <span className="font-semibold">{selectedSize}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && val <= (selectedVariant?.stock || 99)) {
                        setQuantity(val);
                      }
                    }}
                    className="w-20 text-center border rounded-lg py-2 text-sm"
                  />
                  <button
                    onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 99, q + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                    disabled={quantity >= (selectedVariant?.stock || 99)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                {selectedVariant && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Stock disponible: {selectedVariant.stock} unidades
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Precio unitario</span>
                  <span className="text-gray-900">${unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Cantidad</span>
                  <span className="text-gray-900">{quantity}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-green-600">${total}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleOrder}
                disabled={sending}
                className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                )}
                Enviar a WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}