import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ипотечный калькулятор",
  description: "Аннуитет и дифференцированный платёж, график, подбор условий, экспорт CSV.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen text-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-xs text-neutral-500">
          <p>
            Этот калькулятор считает по стандартным формулам. Это не оферта и не кредитный договор — итоговые условия
            зависят от банка, страховок и дополнительных комиссий.
          </p>
        </footer>
      </body>
    </html>
  );
}
