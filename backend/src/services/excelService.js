// src/services/excelService.js
import XLSX from 'xlsx';
import { prisma } from '../server.js';
import fs from 'fs';
import path from 'path';

export async function processProductExcel(filePath, userId) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  const results = {
    total: data.length,
    success: 0,
    errors: [],
    products: []
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      const product = await createProductFromRow(row, userId, i + 2);
      results.products.push(product);
      results.success++;
    } catch (error) {
      results.errors.push({
        row: i + 2,
        sku: row.SKU || 'N/A',
        error: error.message
      });
    }
  }

  return results;
}

async function createProductFromRow(row, userId, rowNumber) {
  const sku = row.SKU?.toString().trim();
  const name = row.NOMBRE?.toString().trim();
  const brandName = row.MARCA?.toString().trim();
  const categoryName = row.CATEGORIA?.toString().trim();
  const price = parseFloat(row.PRECIO) || 0;
  const gender = (row.GENERO || 'UNISEX').toString().trim().toUpperCase();

  if (!sku) throw new Error('SKU requerido');
  if (!name) throw new Error('Nombre requerido');
  if (!brandName) throw new Error('Marca requerida');
  if (!categoryName) throw new Error('Categoría requerida');

  const existingSku = await prisma.product.findUnique({ where: { sku } });
  if (existingSku) throw new Error(`SKU '${sku}' ya existe`);

  let brand = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { equals: brandName } },
        { slug: { equals: brandName.toLowerCase().replace(/\s+/g, '-') } }
      ]
    }
  });

  if (!brand) {
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    brand = await prisma.brand.create({ data: { name: brandName, slug } });
  }

  let category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: categoryName } },
        { slug: { equals: categoryName.toLowerCase().replace(/\s+/g, '-') } }
      ]
    }
  });

  if (!category) {
    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    category = await prisma.category.create({ data: { name: categoryName, slug } });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const product = await prisma.product.create({
    data: {
      sku,
      name,
      slug,
      description: row.DESCRIPCION?.toString().trim() || '',
      price,
      comparePrice: parseFloat(row.PRECIO_COMPARACION) || null,
      cost: parseFloat(row.COSTO) || null,
      gender: ['MEN', 'WOMEN', 'UNISEX', 'KIDS'].includes(gender) ? gender : 'UNISEX',
      brandId: brand.id,
      categoryId: category.id,
      userId,
      colors: JSON.stringify(parseArrayField(row.COLORES)),
      materials: JSON.stringify(parseArrayField(row.MATERIALES)),
      tags: JSON.stringify(parseArrayField(row.TAGS)),
      isActive: parseBoolean(row.ACTIVO, true),
      isFeatured: parseBoolean(row.DESTACADO, false)
    },
    include: { brand: true, category: true }
  });

  let imagesCreated = 0;
  const imagePaths = parseImagePaths(row.IMAGENES || row.IMAGEN || row.IMAGES || '');
  
  if (imagePaths.length > 0) {
    imagesCreated = await processProductImages(product, imagePaths, sku);
  }

  const sizeColumns = Object.keys(row).filter(key => {
    const val = parseFloat(key);
    return !isNaN(val) && val >= 17 && val <= 32;
  });

  let variantsCreated = 0;
  if (sizeColumns.length > 0) {
    const variantsToCreate = [];
    
    for (const sizeCol of sizeColumns) {
      const stock = parseInt(row[sizeCol]) || 0;
      if (stock > 0) {
        variantsToCreate.push({
          sku: `${sku}-${sizeCol}`,
          size: sizeCol,
          color: 'default',
          colorName: 'Único',
          stock,
          price: null,
          isActive: true,
          productId: product.id
        });
      }
    }

    if (variantsToCreate.length > 0) {
      await prisma.productVariant.createMany({ data: variantsToCreate });
      variantsCreated = variantsToCreate.length;
    }
  }

  return { ...product, variantsCreated, imagesCreated };
}

async function processProductImages(product, imagePaths, sku) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  let imagesCreated = 0;

  for (let i = 0; i < imagePaths.length; i++) {
    const imagePath = imagePaths[i].trim();
    
    if (!imagePath) continue;

    try {
      if (!fs.existsSync(imagePath)) {
        console.warn(`Imagen no encontrada: ${imagePath}`);
        continue;
      }

      const ext = path.extname(imagePath).toLowerCase();
      if (!validExtensions.includes(ext)) {
        console.warn(`Formato no válido: ${imagePath}`);
        continue;
      }

      const timestamp = Date.now() + i;
      const filename = `${sku}-${timestamp}${ext}`;
      const destPath = path.join(uploadDir, filename);

      fs.copyFileSync(imagePath, destPath);

      await prisma.productImage.create({
        data: {
          url: `/uploads/products/${filename}`,
          altText: `${product.name} - Vista ${i + 1}`,
          position: i,
          isMain: i === 0,
          productId: product.id
        }
      });

      imagesCreated++;
    } catch (error) {
      console.error(`Error procesando imagen ${imagePath}:`, error.message);
    }
  }

  return imagesCreated;
}

function parseImagePaths(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  
  return value.toString()
    .split(/[;,]/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.toString().split(',').map(v => v.trim()).filter(Boolean);
}

function parseBoolean(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const str = value.toString().toLowerCase().trim();
  if (str === 'verdadero' || str === 'true' || str === 'si' || str === '1') return true;
  if (str === 'falso' || str === 'false' || str === 'no' || str === '0') return false;
  return defaultValue;
}