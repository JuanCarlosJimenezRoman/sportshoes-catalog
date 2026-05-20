import { prisma } from '../server.js';
import { QueryBuilder } from '../services/queryBuilder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getProducts = async (req, res, next) => {
  try {
    const queryBuilder = new QueryBuilder(req.query, prisma);

    queryBuilder
      .addSearch(['name', 'description', 'sku'])
      .addFilter('categoryId', req.query.categoryId)
      .addFilter('brandId', req.query.brandId)
      .addFilter('gender', req.query.gender)
      .addRangeFilter('price', req.query.minPrice, req.query.maxPrice)
      .addFilter('isActive', req.query.isActive !== 'false')
      .addFilter('isFeatured', req.query.isFeatured === 'true')
      .addSort('createdAt', 'desc')
      .addPagination()
      .addInclude({
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { size: 'asc' } }
      });

    const queryOptions = queryBuilder.build();
    const [products, total] = await Promise.all([
      prisma.product.findMany(queryOptions),
      prisma.product.count({ where: queryOptions.where })
    ]);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    res.json({
      success: true,
      data: products.map(product => ({
        ...product,
        colors: JSON.parse(product.colors || '[]'),
        materials: JSON.parse(product.materials || '[]'),
        tags: JSON.parse(product.tags || '[]')
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: req.params.id }, { slug: req.params.id }, { sku: req.params.id }] },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { size: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const avgRating = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true }
    });

    res.json({
      success: true,
      data: {
        ...product,
        colors: JSON.parse(product.colors || '[]'),
        materials: JSON.parse(product.materials || '[]'),
        tags: JSON.parse(product.tags || '[]'),
        averageRating: avgRating._avg.rating || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { variants, brandId, categoryId, sku, ...productData } = req.body;

    if (!sku) {
      return res.status(400).json({ success: false, message: 'El SKU es requerido' });
    }

    if (!brandId || !categoryId) {
      return res.status(400).json({ success: false, message: 'brandId y categoryId son requeridos' });
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return res.status(400).json({ success: false, message: `El SKU '${sku}' ya existe` });
    }

    const [brand, category] = await Promise.all([
      prisma.brand.findUnique({ where: { id: brandId } }),
      prisma.category.findUnique({ where: { id: categoryId } })
    ]);

    if (!brand) {
      return res.status(400).json({ success: false, message: `La marca no existe` });
    }

    if (!category) {
      return res.status(400).json({ success: false, message: `La categoría no existe` });
    }

    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        comparePrice: productData.comparePrice ? parseFloat(productData.comparePrice) : null,
        cost: productData.cost ? parseFloat(productData.cost) : null,
        gender: productData.gender || 'UNISEX',
        colors: JSON.stringify(productData.colors || []),
        materials: JSON.stringify(productData.materials || []),
        tags: JSON.stringify(productData.tags || []),
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        isFeatured: productData.isFeatured || false,
        seoTitle: productData.seoTitle || null,
        seoDescription: productData.seoDescription || null,
        sku,
        slug,
        brandId: brand.id,
        categoryId: category.id,
        userId: req.user.id,
        variants: variants && variants.length > 0 ? {
          create: variants.map(v => ({
            sku: `${sku}-${v.size}-${v.color}`,
            size: v.size.toString(),
            color: v.color,
            colorName: v.colorName || v.color,
            stock: parseInt(v.stock) || 0,
            price: v.price ? parseFloat(v.price) : null,
            isActive: true
          }))
        } : undefined
      },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true
      }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { variants, ...updateData } = req.body;
    
    delete updateData.id;
    delete updateData.brandId;
    delete updateData.categoryId;
    delete updateData.userId;
    delete updateData.sku;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.comparePrice) updateData.comparePrice = parseFloat(updateData.comparePrice);
    if (updateData.cost) updateData.cost = parseFloat(updateData.cost);
    if (updateData.colors) updateData.colors = JSON.stringify(updateData.colors);
    if (updateData.materials) updateData.materials = JSON.stringify(updateData.materials);
    if (updateData.tags) updateData.tags = JSON.stringify(updateData.tags);

    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        brand: true,
        category: true,
        variants: true,
        images: true
      }
    });

    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (variant.id) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              size: variant.size?.toString(),
              color: variant.color,
              colorName: variant.colorName || variant.color,
              stock: variant.stock !== undefined ? parseInt(variant.stock) : undefined,
              price: variant.price ? parseFloat(variant.price) : null,
              isActive: variant.isActive !== undefined ? variant.isActive : true
            }
          });
        } else {
          await prisma.productVariant.create({
            data: {
              sku: `${product.sku}-${variant.size}-${variant.color}`,
              size: variant.size?.toString(),
              color: variant.color,
              colorName: variant.colorName || variant.color,
              stock: parseInt(variant.stock) || 0,
              price: variant.price ? parseFloat(variant.price) : null,
              isActive: true,
              productId: product.id
            }
          });
        }
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        brand: true,
        category: true,
        variants: { orderBy: { size: 'asc' } },
        images: { orderBy: { position: 'asc' } }
      }
    });

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Producto desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No se subieron imágenes' });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const existingImagesCount = await prisma.productImage.count({ where: { productId: id } });

    const images = await Promise.all(
      files.map((file, index) =>
        prisma.productImage.create({
          data: {
            url: `/uploads/products/${file.filename}`,
            altText: `${product.name} - Vista ${existingImagesCount + index + 1}`,
            position: existingImagesCount + index,
            isMain: existingImagesCount === 0 && index === 0,
            productId: id
          }
        })
      )
    );

    res.json({ success: true, data: images });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    next(error);
  }
};

export const deleteProductImage = async (req, res, next) => {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: req.params.imageId } });

    if (!image) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    const filePath = path.join(__dirname, '../../public', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.productImage.delete({ where: { id: req.params.imageId } });

    const remainingImages = await prisma.productImage.findMany({
      where: { productId: image.productId },
      orderBy: { position: 'asc' }
    });

    if (remainingImages.length > 0 && !remainingImages.some(img => img.isMain)) {
      await prisma.productImage.update({
        where: { id: remainingImages[0].id },
        data: { isMain: true }
      });
    }

    res.json({ success: true, message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

export const setMainImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;

    await prisma.productImage.updateMany({
      where: { productId },
      data: { isMain: false }
    });

    const image = await prisma.productImage.update({
      where: { id: imageId },
      data: { isMain: true }
    });

    res.json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};

export const getProductFilters = async (req, res, next) => {
  try {
    const [categories, brands, sizes] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } }),
      prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } }),
      prisma.productVariant.findMany({
        where: { stock: { gt: 0 }, isActive: true, product: { isActive: true } },
        select: { size: true },
        distinct: ['size'],
        orderBy: { size: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: { categories, brands, sizes: sizes.map(s => s.size) }
    });
  } catch (error) {
    next(error);
  }
};

export const getCreateFormData = async (req, res, next) => {
  try {
    const [brands, categories] = await Promise.all([
      prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } }),
      prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } })
    ]);

    res.json({ success: true, data: { brands, categories } });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSizes = async (req, res, next) => {
  try {
    const sizes = await prisma.productVariant.findMany({
      where: {
        product: { isActive: true },
        stock: { gt: 0 },
        isActive: true
      },
      select: {
        size: true,
        color: true,
        colorName: true,
        stock: true,
        price: true,
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            brand: { select: { name: true } }
          }
        }
      },
      orderBy: [
        { product: { name: 'asc' } },
        { size: 'asc' }
      ]
    });

    const groupedSizes = sizes.reduce((acc, variant) => {
      const key = variant.productId;
      if (!acc[key]) {
        acc[key] = {
          product: variant.product,
          availableSizes: []
        };
      }
      acc[key].availableSizes.push({
        size: variant.size,
        color: variant.color,
        colorName: variant.colorName,
        stock: variant.stock,
        price: variant.price
      });
      return acc;
    }, {});

    res.json({ success: true, data: Object.values(groupedSizes) });
  } catch (error) {
    next(error);
  }
};

export const getProductVariants = async (req, res, next) => {
  try {
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: req.params.id,
        isActive: true
      },
      orderBy: { size: 'asc' }
    });

    res.json({ success: true, data: variants });
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);
    if (updateData.price) updateData.price = parseFloat(updateData.price);

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData
    });

    res.json({ success: true, data: variant });
  } catch (error) {
    next(error);
  }
};

export const addVariant = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const variant = await prisma.productVariant.create({
      data: {
        sku: `${product.sku}-${req.body.size}-${req.body.color}`,
        size: req.body.size.toString(),
        color: req.body.color,
        colorName: req.body.colorName || req.body.color,
        stock: parseInt(req.body.stock) || 0,
        price: req.body.price ? parseFloat(req.body.price) : null,
        isActive: true,
        productId: product.id
      }
    });

    res.status(201).json({ success: true, data: variant });
  } catch (error) {
    next(error);
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    await prisma.productVariant.update({
      where: { id: req.params.variantId },
      data: { isActive: false, stock: 0 }
    });

    res.json({ success: true, message: 'Variante desactivada exitosamente' });
  } catch (error) {
    next(error);
  }
};