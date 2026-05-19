// src/controllers/brandController.js
import { prisma } from '../server.js';

export const getBrands = async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

export const getBrand = async (req, res, next) => {
  try {
    const brand = await prisma.brand.findFirst({
      where: {
        OR: [{ id: req.params.id }, { slug: req.params.id }]
      },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: { where: { isMain: true }, take: 1 },
            variants: { where: { stock: { gt: 0 } } }
          },
          take: 20
        },
        _count: { select: { products: true } }
      }
    });

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Marca no encontrada' });
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const brand = await prisma.brand.create({
      data: { ...req.body, slug }
    });

    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    await prisma.brand.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Marca desactivada exitosamente' });
  } catch (error) {
    next(error);
  }
};