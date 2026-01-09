export type PaymentType = "annuity" | "differentiated";

export type ScheduleRow = {
  month: number; // 1..n
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

export function monthlyRate(aprPercent: number): number {
  return aprPercent / 100 / 12;
}

export function annuityPayment(principal: number, aprPercent: number, years: number): number {
  const i = monthlyRate(aprPercent);
  const n = Math.round(years * 12);
  if (!isFinite(principal) || !isFinite(aprPercent) || !isFinite(years) || principal <= 0 || n <= 0) return NaN;
  if (i === 0) return principal / n;
  return principal * (i / (1 - Math.pow(1 + i, -n)));
}

export function annuitySchedule(principal: number, aprPercent: number, years: number): ScheduleRow[] {
  const i = monthlyRate(aprPercent);
  const n = Math.round(years * 12);
  const pay = annuityPayment(principal, aprPercent, years);
  if (!isFinite(pay)) return [];
  let balance = principal;
  const rows: ScheduleRow[] = [];

  for (let m = 1; m <= n; m++) {
    const interest = balance * i;
    const principalPart = Math.max(0, pay - interest);
    balance = Math.max(0, balance - principalPart);

    rows.push({
      month: m,
      payment: pay,
      interest,
      principal: principalPart,
      balance,
    });

    if (balance <= 1e-6) break;
  }

  if (rows.length) rows[rows.length - 1].balance = 0;
  return rows;
}

export function differentiatedSchedule(principal: number, aprPercent: number, years: number): ScheduleRow[] {
  const i = monthlyRate(aprPercent);
  const n = Math.round(years * 12);
  if (!isFinite(principal) || !isFinite(aprPercent) || !isFinite(years) || principal <= 0 || n <= 0) return [];
  const basePrincipal = principal / n;

  let balance = principal;
  const rows: ScheduleRow[] = [];

  for (let m = 1; m <= n; m++) {
    const interest = balance * i;
    const principalPart = Math.min(balance, basePrincipal);
    const payment = interest + principalPart;
    balance = Math.max(0, balance - principalPart);

    rows.push({
      month: m,
      payment,
      interest,
      principal: principalPart,
      balance,
    });

    if (balance <= 1e-6) break;
  }

  if (rows.length) rows[rows.length - 1].balance = 0;
  return rows;
}

export function isSolvableByFixedPayment(principal: number, aprPercent: number, payment: number): boolean {
  const i = monthlyRate(aprPercent);
  return isFinite(i) && isFinite(principal) && isFinite(payment) && principal > 0 && payment > principal * i + 1e-9;
}

export function maxPrincipalByPayment(payment: number, aprPercent: number, years: number): number {
  const i = monthlyRate(aprPercent);
  const n = Math.round(years * 12);
  if (!isFinite(payment) || !isFinite(aprPercent) || !isFinite(years) || payment <= 0 || n <= 0) return NaN;
  if (i === 0) return payment * n;
  return payment * (1 - Math.pow(1 + i, -n)) / i;
}

export function neededAprForPayment(
  principal: number,
  years: number,
  targetPayment: number,
  aprMin = 0,
  aprMax = 60,
  iters = 70
): number | null {
  if (!isFinite(principal) || !isFinite(years) || !isFinite(targetPayment) || principal <= 0 || years <= 0 || targetPayment <= 0) return null;
  if (annuityPayment(principal, 0, years) > targetPayment) return null;

  let lo = aprMin;
  let hi = aprMax;

  for (let k = 0; k < iters; k++) {
    const mid = (lo + hi) / 2;
    const p = annuityPayment(principal, mid, years);
    if (p <= targetPayment) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function neededYearsForPayment(
  principal: number,
  aprPercent: number,
  targetPayment: number,
  maxYears = 30,
  iters = 70
): number | null {
  if (!isFinite(principal) || !isFinite(aprPercent) || !isFinite(targetPayment) || principal <= 0 || targetPayment <= 0) return null;

  if (!isSolvableByFixedPayment(principal, aprPercent, targetPayment)) return null;

  if (annuityPayment(principal, aprPercent, maxYears) > targetPayment) return null;

  let lo = 1 / 12;
  let hi = maxYears;

  for (let k = 0; k < iters; k++) {
    const mid = (lo + hi) / 2;
    const p = annuityPayment(principal, aprPercent, mid);
    if (p <= targetPayment) hi = mid;
    else lo = mid;
  }
  return hi;
}

export function sumSchedule(rows: ScheduleRow[]) {
  const totalPayment = rows.reduce((s, r) => s + r.payment, 0);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPrincipal = rows.reduce((s, r) => s + r.principal, 0);
  return { totalPayment, totalInterest, totalPrincipal, months: rows.length };
}
