import { z } from "zod";

const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "dashboard",
  "help",
  "links",
  "login",
  "logout",
  "new",
  "register",
  "root",
  "settings",
  "share",
  "support",
  "u",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "请输入邮箱")
  .max(254, "邮箱地址太长了")
  .regex(emailPattern, "请输入有效的邮箱地址")
  .transform((value) => value.toLowerCase());

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "主页地址至少需要 3 个字符")
  .max(24, "主页地址最多 24 个字符")
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9_-]*$/,
    "只能使用字母、数字、短横线和下划线，并以字母或数字开头",
  )
  .transform((value) => value.toLowerCase())
  .refine((value) => !RESERVED_USERNAMES.has(value), "这个主页地址已被保留，请换一个");

export const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 位")
  .max(72, "密码最多 72 位")
  .regex(/[A-Za-z]/, "密码需要包含至少一个字母")
  .regex(/[0-9]/, "密码需要包含至少一个数字");

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "昵称至少需要 2 个字符")
      .max(24, "昵称最多 24 个字符"),
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "请输入密码").max(72, "密码最多 72 位"),
  callbackUrl: z.string().trim().max(2048).optional(),
});

export const internalPathSchema = z
  .string()
  .trim()
  .max(2048)
  .regex(/^\/(?!\/)/, "无效的跳转地址");

export const httpUrlSchema = z
  .string()
  .trim()
  .min(1, "请粘贴一个链接")
  .max(2048, "链接最多 2048 个字符")
  .transform((value) =>
    /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value) ? value : `https://${value}`,
  )
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.hostname.includes(".")
      );
    } catch {
      return false;
    }
  }, "请输入有效的 http(s) 链接");

export const tagListSchema = z
  .string()
  .max(240, "标签内容太长了")
  .default("")
  .transform((raw) => {
    const seen = new Set<string>();
    return raw
      .split(/[,，]/)
      .map((tag) =>
        tag
          .trim()
          .replace(/^[#＃]+/, "")
          .replace(/\s+/g, " ")
          .toLowerCase(),
      )
      .filter((tag) => tag.length > 0)
      .filter((tag) => {
        if (seen.has(tag)) return false;
        seen.add(tag);
        return true;
      });
  })
  .refine((tags) => tags.length <= 6, "每一条收藏最多添加 6 个标签")
  .refine(
    (tags) => tags.every((tag) => tag.length <= 20),
    "单个标签最多 20 个字符",
  );

export const linkInputSchema = z.object({
  url: httpUrlSchema,
  title: z.string().trim().max(80, "标题最多 80 个字符").default(""),
  description: z
    .string()
    .trim()
    .max(240, "备注最多 240 个字符")
    .default(""),
  tags: tagListSchema,
});

export const browseQuerySchema = z.object({
  q: z.string().trim().max(80, "搜索词最多 80 个字符").catch("").default(""),
  tag: z
    .string()
    .trim()
    .max(24)
    .catch("")
    .default("")
    .transform((value) => value.toLowerCase()),
  page: z.coerce.number().int().min(1).max(100000).catch(1).default(1),
});

export const idSchema = z
  .string()
  .trim()
  .min(1, "缺少记录标识")
  .max(64, "无效的记录标识")
  .regex(/^[a-z0-9]+$/i, "无效的记录标识");

export const shareVisibilitySchema = z.object({
  isPublic: z.enum(["true", "false"]),
});

export const adminRoleSchema = z.object({
  userId: idSchema,
  role: z.enum(["USER", "ADMIN"]),
});

export const noticeSchema = z.string().max(40).catch("");

export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = typeof issue.path[0] === "string" ? issue.path[0] : "form";
    errors[key] ??= [];
    if (!errors[key].includes(issue.message)) {
      errors[key].push(issue.message);
    }
  }

  return errors;
}
