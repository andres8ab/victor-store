"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

/**
 * Crea un usuario administrador
 * 
 * Uso:
 * 1. Primero crea el usuario normalmente con signUp
 * 2. Luego ejecuta esta función pasando el email del usuario
 * 
 * Ejemplo desde la consola de Node:
 * ```ts
 * import { makeUserAdmin } from "@/lib/actions/admin/create-admin";
 * await makeUserAdmin("admin@example.com");
 * ```
 */
export async function makeUserAdmin(email: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user[0]) {
      throw new Error(`Usuario con email ${email} no encontrado`);
    }

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, email));

    return { success: true, message: `Usuario ${email} ahora es administrador` };
  } catch (error) {
    console.error("Error making user admin:", error);
    throw error;
  }
}

/**
 * Crea un usuario administrador directamente (sin necesidad de signUp previo)
 * Útil para el primer setup
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string
) {
  try {
    // Primero crear el usuario con better-auth
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!res.user?.id) {
      throw new Error("Error al crear el usuario");
    }

    // Luego actualizar el rol a admin
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, res.user.id));

    return {
      success: true,
      message: `Usuario administrador ${email} creado exitosamente`,
      userId: res.user.id,
    };
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}
