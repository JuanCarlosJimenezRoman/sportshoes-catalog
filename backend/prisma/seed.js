// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Colores disponibles con sus nombres
const COLOR_NAMES = {
  black: 'Negro',
  white: 'Blanco',
  red: 'Rojo',
  blue: 'Azul',
  green: 'Verde',
  grey: 'Gris',
  orange: 'Naranja',
  purple: 'Púrpura',
  gold: 'Dorado',
  volt: 'Volt',
  olive: 'Oliva',
  navy: 'Azul Marino',
  burgundy: 'Borgoña',
  chalk: 'Tiza',
  yellow: 'Amarillo',
  pink: 'Rosa',
  brown: 'Marrón',
  silver: 'Plateado'
};

// URLs de imágenes placeholder por categoría
const IMAGE_PLACEHOLDERS = {
  running: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop'
  ],
  training: [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=600&fit=crop'
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1519861535733-d572dcc6a6bf?w=600&h=600&fit=crop'
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop'
  ],
  football: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=600&h=600&fit=crop'
  ]
};

async function main() {
  console.log('🚀 Iniciando seed de SportShoes...\n');

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.review.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Datos limpiados\n');

    // 1. Crear usuarios
    console.log('👤 Creando usuarios administradores...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@sportshoes.com',
          password: hashedPassword,
          name: 'Administrador Principal',
          role: 'SUPER_ADMIN'
        }
      }),
      prisma.user.create({
        data: {
          email: 'gestion@sportshoes.com',
          password: hashedPassword,
          name: 'Gestor de Productos',
          role: 'ADMIN'
        }
      })
    ]);
    console.log(`✅ ${users.length} usuarios creados\n`);

    // 2. Crear marcas
    console.log('🏷️  Creando marcas...');
    const brandsData = [
      {
        name: 'Nike',
        slug: 'nike',
        description: 'Líder mundial en calzado deportivo e innovación. Just Do It.',
        website: 'https://www.nike.com',
        isActive: true
      },
      {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing. Calzado deportivo de alto rendimiento.',
        website: 'https://www.adidas.com',
        isActive: true
      },
      {
        name: 'Puma',
        slug: 'puma',
        description: 'Forever Faster. Innovación y estilo deportivo para todos.',
        website: 'https://www.puma.com',
        isActive: true
      },
      {
        name: 'New Balance',
        slug: 'new-balance',
        description: 'Calzado de calidad superior para atletas exigentes.',
        website: 'https://www.newbalance.com',
        isActive: true
      },
      {
        name: 'Under Armour',
        slug: 'under-armour',
        description: 'Protege esta casa. Rendimiento y tecnología deportiva.',
        website: 'https://www.underarmour.com',
        isActive: true
      },
      {
        name: 'Reebok',
        slug: 'reebok',
        description: 'Be More Human. Fitness y estilo de vida deportivo.',
        website: 'https://www.reebok.com',
        isActive: true
      }
    ];

    const brands = [];
    for (const brandData of brandsData) {
      const brand = await prisma.brand.create({ data: brandData });
      brands.push(brand);
      console.log(`  ✓ ${brand.name}`);
    }
    console.log(`✅ ${brands.length} marcas creadas\n`);

    // 3. Crear categorías
    console.log('📁 Creando categorías...');
    
    // Categorías principales
    const mainCategoriesData = [
      {
        name: 'Running',
        slug: 'running',
        description: 'Zapatillas diseñadas para correr con máxima comodidad y rendimiento',
        image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=300&h=300&fit=crop',
        children: [
          {
            name: 'Trail Running',
            slug: 'trail-running',
            description: 'Para terrenos irregulares y senderos naturales'
          },
          {
            name: 'Running Urbano',
            slug: 'running-urbano',
            description: 'Para asfalto y superficies urbanas'
          },
          {
            name: 'Competencia',
            slug: 'competencia',
            description: 'Máximo rendimiento para carreras y maratones'
          }
        ]
      },
      {
        name: 'Training',
        slug: 'training',
        description: 'Zapatillas versátiles para entrenamiento funcional y gimnasio',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=300&fit=crop',
        children: [
          {
            name: 'Cross Training',
            slug: 'cross-training',
            description: 'Para entrenamientos de alta intensidad y crossfit'
          },
          {
            name: 'Gimnasio',
            slug: 'gimnasio',
            description: 'Ideales para pesas, máquinas y cardio indoor'
          }
        ]
      },
      {
        name: 'Basketball',
        slug: 'basketball',
        description: 'Diseñadas para la cancha con soporte y amortiguación superior',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=300&fit=crop'
      },
      {
        name: 'Fútbol',
        slug: 'futbol',
        description: 'Botines y zapatillas para el deporte más popular del mundo',
        image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=300&fit=crop',
        children: [
          {
            name: 'Fútbol 11',
            slug: 'futbol-11',
            description: 'Botines para cancha grande de césped natural'
          },
          {
            name: 'Futsal',
            slug: 'futsal',
            description: 'Para cancha indoor y superficies lisas'
          }
        ]
      },
      {
        name: 'Lifestyle',
        slug: 'lifestyle',
        description: 'Estilo casual y urbano para el día a día con comodidad deportiva',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop'
      },
      {
        name: 'Tenis',
        slug: 'tenis',
        description: 'Específicas para canchas de tenis con soporte lateral',
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=300&h=300&fit=crop'
      }
    ];

    const allCategories = [];
    for (const catData of mainCategoriesData) {
      const { children, ...parentData } = catData;
      
      const parent = await prisma.category.create({ data: parentData });
      allCategories.push(parent);
      console.log(`  ✓ ${parent.name}`);
      
      if (children) {
        for (const childData of children) {
          const child = await prisma.category.create({
            data: {
              ...childData,
              parentId: parent.id
            }
          });
          allCategories.push(child);
          console.log(`    ↳ ${child.name}`);
        }
      }
    }
    console.log(`✅ ${allCategories.length} categorías creadas\n`);

    // 4. Crear productos
    console.log('👟 Creando productos...');
    
    const productsData = [
      // NIKE PRODUCTS
      {
        name: 'Nike Air Zoom Pegasus 40',
        description: 'Las Pegasus 40 son la culminación de décadas de innovación en running. Con amortiguación Zoom Air en el antepié y el talón, ofrecen una sensación de rebote increíble en cada zancada. La malla engineered es más ligera y transpirable que nunca, manteniendo tus pies frescos durante los entrenamientos más intensos.',
        price: 129.99,
        comparePrice: 149.99,
        cost: 65.00,
        brandSlug: 'nike',
        categorySlug: 'running-urbano',
        userIndex: 0,
        gender: 'UNISEX',
        colors: ['black', 'white', 'blue', 'red'],
        materials: ['Malla engineered', 'Espuma React', 'Unidad Zoom Air', 'Suela de caucho'],
        isActive: true,
        isFeatured: true,
        tags: ['running', 'amortiguación', 'diario', 'entrenamiento', 'versátil'],
        seoTitle: 'Nike Air Zoom Pegasus 40 - Zapatillas de Running Versátiles | SportShoes',
        seoDescription: 'Compra las Nike Air Zoom Pegasus 40, las zapatillas de running más versátiles con amortiguación Zoom Air. Envío gratis + cambios sin costo.',
        imageType: 'running',
        variants: [
          { size: '38', color: 'black', stock: 15, price: 129.99 },
          { size: '39', color: 'black', stock: 20, price: 129.99 },
          { size: '40', color: 'black', stock: 25, price: 129.99 },
          { size: '41', color: 'black', stock: 30, price: 129.99 },
          { size: '42', color: 'black', stock: 35, price: 129.99 },
          { size: '43', color: 'black', stock: 30, price: 129.99 },
          { size: '44', color: 'black', stock: 25, price: 129.99 },
          { size: '40', color: 'white', stock: 20, price: 129.99 },
          { size: '41', color: 'white', stock: 25, price: 129.99 },
          { size: '42', color: 'white', stock: 30, price: 129.99 },
          { size: '43', color: 'white', stock: 20, price: 129.99 }
        ]
      },
      {
        name: 'Nike Air Max 270 React',
        description: 'Fusión perfecta entre el estilo de vida y el rendimiento deportivo. La unidad Air Max 270 visible en el talón proporciona una amortiguación excepcional, mientras que la espuma React en el antepié ofrece una pisada suave y reactiva. El diseño moderno las convierte en el centro de atención donde quiera que vayas.',
        price: 159.99,
        comparePrice: 179.99,
        cost: 80.00,
        brandSlug: 'nike',
        categorySlug: 'lifestyle',
        userIndex: 1,
        gender: 'MEN',
        colors: ['black', 'white', 'volt', 'blue'],
        materials: ['Malla', 'Cuero sintético', 'Unidad Air Max 270', 'Espuma React'],
        isActive: true,
        isFeatured: true,
        tags: ['lifestyle', 'casual', 'air max', 'moda urbana'],
        seoTitle: 'Nike Air Max 270 React - Estilo y Comodidad Urbana | SportShoes',
        seoDescription: 'Descubre las Nike Air Max 270 React con amortiguación visible y diseño moderno. Perfectas para el día a día con estilo deportivo.',
        imageType: 'lifestyle',
        variants: [
          { size: '39', color: 'black', stock: 10, price: 159.99 },
          { size: '40', color: 'black', stock: 15, price: 159.99 },
          { size: '41', color: 'black', stock: 20, price: 159.99 },
          { size: '42', color: 'black', stock: 25, price: 159.99 },
          { size: '43', color: 'black', stock: 20, price: 159.99 },
          { size: '44', color: 'black', stock: 15, price: 159.99 },
          { size: '45', color: 'black', stock: 10, price: 159.99 }
        ]
      },
      {
        name: 'Nike LeBron 21',
        description: 'Las zapatillas signature de LeBron James para la temporada 2024. Diseñadas con tecnología de punta para jugadores que dominan la cancha. La amortiguación Zoom Air combinada con la espuma Cushlon proporciona una pisada explosiva para los movimientos más dinámicos.',
        price: 199.99,
        comparePrice: 219.99,
        cost: 100.00,
        brandSlug: 'nike',
        categorySlug: 'basketball',
        userIndex: 0,
        gender: 'MEN',
        colors: ['purple', 'gold', 'black', 'white'],
        materials: ['Malla Knitposite', 'Cuero premium', 'Zoom Air', 'Espuma Cushlon'],
        isActive: true,
        isFeatured: true,
        tags: ['basketball', 'lebron', 'profesional', 'alto rendimiento'],
        seoTitle: 'Nike LeBron 21 - Zapatillas de Basketball Profesional | SportShoes',
        seoDescription: 'Domina la cancha con las Nike LeBron 21. Tecnología Zoom Air y diseño signature de LeBron James.',
        imageType: 'basketball',
        variants: [
          { size: '40', color: 'purple', stock: 5, price: 199.99 },
          { size: '41', color: 'purple', stock: 8, price: 199.99 },
          { size: '42', color: 'purple', stock: 12, price: 199.99 },
          { size: '43', color: 'purple', stock: 15, price: 199.99 },
          { size: '44', color: 'purple', stock: 10, price: 199.99 },
          { size: '45', color: 'purple', stock: 8, price: 199.99 },
          { size: '46', color: 'purple', stock: 5, price: 199.99 }
        ]
      },
      // ADIDAS PRODUCTS
      {
        name: 'Adidas Ultraboost Light',
        description: 'La evolución más ligera del icónico Ultraboost. Con la nueva espuma Light BOOST, estas zapatillas ofrecen una amortiguación excepcional con un peso reducido. El upper Primeknit+ se adapta como un calcetín, proporcionando un ajuste perfecto y transpirable.',
        price: 179.99,
        comparePrice: 199.99,
        cost: 90.00,
        brandSlug: 'adidas',
        categorySlug: 'running-urbano',
        userIndex: 1,
        gender: 'UNISEX',
        colors: ['black', 'white', 'grey', 'olive'],
        materials: ['Primeknit+', 'Light BOOST', 'Continental Rubber', 'Linear Energy Push'],
        isActive: true,
        isFeatured: true,
        tags: ['running', 'ultraboost', 'premium', 'comodidad'],
        seoTitle: 'Adidas Ultraboost Light - Running Premium | SportShoes',
        seoDescription: 'Experimenta la revolución en running con Adidas Ultraboost Light. Espuma Light BOOST más ligera y reactiva.',
        imageType: 'running',
        variants: [
          { size: '38', color: 'black', stock: 10, price: 179.99 },
          { size: '39', color: 'black', stock: 15, price: 179.99 },
          { size: '40', color: 'black', stock: 20, price: 179.99 },
          { size: '41', color: 'black', stock: 25, price: 179.99 },
          { size: '42', color: 'black', stock: 30, price: 179.99 },
          { size: '43', color: 'black', stock: 25, price: 179.99 },
          { size: '44', color: 'black', stock: 20, price: 179.99 }
        ]
      },
      {
        name: 'Adidas Predator Accuracy.1',
        description: 'Los botines de fútbol más icónicos regresan mejorados. Con elementos de goma High Definition Texture para un control del balón preciso. La suela específica para firm ground ofrece tracción óptima en césped natural para movimientos explosivos.',
        price: 249.99,
        comparePrice: null,
        cost: 125.00,
        brandSlug: 'adidas',
        categorySlug: 'futbol-11',
        userIndex: 0,
        gender: 'MEN',
        colors: ['black', 'red', 'white', 'blue'],
        materials: ['Primeknit', 'Sintético', 'Goma HD Texture', 'Suela FG'],
        isActive: true,
        isFeatured: true,
        tags: ['futbol', 'botines', 'predator', 'control', 'profesional'],
        seoTitle: 'Adidas Predator Accuracy.1 - Botines de Fútbol Elite | SportShoes',
        seoDescription: 'Controla el juego con los Adidas Predator Accuracy.1. Tecnología High Definition Texture para precisión máxima.',
        imageType: 'football',
        variants: [
          { size: '39', color: 'black', stock: 5, price: 249.99 },
          { size: '40', color: 'black', stock: 8, price: 249.99 },
          { size: '41', color: 'black', stock: 12, price: 249.99 },
          { size: '42', color: 'black', stock: 15, price: 249.99 },
          { size: '43', color: 'black', stock: 12, price: 249.99 },
          { size: '44', color: 'black', stock: 8, price: 249.99 }
        ]
      },
      // PUMA PRODUCTS
      {
        name: 'Puma Suede Classic XXI',
        description: 'El ícono del streetwear que definió generaciones. Las Puma Suede mantienen su diseño clásico con mejoras modernas en comodidad. El upper de gamuza premium y la suela de goma las hacen perfectas para el estilo casual de todos los días.',
        price: 79.99,
        comparePrice: 89.99,
        cost: 35.00,
        brandSlug: 'puma',
        categorySlug: 'lifestyle',
        userIndex: 1,
        gender: 'UNISEX',
        colors: ['black', 'red', 'blue', 'green', 'grey'],
        materials: ['Gamuza premium', 'Suela de goma', 'Plantilla SoftFoam+'],
        isActive: true,
        isFeatured: true,
        tags: ['lifestyle', 'classic', 'suede', 'retro', 'streetwear'],
        seoTitle: 'Puma Suede Classic XXI - Ícono del Streetwear | SportShoes',
        seoDescription: 'Las legendarias Puma Suede Classic XXI. Diseño atemporal con comodidad moderna. Disponible en múltiples colores.',
        imageType: 'lifestyle',
        variants: [
          { size: '36', color: 'black', stock: 20, price: 79.99 },
          { size: '37', color: 'black', stock: 25, price: 79.99 },
          { size: '38', color: 'black', stock: 30, price: 79.99 },
          { size: '39', color: 'black', stock: 35, price: 79.99 },
          { size: '40', color: 'black', stock: 40, price: 79.99 },
          { size: '41', color: 'black', stock: 35, price: 79.99 },
          { size: '42', color: 'black', stock: 30, price: 79.99 },
          { size: '43', color: 'black', stock: 25, price: 79.99 },
          { size: '44', color: 'black', stock: 20, price: 79.99 }
        ]
      },
      {
        name: 'Puma Deviate Nitro 2',
        description: 'Zapatillas de running con placa de carbono y espuma NITRO Elite para máxima propulsión. Diseñadas para corredores que buscan batir sus récords personales en carreras de larga distancia. La tecnología PUMAGRIP ofrece tracción excepcional.',
        price: 199.99,
        comparePrice: 219.99,
        cost: 100.00,
        brandSlug: 'puma',
        categorySlug: 'competencia',
        userIndex: 0,
        gender: 'UNISEX',
        colors: ['orange', 'black', 'white'],
        materials: ['Malla técnica', 'NITRO Elite', 'Placa de carbono', 'PUMAGRIP'],
        isActive: true,
        isFeatured: false,
        tags: ['running', 'competencia', 'carbono', 'velocidad'],
        seoTitle: 'Puma Deviate Nitro 2 - Zapatillas con Placa de Carbono | SportShoes',
        seoDescription: 'Rompe tus récords con Puma Deviate Nitro 2. Tecnología NITRO Elite y placa de carbono para máxima velocidad.',
        imageType: 'running',
        variants: [
          { size: '38', color: 'orange', stock: 5, price: 199.99 },
          { size: '39', color: 'orange', stock: 8, price: 199.99 },
          { size: '40', color: 'orange', stock: 10, price: 199.99 },
          { size: '41', color: 'orange', stock: 12, price: 199.99 },
          { size: '42', color: 'orange', stock: 10, price: 199.99 },
          { size: '43', color: 'orange', stock: 8, price: 199.99 }
        ]
      },
      // NEW BALANCE PRODUCTS
      {
        name: 'New Balance Fresh Foam X 1080v13',
        description: 'La zapatilla de running premium de New Balance. La espuma Fresh Foam X proporciona una amortiguación lujosa con una transición suave. El upper Hypoknit está diseñado para ofrecer soporte estratégico donde más lo necesitas durante la carrera.',
        price: 169.99,
        comparePrice: 189.99,
        cost: 85.00,
        brandSlug: 'new-balance',
        categorySlug: 'running-urbano',
        userIndex: 0,
        gender: 'UNISEX',
        colors: ['white', 'black', 'blue', 'grey'],
        materials: ['Hypoknit', 'Fresh Foam X', 'Suela de soplado', 'Reflectantes'],
        isActive: true,
        isFeatured: true,
        tags: ['running', 'premium', 'amortiguación', 'diario'],
        seoTitle: 'New Balance Fresh Foam X 1080v13 - Running Premium | SportShoes',
        seoDescription: 'Máxima amortiguación con New Balance Fresh Foam X 1080v13. Espuma premium para corredores exigentes.',
        imageType: 'running',
        variants: [
          { size: '38', color: 'white', stock: 10, price: 169.99 },
          { size: '39', color: 'white', stock: 15, price: 169.99 },
          { size: '40', color: 'white', stock: 20, price: 169.99 },
          { size: '41', color: 'white', stock: 25, price: 169.99 },
          { size: '42', color: 'white', stock: 30, price: 169.99 },
          { size: '43', color: 'white', stock: 25, price: 169.99 },
          { size: '44', color: 'white', stock: 20, price: 169.99 }
        ]
      },
      {
        name: 'New Balance 574 Core',
        description: 'Las 574 son el ícono indiscutible de New Balance. Su diseño atemporal combina materiales premium con una comodidad duradera. La entresuela ENCAP proporciona soporte durante todo el día, haciéndolas perfectas para cualquier ocasión.',
        price: 94.99,
        comparePrice: 109.99,
        cost: 47.00,
        brandSlug: 'new-balance',
        categorySlug: 'lifestyle',
        userIndex: 1,
        gender: 'UNISEX',
        colors: ['grey', 'navy', 'black', 'burgundy'],
        materials: ['Gamuza', 'Malla', 'ENCAP', 'Suela de goma'],
        isActive: true,
        isFeatured: false,
        tags: ['lifestyle', 'classic', '574', 'retro', 'icónico'],
        seoTitle: 'New Balance 574 Core - Clásico Atemporal | SportShoes',
        seoDescription: 'Las icónicas New Balance 574 Core. Diseño legendario con materiales premium. El estilo que nunca pasa de moda.',
        imageType: 'lifestyle',
        variants: [
          { size: '36', color: 'grey', stock: 15, price: 94.99 },
          { size: '37', color: 'grey', stock: 20, price: 94.99 },
          { size: '38', color: 'grey', stock: 25, price: 94.99 },
          { size: '39', color: 'grey', stock: 30, price: 94.99 },
          { size: '40', color: 'grey', stock: 35, price: 94.99 },
          { size: '41', color: 'grey', stock: 30, price: 94.99 },
          { size: '42', color: 'grey', stock: 25, price: 94.99 },
          { size: '43', color: 'grey', stock: 20, price: 94.99 },
          { size: '44', color: 'grey', stock: 15, price: 94.99 }
        ]
      },
      // UNDER ARMOUR PRODUCTS
      {
        name: 'Under Armour HOVR Phantom 3',
        description: 'Zapatillas de running con conectividad Bluetooth para tracking de métricas de carrera. La amortiguación HOVR proporciona una sensación de gravedad cero que elimina el impacto. El upper UA Storm es repelente al agua para cualquier condición.',
        price: 149.99,
        comparePrice: 169.99,
        cost: 75.00,
        brandSlug: 'under-armour',
        categorySlug: 'trail-running',
        userIndex: 0,
        gender: 'MEN',
        colors: ['black', 'red', 'grey', 'blue'],
        materials: ['UA Storm', 'HOVR', 'Plantilla SpeedForm', 'Suela de goma'],
        isActive: true,
        isFeatured: true,
        tags: ['running', 'trail', 'tecnología', 'conectado', 'impermeable'],
        seoTitle: 'Under Armour HOVR Phantom 3 - Running Conectado | SportShoes',
        seoDescription: 'Corre conectado con Under Armour HOVR Phantom 3. Tracking Bluetooth integrado y amortiguación HOVR.',
        imageType: 'running',
        variants: [
          { size: '39', color: 'black', stock: 8, price: 149.99 },
          { size: '40', color: 'black', stock: 12, price: 149.99 },
          { size: '41', color: 'black', stock: 15, price: 149.99 },
          { size: '42', color: 'black', stock: 20, price: 149.99 },
          { size: '43', color: 'black', stock: 18, price: 149.99 },
          { size: '44', color: 'black', stock: 12, price: 149.99 },
          { size: '45', color: 'black', stock: 8, price: 149.99 }
        ]
      },
      {
        name: 'Under Armour Project Rock 5',
        description: 'Las zapatillas de entrenamiento diseñadas con Dwayne "The Rock" Johnson. Construidas para soportar los entrenamientos más intensos con estabilidad superior. La suela UA TriBase maximiza el contacto con el suelo para mejor tracción.',
        price: 159.99,
        comparePrice: null,
        cost: 80.00,
        brandSlug: 'under-armour',
        categorySlug: 'cross-training',
        userIndex: 1,
        gender: 'MEN',
        colors: ['black', 'blue', 'red'],
        materials: ['Malla resistente', 'UA TriBase', 'Plantilla HOVR', 'Suela Vibram'],
        isActive: true,
        isFeatured: false,
        tags: ['training', 'crossfit', 'project rock', 'intenso', 'gimnasio'],
        seoTitle: 'Under Armour Project Rock 5 - Entrenamiento de Elite | SportShoes',
        seoDescription: 'Entrena como The Rock con Under Armour Project Rock 5. Estabilidad máxima para entrenamientos intensos.',
        imageType: 'training',
        variants: [
          { size: '40', color: 'black', stock: 5, price: 159.99 },
          { size: '41', color: 'black', stock: 10, price: 159.99 },
          { size: '42', color: 'black', stock: 15, price: 159.99 },
          { size: '43', color: 'black', stock: 12, price: 159.99 },
          { size: '44', color: 'black', stock: 8, price: 159.99 },
          { size: '45', color: 'black', stock: 5, price: 159.99 }
        ]
      },
      // REEBOK PRODUCTS
      {
        name: 'Reebok Nano X4',
        description: 'La última evolución de las zapatillas de entrenamiento más versátiles del mercado. Diseñadas para CrossFit y entrenamiento funcional con la tecnología Flexweave que proporciona durabilidad y flexibilidad donde más se necesita.',
        price: 139.99,
        comparePrice: 149.99,
        cost: 70.00,
        brandSlug: 'reebok',
        categorySlug: 'cross-training',
        userIndex: 0,
        gender: 'UNISEX',
        colors: ['black', 'white', 'orange', 'blue'],
        materials: ['Flexweave', 'Floatride Energy', 'Suela de goma', 'Clip de talón'],
        isActive: true,
        isFeatured: true,
        tags: ['training', 'crossfit', 'nano', 'funcional', 'versátil'],
        seoTitle: 'Reebok Nano X4 - Zapatillas CrossFit Elite | SportShoes',
        seoDescription: 'Rinde al máximo con Reebok Nano X4. Las zapatillas oficiales de CrossFit. Tecnología Flexweave.',
        imageType: 'training',
        variants: [
          { size: '37', color: 'black', stock: 10, price: 139.99 },
          { size: '38', color: 'black', stock: 15, price: 139.99 },
          { size: '39', color: 'black', stock: 20, price: 139.99 },
          { size: '40', color: 'black', stock: 25, price: 139.99 },
          { size: '41', color: 'black', stock: 30, price: 139.99 },
          { size: '42', color: 'black', stock: 25, price: 139.99 },
          { size: '43', color: 'black', stock: 20, price: 139.99 },
          { size: '44', color: 'black', stock: 15, price: 139.99 }
        ]
      },
      {
        name: 'Reebok Club C 85 Vintage',
        description: 'Las zapatillas de tenis que se convirtieron en ícono del estilo casual. El diseño minimalista con cuero suave y la suela de goma vulcanizada las hacen perfectas para cualquier ocasión, desde la cancha hasta la calle.',
        price: 84.99,
        comparePrice: 94.99,
        cost: 42.00,
        brandSlug: 'reebok',
        categorySlug: 'lifestyle',
        userIndex: 1,
        gender: 'UNISEX',
        colors: ['white', 'green', 'black', 'chalk'],
        materials: ['Cuero suave', 'Suela de goma', 'Plantilla moldeada', 'Logo vintage'],
        isActive: true,
        isFeatured: false,
        tags: ['lifestyle', 'tennis', 'classic', 'vintage', 'minimalista'],
        seoTitle: 'Reebok Club C 85 Vintage - Estilo Retro | SportShoes',
        seoDescription: 'Las clásicas Reebok Club C 85 Vintage. Estilo minimalista con cuero premium. Un ícono que perdura.',
        imageType: 'lifestyle',
        variants: [
          { size: '36', color: 'white', stock: 25, price: 84.99 },
          { size: '37', color: 'white', stock: 30, price: 84.99 },
          { size: '38', color: 'white', stock: 35, price: 84.99 },
          { size: '39', color: 'white', stock: 40, price: 84.99 },
          { size: '40', color: 'white', stock: 45, price: 84.99 },
          { size: '41', color: 'white', stock: 40, price: 84.99 },
          { size: '42', color: 'white', stock: 35, price: 84.99 },
          { size: '43', color: 'white', stock: 30, price: 84.99 },
          { size: '44', color: 'white', stock: 25, price: 84.99 }
        ]
      }
    ];

    let productCount = 0;
    for (const productData of productsData) {
      const { variants, brandSlug, categorySlug, userIndex, imageType, colors, materials, tags, ...productInfo } = productData;
      
      // Buscar referencias
      const brand = brands.find(b => b.slug === brandSlug);
      const category = allCategories.find(c => c.slug === categorySlug);
      
      if (!brand || !category) {
        console.log(`  ⚠ Saltando ${productInfo.name}: marca o categoría no encontrada`);
        continue;
      }

      // Generar slug y SKU únicos
      const slug = productInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const sku = `${brand.slug.substring(0, 3).toUpperCase()}-${category.slug.substring(0, 3).toUpperCase()}-${String(productCount + 1).padStart(4, '0')}`;
      
      // Verificar si ya existe
      const exists = await prisma.product.findUnique({ where: { sku } });
      if (exists) {
        console.log(`  ⚠ ${productInfo.name} ya existe, saltando...`);
        continue;
      }

      // Crear producto con variantes e imágenes
      const product = await prisma.product.create({
        data: {
          ...productInfo,
          sku,
          slug,
          brandId: brand.id,
          categoryId: category.id,
          userId: users[userIndex].id,
          colors: JSON.stringify(colors),
          materials: JSON.stringify(materials),
          tags: JSON.stringify(tags),
          variants: {
            create: variants.map(v => ({
              sku: `${sku}-${v.size}-${v.color}`,
              size: v.size,
              color: v.color,
              colorName: COLOR_NAMES[v.color] || v.color,
              stock: v.stock,
              price: v.price
            }))
          },
          images: {
            create: (IMAGE_PLACEHOLDERS[imageType] || IMAGE_PLACEHOLDERS.running)
              .map((url, index) => ({
                url,
                altText: `${productInfo.name} - Vista ${index + 1}`,
                position: index,
                isMain: index === 0
              }))
          }
        }
      });
      
      productCount++;
      console.log(`  ✓ ${product.name} (${variants.length} variantes, ${(IMAGE_PLACEHOLDERS[imageType] || IMAGE_PLACEHOLDERS.running).length} imágenes)`);
    }
    console.log(`✅ ${productCount} productos creados\n`);

    // 5. Crear reseñas
    console.log('⭐ Creando reseñas...');
    const allProducts = await prisma.product.findMany({ take: 8 });
    
    const reviewsData = [
      { rating: 5, title: '¡Excelentes zapatillas!', comment: 'Las compré para mi entrenamiento diario y no me arrepiento. La amortiguación es increíble y se sienten muy livianas. Las recomiendo totalmente.', userName: 'Carlos M.', userEmail: 'carlos@email.com', isVerified: true },
      { rating: 4, title: 'Muy buenas', comment: 'La calidad es excelente como siempre. Solo que me quedaron un poco ajustadas. Recomiendo pedir media talla más.', userName: 'Ana L.', userEmail: 'ana@email.com', isVerified: true },
      { rating: 5, title: 'Las mejores para correr', comment: 'Llevo 3 meses usándolas para running y están como nuevas. La amortiguación sigue intacta y el ajuste es perfecto.', userName: 'Pedro R.', userEmail: 'pedro@email.com', isVerified: true },
      { rating: 5, title: 'Estilo y comodidad', comment: 'Las uso para el día a día y son súper cómodas. Además el diseño es precioso, combinan con todo.', userName: 'María G.', userEmail: 'maria@email.com', isVerified: true },
      { rating: 4, title: 'Buena compra', comment: 'Excelente relación calidad-precio. Los materiales se sienten premium y son muy cómodas para caminar.', userName: 'Luis F.', userEmail: 'luis@email.com', isVerified: true },
      { rating: 5, title: 'Increíble rendimiento', comment: 'Las uso para correr maratones y son las mejores que he tenido. Gran retorno de energía.', userName: 'Sofía M.', userEmail: 'sofia@email.com', isVerified: false },
      { rating: 3, title: 'Buenas pero caras', comment: 'Son buenas zapatillas pero por el precio esperaba materiales más premium. Cumplen su función.', userName: 'Diego R.', userEmail: 'diego@email.com', isVerified: true },
      { rating: 5, title: 'Perfectas para el gym', comment: 'Las uso para crossfit y entrenamiento funcional. Excelente estabilidad y agarre.', userName: 'Valentina S.', userEmail: 'valentina@email.com', isVerified: true }
    ];

    let reviewCount = 0;
    for (const product of allProducts) {
      const numReviews = Math.floor(Math.random() * 3) + 2; // 2-4 reseñas
      
      for (let i = 0; i < numReviews; i++) {
        const reviewData = reviewsData[reviewCount % reviewsData.length];
        
        await prisma.review.create({
          data: {
            ...reviewData,
            productId: product.id,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        });
        
        reviewCount++;
      }
    }
    console.log(`✅ ${reviewCount} reseñas creadas\n`);

    // 6. Crear cupones
    console.log('🎟️  Creando cupones de descuento...');
    
    const couponsData = [
      {
        code: 'BIENVENIDO15',
        discount: 15,
        type: 'PERCENTAGE',
        minPurchase: 80.00,
        maxUses: 100,
        currentUses: 23,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true
      },
      {
        code: 'VERANO20',
        discount: 20,
        type: 'PERCENTAGE',
        minPurchase: 100.00,
        maxUses: 50,
        currentUses: 12,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        isActive: true
      },
      {
        code: 'VIP50',
        discount: 50.00,
        type: 'FIXED_AMOUNT',
        minPurchase: 200.00,
        maxUses: 20,
        currentUses: 5,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        isActive: true
      },
      {
        code: 'BLACKFRIDAY40',
        discount: 40,
        type: 'PERCENTAGE',
        minPurchase: 120.00,
        maxUses: 500,
        currentUses: 0,
        startDate: new Date('2024-11-25'),
        endDate: new Date('2024-11-30'),
        isActive: false
      },
      {
        code: 'NAVIDAD25',
        discount: 25,
        type: 'PERCENTAGE',
        minPurchase: 150.00,
        maxUses: 200,
        currentUses: 0,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        isActive: false
      }
    ];

    for (const couponData of couponsData) {
      await prisma.coupon.create({ data: couponData });
      console.log(`  ✓ ${couponData.code} - ${couponData.discount}${couponData.type === 'PERCENTAGE' ? '%' : '$'} ${couponData.isActive ? '🟢' : '🔴'}`);
    }
    console.log(`✅ ${couponsData.length} cupones creados\n`);

    // Resumen final
    console.log('=' .repeat(50));
    console.log('✨ SEED COMPLETADO EXITOSAMENTE ✨');
    console.log('='.repeat(50));
    console.log('\n📊 Resumen de datos creados:');
    console.log(`  👤 ${users.length} usuarios administradores`);
    console.log(`  🏷️  ${brands.length} marcas`);
    console.log(`  📁 ${allCategories.length} categorías`);
    console.log(`  👟 ${productCount} productos`);
    console.log(`  ⭐ ${reviewCount} reseñas`);
    console.log(`  🎟️  ${couponsData.length} cupones`);
    
    console.log('\n🔑 Credenciales de acceso:');
    console.log('  Admin: admin@sportshoes.com');
    console.log('  Gestor: gestion@sportshoes.com');
    console.log('  Contraseña: Admin123!');
    
    console.log('\n📦 Comandos útiles:');
    console.log('  npm run db:studio  - Ver datos en interfaz visual');
    console.log('  npm run dev        - Iniciar servidor de desarrollo');
    console.log('  npm run db:reset   - Reiniciar base de datos');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
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