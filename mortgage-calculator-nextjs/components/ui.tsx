import React from "react";

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      {title ? <h2 className="mb-3 text-base font-semibold text-neutral-900">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-neutral-800">{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none " +
        "focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 " +
        (props.className ?? "")
      }
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none " +
        "focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 " +
        (props.className ?? "")
      }
    />
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variant = (props as any)["data-variant"] as "primary" | "ghost" | undefined;
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition border outline-none focus:ring-2 focus:ring-neutral-200";
  const cls =
    variant === "ghost"
      ? base + " border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
      : base + " border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50";
  return <button {...props} className={cls + " " + (props.className ?? "")} />;
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-neutral-600">{children}</p>;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs text-neutral-700">
      {children}
    </span>
  );
}

export function Hr() {
  return <div className="my-3 h-px w-full bg-neutral-100" />;
}
