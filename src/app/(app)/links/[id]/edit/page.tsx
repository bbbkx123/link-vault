import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteLinkAction, updateLinkAction } from "@/actions/links";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@/components/icons";
import { LinkForm } from "@/components/link-form";
import {
  formatLongDate,
  getDomain,
  siteInitial,
  toneFor,
} from "@/lib/format";
import { linkCardSelect } from "@/lib/link-queries";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { idSchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "编辑收藏",
};

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const paramsValue = await params;
  const parsedId = idSchema.safeParse(paramsValue.id);

  if (!parsedId.success) {
    notFound();
  }

  const link = await prisma.link.findFirst({
    where: { id: parsedId.data, userId: user.id },
    select: linkCardSelect,
  });

  if (!link) {
    notFound();
  }

  const domain = getDomain(link.url);
  const initialTags = link.tags.map((entry) => entry.tag.name).join(", ");

  return (
    <div className="container container--narrow">
      <Link href="/dashboard" className="back-link">
        <ArrowLeftIcon size={15} />
        返回收藏夹
      </Link>

      <header className="page-heading page-heading--compact">
        <div>
          <p className="eyebrow">EDIT LINK</p>
          <h1>编辑收藏</h1>
          <p>修改标题、标签或备注，链接本身也可以替换。</p>
        </div>
      </header>

      <div className="edit-card">
        <div className="edit-source">
          <span
            className={`site-mark tone-${toneFor(domain)}`}
            aria-hidden="true"
          >
            {siteInitial(link.url)}
          </span>
          <div className="edit-source-copy">
            <span>{domain}</span>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.url}
              <ArrowUpRightIcon size={12} />
            </a>
          </div>
          <time
            className="edit-date"
            dateTime={link.createdAt.toISOString()}
          >
            收藏于 {formatLongDate(link.createdAt)}
          </time>
        </div>

        <LinkForm
          action={updateLinkAction.bind(null, link.id)}
          initialValues={{
            url: link.url,
            title: link.title,
            description: link.description ?? "",
            tags: initialTags,
          }}
          submitLabel="保存修改"
          footnote="保存后，公开主页上的内容也会同步更新。"
        />
      </div>

      <div className="edit-danger">
        <div>
          <strong>删除这条收藏</strong>
          <p>删除后无法恢复，关联的标签会保留给其他收藏使用。</p>
        </div>
        <form action={deleteLinkAction}>
          <input type="hidden" name="linkId" value={link.id} />
          <ConfirmSubmit
            className="btn btn-danger-ghost btn-sm"
            confirmMessage={`确定删除「${link.title}」吗？此操作不可撤销。`}
          >
            删除收藏
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
