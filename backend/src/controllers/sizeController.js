// src/controllers/sizeController.js
import { prisma } from '../server.js';

const SIZE_RANGES = {
  infantil: { min: 17, max: 22.5, step: 0.5 },
  adolescente: { min: 23, max: 25.5, step: 0.5 },
  adulto: { min: 26, max: 32, step: 0.5 }
};

function generateSizes(range) {
  const sizes = [];
  for (let i = range.min; i <= range.max; i += range.step) {
    sizes.push(Number(i.toFixed(1)));
  }
  return sizes;
}

export const getSizeTable = async (req, res, next) => {
  try {
    const { category = 'adulto' } = req.query;
    const range = SIZE_RANGES[category] || SIZE_RANGES.adulto;
    const allSizes = generateSizes(range);

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { where: { isMain: true }, take: 1 },
        variants: {
          where: { isActive: true },
          select: { size: true, stock: true, isActive: true }
        }
      },
      orderBy: { sku: 'asc' }
    });

    const tableData = products.map(product => {
      const sizeAvailability = {};
      allSizes.forEach(size => {
        const sizeStr = size.toString();
        const variant = product.variants.find(v => v.size === sizeStr);
        sizeAvailability[sizeStr] = variant ? variant.isActive : false;
      });

      return {
        id: product.id,
        sku: product.sku,
        image: product.images[0]?.url || null,
        name: product.name,
        sizes: sizeAvailability
      };
    });

    res.json({
      success: true,
      data: {
        headers: allSizes.map(s => s.toString()),
        products: tableData
      }
    });
  } catch (error) {
    next(error);
  }
};

export const toggleSize = async (req, res, next) => {
  try {
    const { productId, size } = req.body;

    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId,
        size: size.toString()
      }
    });

    if (existingVariant) {
      await prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          isActive: !existingVariant.isActive,
          stock: existingVariant.isActive ? 0 : 1
        }
      });
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      await prisma.productVariant.create({
        data: {
          sku: `${product.sku}-${size}`,
          size: size.toString(),
          color: 'default',
          colorName: 'Único',
          stock: 1,
          isActive: true,
          productId
        }
      });
    }

    const updatedVariants = await prisma.productVariant.findMany({
      where: {
        productId,
        isActive: true
      },
      select: { size: true, isActive: true }
    });

    res.json({
      success: true,
      data: {
        productId,
        size,
        activeSizes: updatedVariants.map(v => v.size)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const batchToggleSizes = async (req, res, next) => {
  try {
    const { updates } = req.body;

    const results = await Promise.all(
      updates.map(async ({ productId, size, active }) => {
        const existingVariant = await prisma.productVariant.findFirst({
          where: {
            productId,
            size: size.toString()
          }
        });

        if (existingVariant) {
          return prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: {
              isActive: active,
              stock: active ? 1 : 0
            }
          });
        } else if (active) {
          const product = await prisma.product.findUnique({ where: { id: productId } });
          return prisma.productVariant.create({
            data: {
              sku: `${product.sku}-${size}`,
              size: size.toString(),
              color: 'default',
              colorName: 'Único',
              stock: 1,
              isActive: true,
              productId
            }
          });
        }
        return null;
      })
    );

    res.json({
      success: true,
      data: results.filter(r => r !== null)
    });
  } catch (error) {
    next(error);
  }
};

export const activateAllSizes = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const range = SIZE_RANGES[req.body.category] || SIZE_RANGES.adulto;
    const allSizes = generateSizes(range);

    const product = await prisma.product.findUnique({ where: { id: productId } });

    const results = await Promise.all(
      allSizes.map(async (size) => {
        const sizeStr = size.toString();
        const existing = await prisma.productVariant.findFirst({
          where: { productId, size: sizeStr }
        });

        if (existing) {
          return prisma.productVariant.update({
            where: { id: existing.id },
            data: { isActive: true, stock: 1 }
          });
        } else {
          return prisma.productVariant.create({
            data: {
              sku: `${product.sku}-${sizeStr}`,
              size: sizeStr,
              color: 'default',
              colorName: 'Único',
              stock: 1,
              isActive: true,
              productId
            }
          });
        }
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const deactivateAllSizes = async (req, res, next) => {
  try {
    const { productId } = req.body;

    await prisma.productVariant.updateMany({
      where: { productId },
      data: { isActive: false, stock: 0 }
    });

    res.json({ success: true, message: 'Todas las tallas desactivadas' });
  } catch (error) {
    next(error);
  }
};

export const getSizeRanges = async (req, res, next) => {
  try {
    const ranges = Object.entries(SIZE_RANGES).map(([key, value]) => ({
      category: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      min: value.min,
      max: value.max,
      step: value.step,
      sizes: generateSizes(value)
    }));

    res.json({ success: true, data: ranges });
  } catch (error) {
    next(error);
  }
};