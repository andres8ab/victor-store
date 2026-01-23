/**
 * Script para crear un usuario administrador
 * 
 * Uso:
 * 1. Asegúrate de tener DATABASE_URL en .env.local
 * 2. Ejecuta: npx tsx scripts/create-admin.ts
 * 
 * O desde la consola de Node:
 * npx tsx -e "import('./scripts/create-admin.ts')"
 */

import * as dotenv from "dotenv";
import { createAdminUser } from "../src/lib/actions/admin/create-admin";

dotenv.config({ path: ".env.local" });

async function main() {
  const email = process.argv[2] || "admin@example.com";
  const password = process.argv[3] || "admin123456";
  const name = process.argv[4] || "Administrador";

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL no está configurado en .env.local");
    process.exit(1);
  }

  try {
    console.log(`📝 Creando usuario administrador...`);
    console.log(`   Email: ${email}`);
    console.log(`   Nombre: ${name}`);

    const result = await createAdminUser(email, password, name);

    console.log(`✅ ${result.message}`);
    console.log(`\n🔐 Ahora puedes iniciar sesión con:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`\n🌐 Accede al panel en: http://localhost:3000/admin`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("already exists")) {
      console.log("\n💡 El usuario ya existe. Puedes hacerlo admin con:");
      console.log(`   npx tsx scripts/make-admin.ts ${email}`);
    }
    process.exit(1);
  }
}

main();
