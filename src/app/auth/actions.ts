"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function signIn(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const returnUrl = (formData.get("returnUrl") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(returnUrl);
}

export async function signUp(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = (formData.get("role") as string) || "staff";
  const department = (formData.get("department") as string) || "";

  if (!email || !password || !fullName) {
    return { error: "Please fill in all required fields." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        department: department,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is enabled, session may be null
  if (data.user && !data.session) {
    return {
      success:
        "Account created! Please check your email to confirm your registration before logging in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await db.query.profiles?.findFirst({
    where: eq(profiles.id, user.id),
  }) ?? (
    await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)
  )[0];

  return {
    user,
    profile,
  };
}
