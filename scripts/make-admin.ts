/**
 * Script para convertir un usuario existente en administrador
 * 
 * Uso:
 * npx tsx scripts/make-admin.ts email@example.com
 */

import * as dotenv from "dotenv";
import { makeUserAdmin } from "../src/lib/actions/admin/create-admin";

dotenv.config({ path: ".env.local" });

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Por favor proporciona un email");
    console.log("Uso: npx tsx scripts/make-admin.ts email@example.com");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL no está configurado en .env.local");
    process.exit(1);
  }

  try {
    console.log(`📝 Convirtiendo ${email} en administrador...`);

    const result = await makeUserAdmin(email);

    console.log(`✅ ${result.message}`);
    console.log(`\n🌐 El usuario ahora puede acceder a: http://localhost:3000/admin`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
