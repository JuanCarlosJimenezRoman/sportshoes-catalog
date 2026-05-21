// backend/prisma/seed-simple.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed simplificado...');

  try {
    // 1. Crear usuario admin
    console.log('Creando usuario admin...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@sportshoes.com' },
      update: {},
      create: {
        email: 'admin@sportshoes.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN'
      }
    });
    console.log('✅ Usuario creado:', admin.email);

    // 2. Crear marcas
    console.log('\nCreando marcas...');
    const brandsData = [
      { name: 'Nike', slug: 'nike', description: 'Just Do It', isActive: true },
      { name: 'Adidas', slug: 'adidas', description: 'Impossible is Nothing', isActive: true },
      { name: 'Puma', slug: 'puma', description: 'Forever Faster', isActive: true },
      { name: 'New Balance', slug: 'new-balance', description: 'Made in USA', isActive: true }
    ];

    const brands = [];
    for (const brand of brandsData) {
      const created = await prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand
      });
      brands.push(created);
      console.log(`✅ Marca creada: ${created.name}`);
    }

    // 3. Crear categorías
    console.log('\nCreando categorías...');
    const categoriesData = [
      { name: 'Running', slug: 'running', description: 'Tenis para correr' },
      { name: 'Training', slug: 'training', description: 'Entrenamiento y gimnasio' },
      { name: 'Basketball', slug: 'basketball', description: 'Básquetbol' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Uso casual y urbano' }
    ];

    const categories = [];
    for (const category of categoriesData) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
      categories.push(created);
      console.log(`✅ Categoría creada: ${created.name}`);
    }

    // 4. Crear productos de ejemplo
    console.log('\nCreando productos...');
    const productsData = [
      {
        name: 'Nike Air Max 270',
        description: 'Tenis icónicas con amortiguación Air Max visible',
        price: 159.99,
        comparePrice: 179.99,
        brandId: brands[0].id,
        categoryId: categories[3].id,
        userId: admin.id,
        gender: 'UNISEX',
        colors: JSON.stringify(['black', 'white', 'red']),
        materials: JSON.stringify(['Malla', 'Sintético']),
        tags: JSON.stringify(['running', 'casual']),
        variants: [
          { size: '40', color: 'black', stock: 10, price: 159.99 },
          { size: '41', color: 'black', stock: 15, price: 159.99 },
          { size: '42', color: 'black', stock: 20, price: 159.99 },
          { size: '43', color: 'black', stock: 15, price: 159.99 }
        ]
      },
      {
        name: 'Adidas Ultraboost',
        description: 'Máxima amortiguación y retorno de energía',
        price: 189.99,
        brandId: brands[1].id,
        categoryId: categories[0].id,
        userId: admin.id,
        gender: 'UNISEX',
        colors: JSON.stringify(['black', 'white', 'blue']),
        materials: JSON.stringify(['Primeknit', 'Boost']),
        tags: JSON.stringify(['running', 'premium']),
        variants: [
          { size: '39', color: 'black', stock: 8, price: 189.99 },
          { size: '40', color: 'black', stock: 12, price: 189.99 },
          { size: '41', color: 'black', stock: 15, price: 189.99 },
          { size: '42', color: 'black', stock: 18, price: 189.99 },
          { size: '43', color: 'black', stock: 15, price: 189.99 }
        ]
      },
      {
        name: 'Puma Suede Classic',
        description: 'Clásico del streetwear con estilo retro',
        price: 79.99,
        comparePrice: 89.99,
        brandId: brands[2].id,
        categoryId: categories[3].id,
        userId: admin.id,
        gender: 'UNISEX',
        colors: JSON.stringify(['black', 'red', 'blue']),
        materials: JSON.stringify(['Gamuza', 'Goma']),
        tags: JSON.stringify(['classic', 'casual']),
        variants: [
          { size: '38', color: 'black', stock: 20, price: 79.99 },
          { size: '39', color: 'black', stock: 25, price: 79.99 },
          { size: '40', color: 'black', stock: 30, price: 79.99 },
          { size: '41', color: 'black', stock: 25, price: 79.99 },
          { size: '42', color: 'black', stock: 20, price: 79.99 }
        ]
      }
    ];

    let productCount = 0;
    for (const productData of productsData) {
      const { variants, ...productInfo } = productData;
      
      // Generar SKU y slug
      const slug = productInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const sku = `SPT-${String(productCount + 1).padStart(4, '0')}`;
      
      // Verificar si existe
      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) continue;

      const product = await prisma.product.create({
        data: {
          ...productInfo,
          sku,
          slug,
          variants: {
            create: variants.map(v => ({
              sku: `${sku}-${v.size}-${v.color}`,
              ...v,
              colorName: v.color
            }))
          },
          images: {
            create: [
              {
                url: `https://picsum.photos/400/400?random=${productCount + 1}`,
                altText: `${productInfo.name} - Vista principal`,
                position: 0,
                isMain: true
              }
            ]
          }
        }
      });
      
      productCount++;
      console.log(`✅ Producto creado: ${product.name} (SKU: ${product.sku})`);
    }

    // 5. Crear cupones
    console.log('\nCreando cupones...');
    const coupons = [
      {
        code: 'BIENVENIDO15',
        discount: 15,
        type: 'PERCENTAGE',
        minPurchase: 80,
        maxUses: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      },
      {
        code: 'VERANO20',
        discount: 20,
        type: 'PERCENTAGE',
        minPurchase: 100,
        maxUses: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      }
    ];

    for (const coupon of coupons) {
      await prisma.coupon.upsert({
        where: { code: coupon.code },
        update: {},
        create: coupon
      });
      console.log(`✅ Cupón creado: ${coupon.code}`);
    }

    console.log('\n✨ Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${brands.length} marcas`);
    console.log(`   - ${categories.length} categorías`);
    console.log(`   - ${productCount} productos`);
    console.log(`   - ${coupons.length} cupones`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Email: admin@sportshoes.com');
    console.log('   Password: Admin123!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });