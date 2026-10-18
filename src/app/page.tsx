import Link from "next/link";
import type { Metadata } from "next";

import { auth } from "@/auth";
import {
  ArrowUpRightIcon,
  GlobeIcon,
  ShieldIcon,
  SparkIcon,
  TagIcon,
} from "@/components/icons";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "拾链 LinkVault · 把好链接收成私人图书馆",
};

const featureItems = [
  {
    index: "01",
    title: "收进来，就别再弄丢",
    description:
      "一个链接、一句备注，就足够留下当时为什么心动。网站不会突然消失，你的收藏也不会。",
    icon: <SparkIcon size={20} />,
    tags: ["链接", "备注", "随时回看"],
  },
  {
    index: "02",
    title: "用自己的词，整理自己的网",
    description:
      "设计、开发、稍后读——标签只服务于你。它们既是筛选器，也是你理解世界的方式。",
    icon: <TagIcon size={20} />,
    tags: ["标签", "筛选", "多对多"],
  },
  {
    index: "03",
    title: "想公开时，再公开",
    description:
      "默认只有自己可见。准备好之后，一键开启只读主页，把书架分享给任何拿到链接的人。",
    icon: <GlobeIcon size={20} />,
    tags: ["私密", "公开主页", "权限"],
  },
];

const stageLinks = [
  {
    title: "Figma Community",
    domain: "figma.com",
    tone: "tone-0",
    initial: "F",
  },
  {
    title: "Next.js 官方文档",
    domain: "nextjs.org",
    tone: "tone-2",
    initial: "N",
  },
  {
    title: "The Marginalian",
    domain: "themarginalian.org",
    tone: "tone-4",
    initial: "T",
  },
];

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <div className="landing">
      <SiteHeader
        user={signedIn ? { name: session?.user?.name ?? "朋友" } : null}
      />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              A PRIVATE INDEX OF THE WEB
            </p>
            <h1>
              把散落的好链接，
              <br />
              收成一座<span className="hero-mark">私人图书馆</span>。
            </h1>
            <p className="hero-lead">
              拾链是一个不靠算法推荐的收藏夹。保存、打标签、随时分享——
              让每一次「先存着」都有地方可去。
            </p>

            <div className="hero-actions">
              <Link
                href={signedIn ? "/dashboard" : "/register"}
                className="btn btn-accent btn-lg"
              >
                {signedIn ? "回到我的收藏夹" : "开始收藏"}
                <ArrowUpRightIcon size={16} />
              </Link>
              <a href="#features" className="btn btn-ghost btn-lg">
                了解它如何工作
              </a>
            </div>

            <div className="hero-meta">
              <span>邮箱即账号</span>
              <span>默认私密</span>
              <span>可随时关闭公开</span>
            </div>
          </div>

          <div className="hero-stage" aria-hidden="true">
            <span className="stage-orbit stage-orbit--one" />
            <span className="stage-orbit stage-orbit--two" />
            <div className="stage-card stage-card--back" />

            <div className="stage-card stage-card--main">
              <div className="stage-head">
                <span className="stage-label">MY COLLECTION</span>
                <span className="stage-count">24 LINKS</span>
              </div>
              <h2 className="stage-title">灵感的落脚处</h2>
              <div className="stage-tags">
                <span>设计</span>
                <span>开发</span>
                <span>阅读</span>
              </div>
              <div className="stage-divider" />
              <div className="stage-links">
                {stageLinks.map((link) => (
                  <div className="stage-link-row" key={link.domain}>
                    <span className={`stage-dot ${link.tone}`}>
                      {link.initial}
                    </span>
                    <span className="stage-link-copy">
                      <strong>{link.title}</strong>
                      <span>{link.domain}</span>
                    </span>
                    <ArrowUpRightIcon size={14} />
                  </div>
                ))}
              </div>
              <div className="stage-foot">
                <span>本周新增 3 条</span>
                <span>更新于 2 分钟前</span>
              </div>
            </div>

            <div className="stage-note">
              <span className="stage-note-icon">
                <SparkIcon size={17} />
              </span>
              <div>
                <strong>好链接值得被收好</strong>
                <span>不追热点，只留值得回看的。</span>
              </div>
            </div>

            <div className="stage-badge">
              <span>+</span>
              随手收藏
            </div>
          </div>
        </section>

        <section className="landing-band" id="features">
          <div className="section-intro">
            <div>
              <p className="eyebrow">WHY LINKVAULT</p>
              <h2>
                为「先存着」，
                <br />
                造一个真的会回看的地方。
              </h2>
            </div>
            <p>
              不追求无穷无尽的推荐流。拾链只做三件事：稳稳地存下、用自己的逻辑归类、
              在想分享的时候体面地展示。
            </p>
          </div>

          <div className="feature-grid">
            {featureItems.map((feature) => (
              <article className="feature-card" key={feature.index}>
                <div className="feature-top">
                  <span className="feature-index">{feature.index}</span>
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-tags">
                  {feature.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-closing">
          <div className="closing-inner">
            <div className="closing-mark" aria-hidden="true">
              <ShieldIcon size={24} />
            </div>
            <p className="closing-kicker">BUILT FOR YOUR EYES ONLY</p>
            <blockquote>
              收藏不是囤积，
              <br />
              是为未来的自己<em>留一条回去的路</em>。
            </blockquote>
            <div className="closing-actions">
              <Link
                href={signedIn ? "/dashboard" : "/register"}
                className="btn btn-accent btn-lg"
              >
                {signedIn ? "继续整理" : "建立我的收藏夹"}
                <ArrowUpRightIcon size={16} />
              </Link>
              <span>免费注册 · 隐私默认开启</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} 拾链 LinkVault</span>
        <span className="footer-tech">
          Next.js · Prisma · PostgreSQL · Auth.js
        </span>
      </footer>
    </div>
  );
}
