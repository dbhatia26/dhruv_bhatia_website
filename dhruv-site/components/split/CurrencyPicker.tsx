"use client";

import { Select } from "./ui/Select";

const PRIORITY = ["CAD", "USD", "EUR", "GBP"];
const OTHERS = [
  "AUD", "JPY", "CHF", "CNY", "INR", "MXN", "BRL", "SEK", "NOK", "DKK", "NZD", "SGD", "HKD",
  "KRW", "THB", "VND", "IDR", "MYR", "PHP", "ZAR", "TRY", "PLN", "CZK", "HUF", "ISK", "AED",
  "SAR", "MAD", "COP", "PEN", "CLP", "ARS",
];

interface CurrencyPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/** Common currencies first, per the locked product decision, then everything else. */
export function CurrencyPicker({ value, onChange, label = "Currency" }: CurrencyPickerProps) {
  return (
    <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {PRIORITY.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
      <option disabled>──────────</option>
      {OTHERS.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </Select>
  );
}
