import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const demoPassword = await bcrypt.hash('password123', 10);

  const tenants = [
    {
      slug: 'demo',
      name: 'Demo Business',
      plan: 'free',
      themeConfig: { theme: 'modern', primary_color: '#0070f3', hero_title: 'Welcome to Demo', hero_subtitle: 'Quality products' },
      featureOverrides: { accounting_module: false },
      ownerEmail: 'demo@example.com',
      ownerName: 'Demo Admin',
      products: [
        { name: 'Nepali Tea', price: 250, stock: 100 },
        { name: 'Handmade Pashmina', price: 1200, stock: 50 },
        { name: 'Bamboo Crafts', price: 450, stock: 30 },
      ],
    },
    {
      slug: 'classic-shop',
      name: 'Classic Store',
      plan: 'free',
      themeConfig: { theme: 'classic', primary_color: '#8B4513', hero_title: 'Classic Elegance', hero_subtitle: 'Timeless pieces' },
      featureOverrides: { basic_pos: true },
      ownerEmail: 'classic@example.com',
      ownerName: 'Classic Owner',
      products: [
        { name: 'Wooden Furniture', price: 5000, stock: 20 },
        { name: 'Antique Vases', price: 1200, stock: 15 },
      ],
    },
  ];

  for (const data of tenants) {
    const { products, ownerEmail, ownerName, ...tenantData } = data;

    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantData.slug },
      update: tenantData,
      create: tenantData,
    });

    const user = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {
        name: ownerName,
        tenantId: tenant.id,
        role: 'admin',
        password: demoPassword,
      },
      create: {
        email: ownerEmail,
        name: ownerName,
        password: demoPassword,
        role: 'admin',
        tenantId: tenant.id,
      },
    });

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { ownerId: user.id },
    });

    // Create products
    for (const p of products) {
      await prisma.product.upsert({
        where: { id: `${tenant.slug}-${p.name}` },
        update: p,
        create: {
          ...p,
          tenantId: tenant.id,
          id: `${tenant.slug}-${p.name}`,
        },
      });
    }

    console.log(`✅ Tenant: ${tenant.name} (${tenant.slug}) with ${products.length} products`);
  }

  console.log('🌱 Seed complete!');
  console.log('📝 Login credentials:');
  console.log('   demo@example.com / password123');
  console.log('   classic@example.com / password123');
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
