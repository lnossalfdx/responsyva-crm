import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function parseCompactValue(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const numeric = Number.parseFloat(normalized.slice(0, -1));
  const suffix = normalized.slice(-1).toLowerCase();

  if (!Number.isFinite(numeric)) {
    return null;
  }

  if (suffix === "k") {
    return numeric * 1_000;
  }

  if (suffix === "m") {
    return numeric * 1_000_000;
  }

  return null;
}

export function expandCompactNumbersInText(text: string) {
  return text
    .replace(/R\$\s*(\d+(?:[.,]\d+)?)\s*([kKmM])/g, (_, rawNumber, rawSuffix) => {
      const fullValue = parseCompactValue(`${rawNumber}${rawSuffix}`);

      if (fullValue === null) {
        return `R$ ${rawNumber}${rawSuffix}`;
      }

      return formatCurrency(Math.round(fullValue));
    })
    .replace(/(^|[\s(])(\d+(?:[.,]\d+)?)\s*([kKmM])(?=[\s).,]|$)/g, (match, prefix, rawNumber, rawSuffix) => {
      const fullValue = parseCompactValue(`${rawNumber}${rawSuffix}`);

      if (fullValue === null) {
        return match;
      }

      return `${prefix}${new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 0,
      }).format(Math.round(fullValue))}`;
    });
}
