// prisma/seed.js - Solo cambia la forma de parsear JSON
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed para PostgreSQL...\n');

  try {
    await prisma.review.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Datos limpiados\n');

    console.log('👤 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sportshoes.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'SUPER_ADMIN'
      }
    });
    const gestor = await prisma.user.create({
      data: {
        email: 'gestion@sportshoes.com',
        password: hashedPassword,
        name: 'Gestor',
        role: 'ADMIN'
      }
    });
    console.log('✅ Usuarios creados\n');

    console.log('🏷️ Creando marcas...');
    const brandsData = [
      { name: 'Nike', slug: 'nike', description: 'Just Do It' },
      { name: 'Adidas', slug: 'adidas', description: 'Impossible is Nothing' },
      { name: 'Puma', slug: 'puma', description: 'Forever Faster' },
      { name: 'New Balance', slug: 'new-balance', description: 'Made in USA' }
    ];
    
    const brands = [];
    for (const brand of brandsData) {
      const b = await prisma.brand.create({ data: brand });
      brands.push(b);
      console.log(`  ✓ ${b.name}`);
    }
    console.log('✅ Marcas creadas\n');

    console.log('📁 Creando categorías...');
    const cats = [
      { name: 'Running', slug: 'running', description: 'Zapatillas para correr' },
      { name: 'Training', slug: 'training', description: 'Entrenamiento y gimnasio' },
      { name: 'Basketball', slug: 'basketball', description: 'Básquetbol' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Uso casual' }
    ];
    
    const categories = [];
    for (const cat of cats) {
      const c = await prisma.category.create({ data: cat });
      categories.push(c);
      console.log(`  ✓ ${c.name}`);
    }
    console.log('✅ Categorías creadas\n');

    console.log('👟 Creando productos...');
    const productsData = [
      {
        sku: 'NIKE-RUN-001',
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        description: 'Zapatillas icónicas con amortiguación Air Max',
        price: 159.99,
        comparePrice: 179.99,
        cost: 80.00,
        brandId: brands[0].id,
        categoryId: categories[3].id,
        userId: admin.id,
        gender: 'UNISEX',
        colors: ['black', 'white', 'red'],
        materials: ['Malla', 'Sintético'],
        tags: ['running', 'casual'],
        variants: [
          { size: '40', color: 'black', stock: 10 },
          { size: '41', color: 'black', stock: 15 },
          { size: '42', color: 'black', stock: 20 }
        ]
      },
      {
        sku: 'ADIDAS-RUN-001',
        name: 'Adidas Ultraboost',
        slug: 'adidas-ultraboost',
        description: 'Máxima amortiguación y retorno de energía',
        price: 189.99,
        brandId: brands[1].id,
        categoryId: categories[0].id,
        userId: gestor.id,
        gender: 'UNISEX',
        colors: ['black', 'white', 'blue'],
        materials: ['Primeknit', 'Boost'],
        tags: ['running', 'premium'],
        variants: [
          { size: '39', color: 'black', stock: 8 },
          { size: '40', color: 'black', stock: 12 },
          { size: '41', color: 'black', stock: 15 }
        ]
      }
    ];

    for (const productData of productsData) {
      const { variants, ...data } = productData;
      await prisma.product.create({
        data: {
          ...data,
          variants: {
            create: variants.map(v => ({
              sku: `${data.sku}-${v.size}`,
              size: v.size,
              color: v.color,
              colorName: v.color,
              stock: v.stock
            }))
          }
        }
      });
      console.log(`  ✓ ${data.name}`);
    }
    console.log('✅ Productos creados\n');

    console.log('🎟️ Creando cupones...');
    await prisma.coupon.create({
      data: {
        code: 'BIENVENIDO15',
        discount: 15,
        type: 'PERCENTAGE',
        minPurchase: 80,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      }
    });
    console.log('✅ Cupón creado\n');

    console.log('✨ Seed completado!\n');
    console.log('📧 admin@sportshoes.com / Admin123!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => process.exit(1))
  .finally(() => prisma.$disconnect());