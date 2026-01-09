"use client";

import React, { useMemo, useState } from "react";
import type { ScheduleRow } from "@/lib/mortgage";
import { formatRub, formatNumber } from "@/lib/format";
import { Button, Badge } from "@/components/ui";

function toCsv(rows: ScheduleRow[]) {
  const header = ["Месяц", "Платёж", "Проценты", "Тело", "Остаток"];
  const lines = [header.join(";")];
  for (const r of rows) {
    lines.push([r.month, r.payment, r.interest, r.principal, r.balance].map(String).join(";"));
  }
  return lines.join("\n");
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ScheduleTable({ rows }: { rows: ScheduleRow[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const sliced = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  const onExport = () => download("mortgage_schedule.csv", toCsv(rows));

  if (!rows.length) return <p className="text-sm text-neutral-600">Нет данных для таблицы.</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge>Строк: {rows.length}</Badge>
          <Badge>Стр: {page}/{pageCount}</Badge>
        </div>
        <Button type="button" data-variant="ghost" onClick={onExport}>Экспорт CSV</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-neutral-50 text-neutral-700">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Месяц</th>
              <th className="px-3 py-2 text-right font-medium">Платёж</th>
              <th className="px-3 py-2 text-right font-medium">Проценты</th>
              <th className="px-3 py-2 text-right font-medium">Тело</th>
              <th className="px-3 py-2 text-right font-medium">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {sliced.map((r) => (
              <tr key={r.month} className="border-t border-neutral-100">
                <td className="px-3 py-2">{r.month}</td>
                <td className="px-3 py-2 text-right">{formatRub(r.payment)}</td>
                <td className="px-3 py-2 text-right">{formatRub(r.interest)}</td>
                <td className="px-3 py-2 text-right">{formatRub(r.principal)}</td>
                <td className="px-3 py-2 text-right">{formatRub(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" data-variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Назад
        </Button>

        <div className="text-xs text-neutral-600">
          Показано {formatNumber((page - 1) * pageSize + 1, 0)}–{formatNumber(Math.min(page * pageSize, rows.length), 0)}
        </div>

        <Button type="button" data-variant="ghost" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
          Вперёд
        </Button>
      </div>
    </div>
  );
}
