// backend/src/controllers/productController.js
import { prisma } from '../server.js';
import { cloudinaryService } from '../services/cloudinaryService.js';

class ProductController {
  // Obtener todos los productos con filtros
  async getProducts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        category,
        brand,
        gender,
        minPrice,
        maxPrice,
        sizes,
        colors,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        isActive,
        isFeatured
      } = req.query;

      // Construir where clause dinámico
      const where = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (category) {
        where.category = {
          slug: category
        };
      }

      if (brand) {
        where.brand = {
          slug: brand
        };
      }

      if (gender) {
        where.gender = gender;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
      }

      if (sizes) {
        const sizeArray = sizes.split(',');
        where.variants = {
          some: {
            size: { in: sizeArray },
            stock: { gt: 0 }
          }
        };
      }

      if (colors) {
        where.colors = {
          hasSome: colors.split(',')
        };
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (isFeatured !== undefined) {
        where.isFeatured = isFeatured === 'true';
      }

      // Contar total de productos
      const total = await prisma.product.count({ where });
      
      // Obtener productos
      const products = await prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          images: {
            where: { isMain: true },
            take: 1
          },
          variants: {
            where: {
              stock: { gt: 0 }
            },
            select: {
              size: true,
              color: true,
              stock: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      });

      res.json({
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener un producto por ID o slug
  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { id },
            { slug: id }
          ]
        },
        include: {
          brand: true,
          category: true,
          images: {
            orderBy: { position: 'asc' }
          },
          variants: {
            where: { isActive: true },
            orderBy: { size: 'asc' }
          },
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          user: {
            select: {
              name: true
            }
          }
        }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Calcular rating promedio
      const avgRating = await prisma.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true }
      });

      res.json({
        success: true,
        data: {
          ...product,
          averageRating: avgRating._avg.rating || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear producto
  async createProduct(req, res, next) {
    try {
      const {
        name,
        description,
        price,
        comparePrice,
        cost,
        brandId,
        categoryId,
        gender,
        colors,
        materials,
        isActive,
        isFeatured,
        tags,
        seoTitle,
        seoDescription,
        variants
      } = req.body;

      // Generar SKU y slug únicos
      const sku = await this.generateSKU(brandId, categoryId);
      const slug = await this.generateSlug(name);

      const product = await prisma.product.create({
        data: {
          sku,
          name,
          slug,
          description,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          cost: cost ? parseFloat(cost) : null,
          brandId,
          categoryId,
          userId: req.user.id,
          gender,
          colors,
          materials,
          isActive,
          isFeatured,
          tags,
          seoTitle,
          seoDescription,
          variants: {
            create: variants?.map(variant => ({
              sku: `${sku}-${variant.size}-${variant.color}`,
              size: variant.size,
              color: variant.color,
              colorName: variant.colorName,
              stock: parseInt(variant.stock) || 0,
              price: variant.price ? parseFloat(variant.price) : null
            }))
          }
        },
        include: {
          brand: true,
          category: true,
          variants: true
        }
      });

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar producto
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // No permitir actualizar SKU ni slug directamente
      delete updateData.sku;
      delete updateData.slug;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          brand: true,
          category: true,
          variants: true
        }
      });

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar producto (soft delete)
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Producto desactivado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  // Subir imágenes del producto
  async uploadImages(req, res, next) {
    try {
      const { id } = req.params;
      const files = req.files;

      const uploadResults = await Promise.all(
        files.map(file => cloudinaryService.uploadImage(file))
      );

      const images = await Promise.all(
        uploadResults.map((result, index) =>
          prisma.productImage.create({
            data: {
              url: result.secure_url,
              altText: req.body.altTexts?.[index],
              position: index,
              isMain: index === 0,
              productId: id
            }
          })
        )
      );

      res.json({
        success: true,
        data: images
      });
    } catch (error) {
      next(error);
    }
  }

  // Utilidades
  async generateSKU(brandId, categoryId) {
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    const count = await prisma.product.count();
    
    return `${brand.slug.substring(0, 3).toUpperCase()}-${category.slug.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(6, '0')}`;
  }

  async generateSlug(name) {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Verificar unicidad
    const existing = await prisma.product.findFirst({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    
    return slug;
  }
}

export default new ProductController();