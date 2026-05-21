import { prisma } from '../server.js';

export const createOrder = async (req, res, next) => {
  try {
    const { productId, variantId, size, quantity = 1, customerName, customerPhone } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { where: { isMain: true }, take: 1 },
        brand: true
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    let variant;
    if (variantId) {
      variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    } else if (size) {
      variant = await prisma.productVariant.findFirst({
        where: { productId, size: size.toString(), isActive: true }
      });
    }

    if (!variant && size) {
      return res.status(404).json({
        success: false,
        message: `Talla ${size} no disponible`
      });
    }

    if (variant && variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${variant.stock}`
      });
    }

    const orderData = {
      productId: product.id,
      variantId: variant?.id || null,
      size: variant?.size || size,
      quantity,
      price: variant?.price || product.price,
      total: (variant?.price || product.price) * quantity,
      customerName: customerName || 'Cliente Web',
      customerPhone: customerPhone || '',
      productSnapshot: {
        sku: product.sku,
        name: product.name,
        brand: product.brand?.name,
        image: product.images[0]?.url || null,
        price: variant?.price || product.price
      }
    };

    res.json({
      success: true,
      data: {
        ...orderData,
        productSnapshot: {
          ...orderData.productSnapshot,
          imageUrl: orderData.productSnapshot.image
            ? `${process.env.BASE_URL || 'http://localhost:3001'}${orderData.productSnapshot.image}`
            : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};