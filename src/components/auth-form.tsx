"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";

import { loginAction, registerAction } from "@/actions/auth";
import { initialFormState } from "@/lib/action-state";

type AuthFormProps = {
  mode: "login" | "register";
  callbackUrl?: string;
};

type Values = {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const emptyValues: Values = {
  name: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function AuthForm({ mode, callbackUrl }: AuthFormProps) {
  const isRegister = mode === "register";
  const [values, setValues] = useState<Values>(emptyValues);
  const [state, formAction, pending] = useActionState(
    isRegister ? registerAction : loginAction,
    initialFormState,
  );
  const id = useId();

  const fieldId = (name: string) => `${id}-${name}`;
  const errorFor = (name: string) => state.fieldErrors?.[name]?.[0];

  function update(name: keyof Values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form action={formAction} className="auth-form" noValidate>
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

      {state.message ? (
        <div className="form-alert" role="alert">
          <span className="form-alert-mark" aria-hidden="true" />
          {state.message}
        </div>
      ) : null}

      {isRegister ? (
        <div className="form-row">
          <div className="field">
            <label htmlFor={fieldId("name")}>昵称</label>
            <input
              id={fieldId("name")}
              name="name"
              type="text"
              autoComplete="name"
              maxLength={24}
              placeholder="怎么称呼你？"
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              aria-invalid={Boolean(errorFor("name")) || undefined}
              aria-describedby={
                errorFor("name") ? fieldId("name-error") : undefined
              }
            />
            {errorFor("name") ? (
              <p className="field-error" id={fieldId("name-error")}>
                {errorFor("name")}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor={fieldId("username")}>主页地址</label>
            <div className="input-with-prefix">
              <span aria-hidden="true">/u/</span>
              <input
                id={fieldId("username")}
                name="username"
                type="text"
                autoComplete="username"
                maxLength={24}
                placeholder="your-name"
                value={values.username}
                onChange={(event) => update("username", event.target.value)}
                aria-invalid={Boolean(errorFor("username")) || undefined}
                aria-describedby={
                  errorFor("username") ? fieldId("username-error") : undefined
                }
              />
            </div>
            {errorFor("username") ? (
              <p className="field-error" id={fieldId("username-error")}>
                {errorFor("username")}
              </p>
            ) : (
              <p className="field-hint">公开分享页会使用这个地址</p>
            )}
          </div>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor={fieldId("email")}>邮箱</label>
        <input
          id={fieldId("email")}
          name="email"
          type="email"
          inputMode="email"
          autoComplete={isRegister ? "email" : "username"}
          maxLength={254}
          placeholder="you@example.com"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={Boolean(errorFor("email")) || undefined}
          aria-describedby={
            errorFor("email") ? fieldId("email-error") : undefined
          }
        />
        {errorFor("email") ? (
          <p className="field-error" id={fieldId("email-error")}>
            {errorFor("email")}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor={fieldId("password")}>密码</label>
        <input
          id={fieldId("password")}
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          maxLength={72}
          placeholder={isRegister ? "至少 8 位，含字母和数字" : "输入你的密码"}
          value={values.password}
          onChange={(event) => update("password", event.target.value)}
          aria-invalid={Boolean(errorFor("password")) || undefined}
          aria-describedby={
            errorFor("password") ? fieldId("password-error") : undefined
          }
        />
        {errorFor("password") ? (
          <p className="field-error" id={fieldId("password-error")}>
            {errorFor("password")}
          </p>
        ) : null}
      </div>

      {isRegister ? (
        <div className="field">
          <label htmlFor={fieldId("confirmPassword")}>确认密码</label>
          <input
            id={fieldId("confirmPassword")}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            maxLength={72}
            placeholder="再输入一次密码"
            value={values.confirmPassword}
            onChange={(event) =>
              update("confirmPassword", event.target.value)
            }
            aria-invalid={Boolean(errorFor("confirmPassword")) || undefined}
            aria-describedby={
              errorFor("confirmPassword")
                ? fieldId("confirmPassword-error")
                : undefined
            }
          />
          {errorFor("confirmPassword") ? (
            <p className="field-error" id={fieldId("confirmPassword-error")}>
              {errorFor("confirmPassword")}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary btn-block auth-submit"
        disabled={pending}
        aria-busy={pending}
      >
        {pending
          ? isRegister
            ? "正在创建…"
            : "正在登录…"
          : isRegister
            ? "创建账号"
            : "登录"}
      </button>

      <p className="auth-switch">
        {isRegister ? (
          <>
            已经有账号了？
            <Link href="/login">直接登录</Link>
          </>
        ) : (
          <>
            还没有账号？
            <Link href="/register">免费创建一个</Link>
          </>
        )}
      </p>
    </form>
  );
}
