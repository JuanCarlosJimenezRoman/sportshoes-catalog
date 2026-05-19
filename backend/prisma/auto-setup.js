// backend/prisma/auto-setup.js
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';

async function setup() {
  console.log('🔧 Configurando base de datos...\n');
  
  const { environment } = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: '¿Qué entorno quieres configurar?',
      choices: [
        { name: 'Desarrollo rápido (SQLite) - Recomendado para empezar', value: 'sqlite' },
        { name: 'Producción (PostgreSQL) - Base de datos profesional', value: 'postgresql' }
      ]
    }
  ]);

  if (environment === 'sqlite') {
    console.log('\n📦 Configurando SQLite...');
    console.log('✅ No necesitas instalar nada adicional\n');
    
    // Configurar .env para SQLite
    const envContent = 'DATABASE_URL="file:./dev.db"\nPORT=3001\n';
    require('fs').writeFileSync('.env', envContent);
    
    console.log('⏳ Creando base de datos...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
  } else {
    console.log('\n🐘 Configurando PostgreSQL...');
    console.log('⚠️  Asegúrate de tener PostgreSQL instalado\n');
    
    const { host, port, user, password, database } = await inquirer.prompt([
      { name: 'host', message: 'Host:', default: 'localhost' },
      { name: 'port', message: 'Puerto:', default: '5432' },
      { name: 'user', message: 'Usuario:', default: 'postgres' },
      { name: 'password', message: 'Contraseña:', type: 'password' },
      { name: 'database', message: 'Base de datos:', default: 'sportshoes' }
    ]);
    
    const dbUrl = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    const envContent = `DATABASE_URL="${dbUrl}"\nPORT=3001\n`;
    require('fs').writeFileSync('.env', envContent);
    
    console.log('\n⏳ Creando base de datos...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  }
  
  // Ejecutar seed
  console.log('\n🌱 Poblando base de datos...');
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  
  console.log('\n✨ ¡Configuración completada!');
  console.log('📊 Puedes ver los datos con: npx prisma studio');
  console.log('🚀 Inicia el servidor con: npm run dev');
}

setup().catch(console.error);