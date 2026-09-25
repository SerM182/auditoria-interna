"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Faltan datos." };
  }

  // Verificar si es el primer login del ADMIN absoluto, lo creamos si no existe
  if (email === "sgiaubasa@gmail.com") {
    const adminExists = await prisma.usuario.findUnique({ where: { email } });
    if (!adminExists) {
      await prisma.usuario.create({
        data: {
          email: "sgiaubasa@gmail.com",
          passwordHash: hashPassword("admin123"), // Contraseña por defecto si no existía
          role: "admin",
          mustChangePassword: true,
        },
      });
    }
  }

  const user = await prisma.usuario.findUnique({ where: { email } });

  if (!user) {
    return { success: false, error: "Usuario no encontrado." };
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: "Contraseña incorrecta." };
  }

  // Guardamos datos en cookie
  const sessionData = {
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };

  const cookieStore = await cookies();
  cookieStore.set("auth_user", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
  });

  return { success: true, mustChangePassword: user.mustChangePassword };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_user");
  redirect("/login");
}

export async function changePasswordAction(formData: FormData) {
  const newPassword = formData.get("newPassword")?.toString();
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_user")?.value;

  if (!newPassword || !authCookie) {
    return { success: false, error: "Faltan datos." };
  }

  const sessionData = JSON.parse(authCookie);

  await prisma.usuario.update({
    where: { id: sessionData.id },
    data: {
      passwordHash: hashPassword(newPassword),
      mustChangePassword: false,
    },
  });

  sessionData.mustChangePassword = false;
  cookieStore.set("auth_user", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

// === ADMIN ACTIONS ===

async function checkAdmin() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_user")?.value;
  if (!authCookie) return false;
  try {
    const session = JSON.parse(authCookie);
    return session.role === "admin";
  } catch {
    return false;
  }
}

export async function getUsersAction() {
  if (!(await checkAdmin())) return { success: false, error: "No autorizado" };
  const users = await prisma.usuario.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, role: true, mustChangePassword: true, createdAt: true }
  });
  return { success: true, users };
}

export async function createUserAction(formData: FormData) {
  if (!(await checkAdmin())) return { success: false, error: "No autorizado" };
  
  const email = formData.get("email")?.toString();
  const role = formData.get("role")?.toString();
  const password = formData.get("password")?.toString() || "aubasa123";

  if (!email || !role) return { success: false, error: "Faltan datos" };

  try {
    await prisma.usuario.create({
      data: {
        email,
        role,
        passwordHash: hashPassword(password),
        mustChangePassword: true,
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "El correo ya existe o hubo un error." };
  }
}

export async function deleteUserAction(id: number) {
  if (!(await checkAdmin())) return { success: false, error: "No autorizado" };
  
  try {
    await prisma.usuario.delete({ where: { id } });
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar" };
  }
}

export async function resetPasswordAction(id: number) {
  if (!(await checkAdmin())) return { success: false, error: "No autorizado" };
  
  try {
    await prisma.usuario.update({
      where: { id },
      data: {
        passwordHash: hashPassword("aubasa123"),
        mustChangePassword: true,
      }
    });
    return { success: true };
  } catch {
    return { success: false, error: "Error al resetear contraseña" };
  }
}
