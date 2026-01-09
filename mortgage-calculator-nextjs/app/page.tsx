"use client";

import React, { useMemo, useState } from "react";
import { Card, Input, Label, Select, Hint, Hr, Button, Badge } from "@/components/ui";
import {
  annuityPayment,
  annuitySchedule,
  differentiatedSchedule,
  maxPrincipalByPayment,
  neededAprForPayment,
  neededYearsForPayment,
  sumSchedule,
  PaymentType,
} from "@/lib/mortgage";
import { clamp, formatNumber, formatPercent, formatRub } from "@/lib/format";
import ScheduleTable from "@/components/ScheduleTable";

type FormState = {
  principal: number;
  apr: number;
  years: number;
  type: PaymentType;
  maxYearsCap: number;
  targetPayment: number;
};

function num(v: any, fallback: number) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

export default function Page() {
  const [s, setS] = useState<FormState>({
    principal: 4_800_000,
    apr: 13.5,
    years: 25,
    type: "annuity",
    maxYearsCap: 30,
    targetPayment: 40_000,
  });

  const years = clamp(s.years, 1, 50);
  const maxYearsCap = clamp(s.maxYearsCap, 5, 50);

  const annPay = useMemo(() => annuityPayment(s.principal, s.apr, years), [s.principal, s.apr, years]);

  const schedule = useMemo(() => {
    return s.type === "annuity"
      ? annuitySchedule(s.principal, s.apr, years)
      : differentiatedSchedule(s.principal, s.apr, years);
  }, [s.principal, s.apr, years, s.type]);

  const totals = useMemo(() => sumSchedule(schedule), [schedule]);

  const diffStats = useMemo(() => {
    if (s.type !== "differentiated" || schedule.length === 0) return null;
    const first = schedule[0].payment;
    const last = schedule[schedule.length - 1].payment;
    const avg = totals.totalPayment / Math.max(1, totals.months);
    return { first, last, avg };
  }, [s.type, schedule, totals]);

  const fit = useMemo(() => {
    const target = s.targetPayment;
    const capYears = maxYearsCap;

    const maxP = maxPrincipalByPayment(target, s.apr, capYears);
    const needApr = neededAprForPayment(s.principal, capYears, target);
    const needYears = neededYearsForPayment(s.principal, s.apr, target, capYears);

    return { maxP, needApr, needYears, capYears, target };
  }, [s.targetPayment, s.apr, s.principal, maxYearsCap]);

  const warnings = useMemo(() => {
    const out: string[] = [];
    if (s.principal <= 0) out.push("Сумма кредита должна быть больше нуля.");
    if (s.apr < 0 || s.apr > 60) out.push("Ставка выглядит необычно. Проверь значение.");
    if (years > 30) out.push("Срок больше 30 лет: часто банки РФ ограничивают ипотеку примерно 30 годами.");
    return out;
  }, [s.principal, s.apr, years]);

  const resetToExample = () => {
    setS({
      principal: 4_800_000,
      apr: 13.5,
      years: 25,
      type: "annuity",
      maxYearsCap: 30,
      targetPayment: 40_000,
    });
  };

  return (
    <main className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Ипотечный калькулятор</h1>
          <p className="mt-1 text-sm text-neutral-600">Аннуитет и дифференцированный платёж, таблица, подбор условий.</p>
        </div>
        <Button type="button" data-variant="ghost" onClick={resetToExample}>Сбросить пример</Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Вводные">
          <div className="grid gap-3">
            <div>
              <Label>Сумма кредита, ₽</Label>
              <Input
                inputMode="numeric"
                value={String(s.principal)}
                onChange={(e) => setS((p) => ({ ...p, principal: Math.max(0, num(e.target.value, p.principal)) }))}
              />
              <Hint>Тело кредита (сумма к погашению).</Hint>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ставка, % годовых</Label>
                <Input
                  inputMode="decimal"
                  value={String(s.apr)}
                  onChange={(e) => setS((p) => ({ ...p, apr: num(e.target.value, p.apr) }))}
                />
              </div>
              <div>
                <Label>Срок, лет</Label>
                <Input
                  inputMode="numeric"
                  value={String(s.years)}
                  onChange={(e) => setS((p) => ({ ...p, years: Math.max(1, num(e.target.value, p.years)) }))}
                />
              </div>
            </div>

            <div>
              <Label>Тип платежа</Label>
              <Select value={s.type} onChange={(e) => setS((p) => ({ ...p, type: e.target.value as PaymentType }))}>
                <option value="annuity">Аннуитетный (фиксированный)</option>
                <option value="differentiated">Дифференцированный (убывает)</option>
              </Select>
              <Hint>При дифференцированном платёж в начале выше, затем снижается.</Hint>
            </div>

            {warnings.length ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <ul className="list-disc pl-5">
                  {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Итоги">
          <div className="space-y-3">
            {s.type === "annuity" ? (
              <div>
                <div className="text-sm text-neutral-600">Ежемесячный платёж</div>
                <div className="mt-1 text-2xl font-semibold">{formatRub(annPay)}</div>
                <Hint>Фиксированный платёж на весь срок (если ставка не меняется).</Hint>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-neutral-600">Платёж в 1-й месяц</div>
                  <div className="mt-1 text-2xl font-semibold">{formatRub(diffStats?.first ?? NaN)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Последний: {formatRub(diffStats?.last ?? NaN)}</Badge>
                  <Badge>Средний: {formatRub(diffStats?.avg ?? NaN)}</Badge>
                </div>
                <Hint>Для дифференцированного платёж убывает, ориентируйся на первый/средний.</Hint>
              </div>
            )}

            <Hr />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-neutral-600">Всего выплат</div>
                <div className="mt-1 text-base font-semibold">{formatRub(totals.totalPayment)}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">Переплата</div>
                <div className="mt-1 text-base font-semibold">{formatRub(totals.totalInterest)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-neutral-600">Срок, мес.</div>
                <div className="mt-1 text-base font-semibold">{formatNumber(totals.months, 0)}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">Ставка</div>
                <div className="mt-1 text-base font-semibold">{formatPercent(s.apr)}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Подбор условий (аннуитет, лимит по сроку)">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Целевой платёж, ₽/мес</Label>
                <Input
                  inputMode="numeric"
                  value={String(s.targetPayment)}
                  onChange={(e) => setS((p) => ({ ...p, targetPayment: Math.max(0, num(e.target.value, p.targetPayment)) }))}
                />
                <Hint>Ниже процентов 1-го месяца — решения нет.</Hint>
              </div>
              <div>
                <Label>Макс. срок, лет</Label>
                <Input
                  inputMode="numeric"
                  value={String(s.maxYearsCap)}
                  onChange={(e) => setS((p) => ({ ...p, maxYearsCap: Math.max(5, num(e.target.value, p.maxYearsCap)) }))}
                />
                <Hint>По умолчанию 30.</Hint>
              </div>
            </div>

            <Hr />

            <div className="space-y-2">
              <div className="text-sm text-neutral-700">
                Максимальная сумма под платёж <b>{formatRub(fit.target)}</b> при ставке <b>{formatPercent(s.apr)}</b> и сроке <b>{fit.capYears} лет</b>:
              </div>
              <div className="text-lg font-semibold">{formatRub(fit.maxP)}</div>
            </div>

            <Hr />

            <div className="space-y-2">
              <div className="text-sm text-neutral-700">
                Нужная ставка для суммы <b>{formatRub(s.principal)}</b> и срока <b>{fit.capYears} лет</b> при платеже <b>{formatRub(fit.target)}</b>:
              </div>
              <div className="text-lg font-semibold">{fit.needApr === null ? "Нет решения" : formatPercent(fit.needApr)}</div>
            </div>

            <Hr />

            <div className="space-y-2">
              <div className="text-sm text-neutral-700">
                Нужный срок для суммы <b>{formatRub(s.principal)}</b> и ставки <b>{formatPercent(s.apr)}</b> при платеже <b>{formatRub(fit.target)}</b> (≤ {fit.capYears} лет):
              </div>
              <div className="text-lg font-semibold">
                {fit.needYears === null ? "Нет решения" : `${formatNumber(fit.needYears, 2)} лет`}
              </div>
              <Hint>
                Если “нет решения”, обычно причина одна: платёж меньше процентов первого месяца, и кредит не гасится.
              </Hint>
            </div>
          </div>
        </Card>
      </div>

      <Card title="График платежей (амортизация)">
        <ScheduleTable rows={schedule} />
      </Card>
    </main>
  );
}
