# 拾链 LinkVault

一个带注册登录、标签整理和公开分享页的链接收藏夹。所有写操作都通过
**Server Actions + zod** 完成，服务端再次校验会话、角色和数据归属。

- **默认私密**：收藏夹仅自己可见，公开与否可随时切换。
- **标签整理**：一条收藏可挂多个标签，链接与标签是多对多关系。
- **只读公开主页**：开启后可通过 `/u/你的主页地址` 分享，访客看不到邮箱。
- **管理员后台**：查看用户、收藏与公开主页统计，调整用户角色。
- **JSON 备份**：一键把收藏导出到 Neon Object Storage，再通过 5 分钟有效的签名链接下载。
- **响应式界面**：桌面与手机端都有完整布局。

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Next.js 15（App Router、Turbopack）+ React 19 + TypeScript |
| 数据库 | Neon Postgres（Lakebase Postgres）+ Prisma 6 + migration + seed |
| 对象存储 | Neon Object Storage，S3-compatible，私有 bucket + 预签名下载 |
| 鉴权 | Auth.js v5（Credentials 邮箱密码 + JWT 会话） |
| 校验 | zod 4，所有写操作在 Server Action 内校验 |
| 样式 | Tailwind CSS v4 基础层 + 自定义设计 token |
| 部署 | Vercel（构建时自动 `prisma migrate deploy`） |

## 本地启动

要求：Node.js >= 20.9、pnpm、已登录的 Neon CLI。

本项目已经通过 `neon.ts` / `.neon` 连接到 Neon 的 `production` 分支：

```bash
pnpm install

# 1. 同步 Neon 服务并把 DATABASE_URL、DATABASE_URL_UNPOOLED、AWS_* 写入 .env
neon deploy

# 2. 如 .env 中没有，补上 AUTH_SECRET / AUTH_TRUST_HOST / NEXT_PUBLIC_APP_URL
# AUTH_SECRET 可用 `openssl rand -base64 32` 生成

# 3. 在 Neon 上建表并写入示例数据
pnpm db:deploy
pnpm db:seed

# 4. 启动
pnpm dev
```

打开 <http://localhost:3000>。`neon.ts` 声明了一个私有 bucket `assets`；
`OBJECT_STORAGE_BUCKET` 指向它。若改用独立的本地 PostgreSQL，只需把
`DATABASE_URL` 和 `DATABASE_URL_UNPOOLED` 都指向本地库；对象存储导出功能需要
另外提供对应的 `AWS_*` 与 `OBJECT_STORAGE_BUCKET`。

### 本地示例账号（仅 seed 后存在）

| 角色 | 邮箱 | 密码 | 公开主页 |
| --- | --- | --- | --- |
| 普通用户 | `demo@linkvault.dev` | `Demo12345` | `/u/demo`（已开启） |
| 管理员 | `admin@linkvault.dev` | `Admin12345` | `/u/curator`（未开启） |

登录页仅在 `NODE_ENV=development` 时展示这两组演示账号。seed 密码可以通过
`SEED_ADMIN_PASSWORD` / `SEED_DEMO_PASSWORD` 覆盖。

> 不要在生产环境使用默认演示密码。公开上线时建议不跑 seed，直接注册自己的
> 账号，再把该账号提升为管理员（见部署章节）。

## 常用命令

```bash
pnpm dev            # 开发服务器
pnpm build          # 生产构建
pnpm start          # 运行生产构建
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm db:migrate     # 创建/应用开发迁移
pnpm db:deploy      # 在 CI/生产应用已有迁移
pnpm db:seed        # 写入示例数据
pnpm db:studio      # Prisma Studio
```

## 数据模型

`prisma/schema.prisma` 中核心关系：

```text
User 1 ──── N Link          一个用户拥有多条收藏
User 1 ──── N Tag           标签按用户隔离
Link N ──── N Tag           通过显式 LinkTag 连接表建模
User 1 ──── N Account/Session/VerificationToken（Auth.js 适配器）
```

- `User.username` 唯一，用于 `/u/[username]` 公开主页。
- `User.isPublic` 控制整本收藏夹是否可被公开访问，默认 `false`。
- `Link.userId` 带级联删除，`LinkTag` 对链接和标签都级联。
- `Tag` 通过 `@@unique([userId, name])` 保证同一用户的标签不重复。
- 删除链接后会清理该用户不再被任何链接使用的空标签。

## 路由与权限

| 路由 | 访问规则 |
| --- | --- |
| `/`、`/login`、`/register` | 公开 |
| `/dashboard` | 登录用户，中间件拦截未登录请求 |
| `/links/[id]/edit` | 登录用户，且必须是该链接的所有者 |
| `/admin` | 登录 + 数据库中角色为 `ADMIN` |
| `/u/[username]` | 仅当目标用户开启 `isPublic`；否则 404 |
| `/api/auth/[...nextauth]` | Auth.js 内部路由 |

- `src/middleware.ts` 使用无 Prisma 依赖的 `auth.config.ts` 在边缘运行，
  保护 `/dashboard`、`/links`、`/admin` 的登录态。
- 更细的授权在服务端完成：`requireUser()` / `requireAdmin()` 会重新读取
  PostgreSQL 中的角色，因此管理员被降级后立即失效，不需要等 JWT 过期。
- 链接的编辑、删除、以及标签的写入都以会话用户 `userId` 限定，不能通过修改
  表单里的 ID 越权操作其他用户的数据。
- 公开主页只选择 `id/name/username/createdAt` 等公开字段，不查询或展示邮箱。

## 写操作校验

所有会改变数据的入口都在 `src/actions/*.ts`：

| Action | 校验 |
| --- | --- |
| `registerAction` | 昵称、唯一主页地址、邮箱、密码强度、确认密码 |
| `loginAction` | 邮箱/密码；callbackUrl 仅允许站内路径 |
| `createLinkAction` | 合法 http(s) URL、标题/备注长度、最多 6 个标签 |
| `updateLinkAction` | 同上 + 链接归属校验 |
| `deleteLinkAction` | 记录 ID 格式 + 归属校验 |
| `setShareVisibilityAction` | `isPublic` 仅允许 `"true" / "false"` |
| `updateUserRoleAction` | 管理员身份 + 目标用户 + 角色枚举 + 禁止改自己 |
| `exportCollectionBackupAction` | 登录身份 + zod 校验导出 payload + 私有对象存储 + 预签名下载 |
| `logoutAction` | Auth.js 会话操作 |

搜索和标签筛选是只读 GET 查询，不使用写操作。表单提交都有服务端错误反馈，
没有绕过 zod 的表单写入路径。

## 部署到 Vercel

### 1. 准备 Neon

本仓库的 `neon.ts` 声明了私有 bucket `assets`，并且已经链接了 Neon 项目。
如果一个全新环境还没有 Neon 资源：

```bash
neon link --project-id <project-id> -y
neon deploy
```

部署会创建 bucket，并把这些变量写入 `.env`：

- `DATABASE_URL`：连接池地址（应用运行时）
- `DATABASE_URL_UNPOOLED`：直连地址（Prisma migration）
- `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_ENDPOINT_URL_S3`、`AWS_REGION`
- `OBJECT_STORAGE_BUCKET`：本项目为 `assets`

Neon Object Storage 需要项目位于 `aws-us-east-2`、`aws-us-east-1`、
`aws-eu-central-1` 或 `aws-ap-southeast-1` 等支持的区域。当前项目在 `aws-us-east-2`。

### 2. 推送到 Git 仓库

```bash
git init
git add .
git commit -m "feat: link vault"
git remote add origin <your-repo-url>
git push -u origin main
```

`.env` 已被忽略，`.env.example` 会保留在仓库里。

### 3. 导入 Vercel

在 Vercel 中 **Add New → Project** 导入该仓库，Framework Preset 选择
Next.js。在 Environment Variables 中配置：

| 变量 | 值 |
| --- | --- |
| `DATABASE_URL` | Neon 池化连接串 |
| `DATABASE_URL_UNPOOLED` | Neon 直连连接串（迁移用） |
| `AWS_ACCESS_KEY_ID` | Neon Object Storage 凭据 |
| `AWS_SECRET_ACCESS_KEY` | Neon Object Storage 凭据 |
| `AWS_ENDPOINT_URL_S3` | 当前 branch 的 storage endpoint |
| `AWS_REGION` | 例如 `us-east-2` |
| `OBJECT_STORAGE_BUCKET` | `assets` |
| `AUTH_SECRET` | `openssl rand -base64 32` 生成的随机值 |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_APP_URL` | 部署后的完整地址，如 `https://your-app.vercel.app` |

可以用 `neon env pull --file .env.neon` 导出当前 branch 的值，再复制到
Vercel 的 Environment Variables。不要把 `.env.neon` 或真实的 `AWS_*` 值提交到仓库。

`package.json` 中的 `vercel-build` 会自动执行：

```bash
prisma generate && prisma migrate deploy && next build --turbopack
```

因此第一次部署就会建表，无需本地手动跑迁移。部署完成后注册一个账号，所有
新用户默认都是 `USER`。

### 4. 设置第一位管理员

在 Neon/Supabase 的 SQL Editor 中执行（把邮箱换成你的注册邮箱）：

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

重新进入页面即可在导航中看到「管理后台」。之后可以在后台把其他用户设为管理员。

如果你确实想在生产写示例数据，先设置强密码再显式执行：

```bash
SEED_ADMIN_PASSWORD='一个强密码' \
SEED_DEMO_PASSWORD='另一个强密码' \
pnpm db:seed
```

seed 会重建 demo / admin 两个账号的收藏，不会删除其他注册用户。

### 5. 上线验证

1. 访问 `/register` 注册新账号并自动进入 `/dashboard`；
2. 新增、编辑、删除一条收藏，确认统计和标签同步变化；
3. 打开「开启分享」，访问 `/u/你的主页地址`，退出登录后仍可只读访问；
4. 用管理员账号访问 `/admin`，尝试提升/降级另一个测试账号；
5. 未登录访问 `/dashboard`，确认被重定向到登录页；
6. 在收藏夹点击「导出备份」，确认下载到包含收藏与标签的 JSON 文件。

## 目录速览

```text
src/
  app/
    (auth)/login, register        登录注册
    (app)/dashboard               收藏夹
    (app)/links/[id]/edit         编辑/删除
    (app)/admin                   管理后台
    u/[username]                  公开只读主页
    api/auth/[...nextauth]        Auth.js
  actions/                        auth / links / share / admin / backup Server Actions
  components/                     表单、卡片、筛选、导航等
  lib/
    validation.ts                 zod schema 与字段错误整理
    session.ts                    requireUser / requireAdmin
    link-queries.ts               查询选择器与搜索条件
    prisma.ts                     Prisma 单例
    storage.ts                    Neon Object Storage S3 客户端与预签名
  auth.config.ts                  中间件共用的无 Prisma 配置
  auth.ts                         Credentials Provider + adapter
  middleware.ts                   路由保护
neon.ts                           Neon 服务声明（私有 assets bucket）
prisma/
  schema.prisma                   数据模型
  migrations/                     init migration
  seed.ts                         示例数据
```

## 已知边界与后续演进

- 当前使用邮箱 + 密码，没有邮件验证、找回密码和登录限流；公开产品上线前应补上。
- `isPublic` 是整本收藏夹的开关，不支持单条链接的可见性。
- 公开主页可被搜索引擎索引；如需私密分享链接，可改为带随机 token 的地址。
- 角色存放在数据库中，每次服务端读取都会生效；JWT 中仍保留登录时的角色，
  仅用于会话展示。
- 导出备份会覆盖每个用户在 `assets` bucket 中的同一个对象 key，签名链接
  5 分钟后失效；bucket 保持私有，不会公开暴露备份。
- 迁移在 Vercel 构建阶段执行，适合本项目和免费套餐；多人协作或高可用场景建议
  把 `prisma migrate deploy` 移到独立 CI 发布步骤。
