"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const VALID_USERS = [
  "maria.ferraris@aubasa.com.ar",
  "german.brullo@aubasa.com.ar",
  "sgiaubasa@gmail.com",
];

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  // Para esta demostración, la contraseña para todos será "aubasa123"
  // (En producción debería validarse contra una base de datos)
  if (email && VALID_USERS.includes(email) && password === "aubasa123") {
    cookies().set("auth_user", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Correo o contraseña incorrectos." };
}

export async function logoutAction() {
  cookies().delete("auth_user");
  redirect("/login");
}
