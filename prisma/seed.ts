import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

// Local development gets predictable demo credentials. For a shared or
// production database, always override these with strong values.
const adminPassword =
  process.env.SEED_ADMIN_PASSWORD?.trim() || "Admin12345";
const demoPassword = process.env.SEED_DEMO_PASSWORD?.trim() || "Demo12345";

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_DEMO_PASSWORD)
) {
  console.warn(
    "Warning: seeding with demo passwords. Set SEED_ADMIN_PASSWORD and SEED_DEMO_PASSWORD for shared environments.",
  );
}

type SeedLink = {
  url: string;
  title: string;
  description: string;
  tags: string[];
};

type SeedUser = {
  name: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  isPublic: boolean;
  links: SeedLink[];
};

const users: SeedUser[] = [
  {
    name: "拾链管理员",
    email: "admin@linkvault.dev",
    username: "curator",
    password: adminPassword,
    role: Role.ADMIN,
    isPublic: false,
    links: [
      {
        url: "https://linear.app/method",
        title: "Linear 的产品构建方法",
        description: "一份关于如何做产品、排优先级和保持团队节奏的公开手册。",
        tags: ["产品", "阅读"],
      },
      {
        url: "https://www.are.na",
        title: "Are.na：把网络收成灵感花园",
        description: "不按算法推荐，自己动手把图片、链接和想法连成脉络。",
        tags: ["灵感", "工具"],
      },
      {
        url: "https://www.figma.com/community",
        title: "Figma Community",
        description: "设计系统、界面套件和可复用的社区资源，做原型前先来逛逛。",
        tags: ["设计", "灵感"],
      },
    ],
  },
  {
    name: "林墨",
    email: "demo@linkvault.dev",
    username: "demo",
    password: demoPassword,
    role: Role.USER,
    isPublic: true,
    links: [
      {
        url: "https://nextjs.org/docs",
        title: "Next.js 官方文档",
        description: "App Router、Server Actions 与缓存机制的权威参考，常读常新。",
        tags: ["开发", "文档"],
      },
      {
        url: "https://www.prisma.io/docs",
        title: "Prisma 数据建模文档",
        description: "从 schema、关系到 migration，把 PostgreSQL 管理得井井有条。",
        tags: ["开发", "数据库"],
      },
      {
        url: "https://authjs.dev",
        title: "Auth.js 身份验证指南",
        description: "接入登录、会话与适配器的官方文档，Credentials 部分尤其常用。",
        tags: ["开发", "鉴权"],
      },
      {
        url: "https://developer.mozilla.org/zh-CN/",
        title: "MDN Web 文档",
        description: "前端问题想不起来的时候，最可靠的那一本说明书。",
        tags: ["开发", "文档"],
      },
      {
        url: "https://tailwindcss.com/docs",
        title: "Tailwind CSS 文档",
        description: "工具类速查与设计令牌参考，写界面时的第二块屏幕。",
        tags: ["设计", "开发"],
      },
      {
        url: "https://www.nngroup.com/articles/",
        title: "Nielsen Norman Group",
        description: "可用性研究与交互设计文章，适合在质疑自己的设计时重读。",
        tags: ["设计", "阅读"],
      },
      {
        url: "https://www.themarginalian.org",
        title: "The Marginalian",
        description: "关于艺术、科学与生活的长文札记，慢读的快乐。",
        tags: ["阅读", "灵感"],
      },
      {
        url: "https://www.raycast.com",
        title: "Raycast",
        description: "把常用动作、窗口管理和剪贴板历史收进一个快捷启动器。",
        tags: ["工具", "效率"],
      },
      {
        url: "https://news.ycombinator.com",
        title: "Hacker News",
        description: "技术圈的高信号社区，偶尔也会遇到改变工作方式的讨论。",
        tags: ["社区", "阅读"],
      },
    ],
  },
];

async function main() {
  for (const seedUser of users) {
    const passwordHash = await bcrypt.hash(seedUser.password, 12);
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        name: seedUser.name,
        username: seedUser.username,
        passwordHash,
        role: seedUser.role,
        isPublic: seedUser.isPublic,
      },
      create: {
        name: seedUser.name,
        email: seedUser.email,
        username: seedUser.username,
        passwordHash,
        role: seedUser.role,
        isPublic: seedUser.isPublic,
        emailVerified: new Date(),
      },
    });

    // Make the sample collection deterministic when the seed runs repeatedly.
    await prisma.link.deleteMany({ where: { userId: user.id } });
    await prisma.tag.deleteMany({ where: { userId: user.id } });

    for (const [index, link] of seedUser.links.entries()) {
      await prisma.link.create({
        data: {
          userId: user.id,
          url: link.url,
          title: link.title,
          description: link.description,
          createdAt: new Date(Date.now() - index * DAY - 60 * 60 * 1000),
          tags: {
            create: link.tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { userId_name: { userId: user.id, name } },
                  create: { name, userId: user.id },
                },
              },
            })),
          },
        },
      });
    }

    console.log(
      `Seeded ${seedUser.role.toLowerCase()} ${seedUser.email} with ${seedUser.links.length} links`,
    );
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
