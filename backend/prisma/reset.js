// backend/prisma/reset.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function reset() {
  console.log('🗑️  Eliminando base de datos...');
  
  try {
    // Eliminar todos los registros en orden
    await prisma.review.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Base de datos limpiada exitosamente');
    
    // Opcional: eliminar el archivo físico
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Archivo dev.db eliminado');
    }
    
    const journalPath = path.join(process.cwd(), 'prisma', 'dev.db-journal');
    if (fs.existsSync(journalPath)) {
      fs.unlinkSync(journalPath);
      console.log('✅ Archivo dev.db-journal eliminado');
    }
    
  } catch (error) {
    console.error('❌ Error al resetear:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();