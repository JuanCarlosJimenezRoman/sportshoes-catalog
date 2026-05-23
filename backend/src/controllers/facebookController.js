// src/controllers/facebookController.js
import facebookService from '../services/facebookCatalogService.js';
import { prisma } from '../server.js';

export const getCatalogInfo = async (req, res, next) => {
  try {
    const result = await facebookService.getCatalogInfo();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const syncAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true } }
      },
      take: 50
    });

    const formatted = products.map(p => facebookService.formatProductForFacebook(p));
    const result = await facebookService.uploadProductsBatch(products);

    res.json({
      success: result.success,
      data: {
        total: products.length,
        ...result
      }
    });
  } catch (error) {
    next(error);
  }
};

export const testPayload = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { isActive: true },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'No hay productos' });
    }

    const formatted = facebookService.formatProductForFacebook(product);
    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const setupFeed = async (req, res, next) => {
  try {
    const result = await facebookService.uploadFeed();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getFeeds = async (req, res, next) => {
  try {
    const result = await facebookService.getFeeds();
    res.json(result);
  } catch (error) {
    next(error);
  }
};