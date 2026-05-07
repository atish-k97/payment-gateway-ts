"use client";

import { useState, useCallback } from "react";
import { usePayment } from "@/hooks/usePayment";
import CardPreview from "@/components/CardPreview";
import { formatCardNumber, detectCardType } from "@/utils/cardUtils";
import {
  validateCardNumber,
  validateExpiry,
  validateCvv,
  validateCardholderName,
  validateAmount,
} from "@/utils/validations";
import type { CardType, Currency, PaymentFormState } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormErrors {
  cardholderName: string | undefined;
  cardNumber: string | undefined;
  expiry: string | undefined;
  cvv: string | undefined;
  amount: string | undefined;
}

interface TouchedFields {
  cardholderName: boolean;
  cardNumber: boolean;
  expiry: boolean;
  cvv: boolean;
  amount: boolean;
}

interface CardInputProps {
  form: PaymentFormState;
  setForm: React.Dispatch<React.SetStateAction<PaymentFormState>>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "INR", label: "INR", symbol: "₹" },
  { value: "USD", label: "USD", symbol: "$" },
];

const INITIAL_FORM: PaymentFormState = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: "INR",
};

const INITIAL_ERRORS: FormErrors = {
  cardholderName: undefined,
  cardNumber: undefined,
  expiry: undefined,
  cvv: undefined,
  amount: undefined,
};

const INITIAL_TOUCHED: TouchedFields = {
  cardholderName: false,
  cardNumber: false,
  expiry: false,
  cvv: false,
  amount: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

function isFormValid(errors: FormErrors, form: PaymentFormState): boolean {
  return (
    !errors.cardholderName &&
    !errors.cardNumber &&
    !errors.expiry &&
    !errors.cvv &&
    !errors.amount &&
    form.cardholderName.trim() !== "" &&
    form.cardNumber.trim() !== "" &&
    form.expiry.trim() !== "" &&
    form.cvv.trim() !== "" &&
    form.amount.trim() !== ""
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CardInput({ form, setForm }: CardInputProps) {
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);
  const [touched, setTouched] = useState<TouchedFields>(INITIAL_TOUCHED);
  const [cardType, setCardType] = useState<CardType>("unknown");

  const { status, attemptCount, maxRetries, submitPayment, retry, reset } =
    usePayment();

  const isProcessing = status === "processing";
  const canRetry =
    (status === "failed" || status === "timeout") && attemptCount < maxRetries;

  // ─── Validation ───────────────────────────────────────────────────────────

  const validateField = useCallback(
    (name: keyof FormErrors, value: string): string | undefined => {
      switch (name) {
        case "cardholderName":
          return validateCardholderName(value);
        case "cardNumber":
          return validateCardNumber(value.replace(/\s/g, ""), cardType);
        case "expiry":
          return validateExpiry(value);
        case "cvv":
          return validateCvv(value, cardType);
        case "amount":
          return validateAmount(value);
        default:
          return undefined;
      }
    },
    [cardType],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      let processed = value;

      if (name === "cardNumber") {
        const digits = value.replace(/\D/g, "").slice(0, 16);
        const detected = detectCardType(digits);
        processed = formatCardNumber(digits, detected);
        setCardType(detected);
      }

      if (name === "expiry") {
        processed = formatExpiry(value);
      }

      if (name === "cvv") {
        const maxLen = cardType === "amex" ? 4 : 3;
        processed = value.replace(/\D/g, "").slice(0, maxLen);
      }

      if (name === "amount") {
        processed = value.replace(/[^0-9.]/g, "");
      }

      setForm((prev: PaymentFormState) => ({ ...prev, [name]: processed }));

      if (touched[name as keyof TouchedFields]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name as keyof FormErrors, processed),
        }));
      }
    },
    [touched, validateField, cardType],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof FormErrors, value),
      }));
    },
    [validateField],
  );

  const handleCurrencyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setForm((prev: PaymentFormState) => ({
        ...prev,
        currency: e.target.value as Currency,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Touch all fields and validate
      const allTouched: TouchedFields = {
        cardholderName: true,
        cardNumber: true,
        expiry: true,
        cvv: true,
        amount: true,
      };
      setTouched(allTouched);

      const newErrors: FormErrors = {
        cardholderName: validateField("cardholderName", form.cardholderName),
        cardNumber: validateField("cardNumber", form.cardNumber),
        expiry: validateField("expiry", form.expiry),
        cvv: validateField("cvv", form.cvv),
        amount: validateField("amount", form.amount),
      };
      setErrors(newErrors);

      const hasErrors = Object.values(newErrors).some(Boolean);
      if (hasErrors) return;

      submitPayment(form);
    },
    [form, validateField, submitPayment],
  );

  const handleRetry = useCallback(() => {
    retry(form);
  }, [retry, form]);

  const handleReset = useCallback(() => {
    reset();
    setForm(INITIAL_FORM);
    setErrors(INITIAL_ERRORS);
    setTouched(INITIAL_TOUCHED);
    setCardType("unknown");
  }, [reset]);

  const formValid = isFormValid(errors, form);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="card-input-wrapper">
      {/* Live Card Preview */}
      <CardPreview form={form} cardType={cardType} />

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Payment form"
        className="payment-form"
      >
        {/* Attempt counter */}
        {attemptCount > 0 && (
          <p className="attempt-counter" role="status" aria-live="polite">
            Attempt {attemptCount} of {maxRetries}
          </p>
        )}

        {/* Cardholder Name */}
        <div className="field-group">
          <label htmlFor="cardholderName">Cardholder Name</label>
          <input
            id="cardholderName"
            name="cardholderName"
            type="text"
            value={form.cardholderName}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="cc-name"
            placeholder="John Doe"
            aria-describedby={
              errors.cardholderName ? "cardholderName-error" : undefined
            }
            aria-invalid={!!errors.cardholderName}
            disabled={isProcessing}
          />
          {errors.cardholderName && (
            <span
              id="cardholderName-error"
              className="field-error"
              role="alert"
            >
              {errors.cardholderName}
            </span>
          )}
        </div>

        {/* Card Number */}
        <div className="field-group">
          <label htmlFor="cardNumber">Card Number</label>
          <div className="card-number-wrapper">
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              inputMode="numeric"
              value={form.cardNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              aria-describedby={
                errors.cardNumber ? "cardNumber-error" : undefined
              }
              aria-invalid={!!errors.cardNumber}
              disabled={isProcessing}
            />
            {cardType !== "unknown" && (
              <span
                className={`card-badge card-badge--${cardType}`}
                aria-label={`${cardType} card`}
              >
                {cardType.toUpperCase()}
              </span>
            )}
          </div>
          {errors.cardNumber && (
            <span id="cardNumber-error" className="field-error" role="alert">
              {errors.cardNumber}
            </span>
          )}
        </div>

        {/* Expiry + CVV row */}
        <div className="field-row">
          <div className="field-group">
            <label htmlFor="expiry">Expiry (MM/YY)</label>
            <input
              id="expiry"
              name="expiry"
              type="text"
              inputMode="numeric"
              value={form.expiry}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="cc-exp"
              placeholder="MM/YY"
              maxLength={5}
              aria-describedby={errors.expiry ? "expiry-error" : undefined}
              aria-invalid={!!errors.expiry}
              disabled={isProcessing}
            />
            {errors.expiry && (
              <span id="expiry-error" className="field-error" role="alert">
                {errors.expiry}
              </span>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="cvv">
              CVV{cardType === "amex" ? " (4 digits)" : ""}
            </label>
            <input
              id="cvv"
              name="cvv"
              type="password"
              inputMode="numeric"
              value={form.cvv}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="cc-csc"
              placeholder={cardType === "amex" ? "••••" : "•••"}
              maxLength={cardType === "amex" ? 4 : 3}
              aria-describedby={errors.cvv ? "cvv-error" : undefined}
              aria-invalid={!!errors.cvv}
              disabled={isProcessing}
            />
            {errors.cvv && (
              <span id="cvv-error" className="field-error" role="alert">
                {errors.cvv}
              </span>
            )}
          </div>
        </div>

        {/* Amount + Currency */}
        <div className="field-group">
          <label htmlFor="amount">Amount</label>
          <div className="amount-wrapper">
            <select
              id="currency"
              name="currency"
              value={form.currency}
              onChange={handleCurrencyChange}
              aria-label="Currency"
              disabled={isProcessing}
              className="currency-select"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              id="amount"
              name="amount"
              type="text"
              inputMode="decimal"
              value={form.amount}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0.00"
              aria-describedby={errors.amount ? "amount-error" : undefined}
              aria-invalid={!!errors.amount}
              disabled={isProcessing}
              className="amount-input"
            />
          </div>
          {errors.amount && (
            <span id="amount-error" className="field-error" role="alert">
              {errors.amount}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions">
          {status === "idle" || status === "failed" || status === "timeout" ? (
            <>
              {canRetry ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isProcessing}
                  className="btn btn--primary"
                >
                  Retry Payment
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formValid || isProcessing}
                  className="btn btn--primary"
                  aria-disabled={!formValid || isProcessing}
                >
                  {isProcessing ? "Processing…" : "Pay Now"}
                </button>
              )}

              {(status === "failed" || status === "timeout") && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn--ghost"
                >
                  Start Over
                </button>
              )}
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}
