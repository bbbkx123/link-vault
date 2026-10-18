"use client";

import { useActionState, useId, useState } from "react";

import { initialFormState } from "@/lib/action-state";
import type { FormState } from "@/lib/action-state";
import { CheckIcon, PlusIcon } from "@/components/icons";

type LinkFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  initialValues?: {
    url: string;
    title: string;
    description: string;
    tags: string;
  };
  submitLabel: string;
  footnote?: string;
};

const emptyValues = {
  url: "",
  title: "",
  description: "",
  tags: "",
};

export function LinkForm({
  action,
  initialValues,
  submitLabel,
  footnote = "收藏默认仅自己可见。开启公开主页后，别人才会看到这些内容。",
}: LinkFormProps) {
  const [values, setValues] = useState(initialValues ?? emptyValues);
  const [state, formAction, pending] = useActionState(
    action,
    initialFormState,
  );
  const id = useId();

  const fieldId = (name: string) => `${id}-${name}`;
  const errorFor = (name: string) => state.fieldErrors?.[name]?.[0];

  function update(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={formAction} className="link-form" noValidate>
      {state.message ? (
        <div className="form-alert" role="alert">
          <span className="form-alert-mark" aria-hidden="true" />
          {state.message}
        </div>
      ) : null}

      <div className="form-grid">
        <div className="field field--full">
          <label htmlFor={fieldId("url")}>
            链接地址
            <span className="required-mark" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id={fieldId("url")}
            name="url"
            type="text"
            inputMode="url"
            placeholder="https://example.com/article"
            value={values.url}
            onChange={(event) => update("url", event.target.value)}
            aria-required="true"
            aria-invalid={Boolean(errorFor("url")) || undefined}
            aria-describedby={
              errorFor("url") ? fieldId("url-error") : undefined
            }
          />
          {errorFor("url") ? (
            <p className="field-error" id={fieldId("url-error")}>
              {errorFor("url")}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={fieldId("title")}>标题</label>
          <input
            id={fieldId("title")}
            name="title"
            type="text"
            maxLength={80}
            placeholder="留空时自动使用域名"
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            aria-invalid={Boolean(errorFor("title")) || undefined}
            aria-describedby={
              errorFor("title") ? fieldId("title-error") : undefined
            }
          />
          {errorFor("title") ? (
            <p className="field-error" id={fieldId("title-error")}>
              {errorFor("title")}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={fieldId("tags")}>标签</label>
          <input
            id={fieldId("tags")}
            name="tags"
            type="text"
            maxLength={240}
            placeholder="设计, 开发, 稍后读"
            value={values.tags}
            onChange={(event) => update("tags", event.target.value)}
            aria-invalid={Boolean(errorFor("tags")) || undefined}
            aria-describedby={
              errorFor("tags")
                ? fieldId("tags-error")
                : fieldId("tags-hint")
            }
          />
          {errorFor("tags") ? (
            <p className="field-error" id={fieldId("tags-error")}>
              {errorFor("tags")}
            </p>
          ) : (
            <p className="field-hint" id={fieldId("tags-hint")}>
              用逗号分隔，最多 6 个
            </p>
          )}
        </div>

        <div className="field field--full">
          <div className="field-label-row">
            <label htmlFor={fieldId("description")}>备注</label>
            <span className="field-counter">
              {values.description.length}/240
            </span>
          </div>
          <textarea
            id={fieldId("description")}
            name="description"
            rows={3}
            maxLength={240}
            placeholder="为什么值得留下？一两句话就够了。"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            aria-invalid={Boolean(errorFor("description")) || undefined}
            aria-describedby={
              errorFor("description")
                ? fieldId("description-error")
                : undefined
            }
          />
          {errorFor("description") ? (
            <p className="field-error" id={fieldId("description-error")}>
              {errorFor("description")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="link-form-footer">
        <p>{footnote}</p>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? (
            "保存中…"
          ) : initialValues ? (
            <>
              <CheckIcon size={16} />
              {submitLabel}
            </>
          ) : (
            <>
              <PlusIcon size={16} />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
