// src/controllers/productController.js
import { prisma } from '../server.js';
import { QueryBuilder } from '../services/queryBuilder.js';

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
        images: { where: { isMain: true }, take: 1 },
        variants: { where: { stock: { gt: 0 }, isActive: true } }
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
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: req.params.id }, { slug: req.params.id }]
      },
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
      data: { ...product, averageRating: avgRating._avg.rating || 0 }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { variants, ...productData } = req.body;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `${productData.brandId.substring(0, 3).toUpperCase()}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        ...productData,
        sku,
        slug,
        price: parseFloat(productData.price),
        comparePrice: productData.comparePrice ? parseFloat(productData.comparePrice) : null,
        cost: productData.cost ? parseFloat(productData.cost) : null,
        colors: JSON.stringify(productData.colors || []),
        materials: JSON.stringify(productData.materials || []),
        tags: JSON.stringify(productData.tags || []),
        userId: req.user.id,
        variants: variants ? {
          create: variants.map(v => ({
            sku: `${sku}-${v.size}-${v.color}`,
            size: v.size,
            color: v.color,
            stock: parseInt(v.stock) || 0,
            price: v.price ? parseFloat(v.price) : null
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
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    delete updateData.sku;
    delete updateData.slug;
    delete updateData.id;

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.comparePrice) updateData.comparePrice = parseFloat(updateData.comparePrice);
    if (updateData.cost) updateData.cost = parseFloat(updateData.cost);
    if (updateData.colors) updateData.colors = JSON.stringify(updateData.colors);
    if (updateData.materials) updateData.materials = JSON.stringify(updateData.materials);
    if (updateData.tags) updateData.tags = JSON.stringify(updateData.tags);

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

    res.json({ success: true, data: product });
  } catch (error) {
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

export const getProductFilters = async (req, res, next) => {
  try {
    const [categories, brands, sizes] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } }),
      prisma.brand.findMany({ where: { isActive: true }, select: { id: true, name: true, slug: true } }),
      prisma.productVariant.findMany({
        where: { stock: { gt: 0 }, isActive: true },
        select: { size: true },
        distinct: ['size'],
        orderBy: { size: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        categories,
        brands,
        sizes: sizes.map(s => s.size)
      }
    });
  } catch (error) {
    next(error);
  }
};