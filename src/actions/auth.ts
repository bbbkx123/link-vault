"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import type { FormState } from "@/lib/action-state";
import { prisma } from "@/lib/prisma";
import {
  fieldErrorsFrom,
  internalPathSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation";

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function registerAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查标出的字段后再试一次。",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: parsed.data.username }],
    },
    select: { email: true, username: true },
  });

  if (existing) {
    const fieldErrors: Record<string, string[]> = {};
    if (existing.email === parsed.data.email) {
      fieldErrors.email = ["这个邮箱已经注册过了，可以直接登录。"];
    }
    if (existing.username === parsed.data.username) {
      fieldErrors.username = ["这个主页地址已经被占用，换一个试试。"];
    }
    return {
      status: "error",
      message: "这个账号暂时不能创建。",
      fieldErrors,
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
        email: parsed.data.email,
        passwordHash,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "邮箱或主页地址刚刚被占用了，请换一个再试。",
      };
    }
    console.error("Failed to create account", error);
    return {
      status: "error",
      message: "注册暂时失败，请稍后重试。",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "账号已创建，但自动登录失败，请前往登录页手动登录。",
      };
    }
    throw error;
  }

  return {
    status: "error",
    message: "账号已创建，请前往登录页登录。",
  };
}

export async function loginAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    callbackUrl: formData.get("callbackUrl") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查邮箱和密码。",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const callbackUrl = parsed.data.callbackUrl;
  const redirectTo =
    callbackUrl && internalPathSchema.safeParse(callbackUrl).success
      ? callbackUrl
      : "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "邮箱或密码不正确，请再试一次。",
      };
    }
    throw error;
  }

  return {
    status: "error",
    message: "登录失败，请稍后重试。",
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
