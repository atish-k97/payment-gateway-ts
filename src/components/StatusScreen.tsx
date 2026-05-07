"use client";

import { useEffect, useRef } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { usePayment } from "@/hooks/usePayment";
import type { PaymentFormState, PaymentStatus } from "@/types";

interface StatusScreenProps {
  form: PaymentFormState;
  onReset: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProcessingView() {
  return (
    <div
      className="status-screen status-screen--processing"
      role="status"
      aria-live="polite"
    >
      <div className="status-spinner" aria-hidden="true" />
      <h2 className="status-title">Processing Payment…</h2>
      <p className="status-message">Please do not close this window.</p>
    </div>
  );
}

function SuccessView({ onReset }: { onReset: () => void }) {
  const focusRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  return (
    <div
      className="status-screen status-screen--success"
      role="status"
      aria-live="polite"
    >
      <div className="status-icon status-icon--success" aria-hidden="true">
        ✓
      </div>
      <h2 className="status-title" tabIndex={-1} ref={focusRef}>
        Payment Successful
      </h2>
      <p className="status-message">Your transaction has been completed.</p>
      <button className="btn btn--primary" onClick={onReset}>
        Make Another Payment
      </button>
    </div>
  );
}

function FailedView({
  reason,
  attemptCount,
  maxRetries,
  onRetry,
  onReset,
  form,
}: {
  reason: string | null;
  attemptCount: number;
  maxRetries: number;
  onRetry: (form: PaymentFormState) => void;
  onReset: () => void;
  form: PaymentFormState;
}) {
  const focusRef = useRef<HTMLHeadingElement>(null);
  const canRetry = attemptCount < maxRetries;

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  return (
    <div
      className="status-screen status-screen--failed"
      role="alert"
      aria-live="assertive"
    >
      <div className="status-icon status-icon--failed" aria-hidden="true">
        ✕
      </div>
      <h2 className="status-title" tabIndex={-1} ref={focusRef}>
        Payment Failed
      </h2>
      <p className="status-message">
        {reason ?? "Your payment could not be processed."}
      </p>

      <p className="attempt-counter" aria-live="polite">
        Attempt {attemptCount} of {maxRetries}
      </p>

      <div className="status-actions">
        {canRetry ? (
          <button className="btn btn--primary" onClick={() => onRetry(form)}>
            Retry Payment
          </button>
        ) : (
          <p className="status-message status-message--error">
            Maximum attempts reached. Please try a different card.
          </p>
        )}
        <button className="btn btn--ghost" onClick={onReset}>
          Start Over
        </button>
      </div>
    </div>
  );
}

function TimeoutView({
  attemptCount,
  maxRetries,
  onRetry,
  onReset,
  form,
}: {
  attemptCount: number;
  maxRetries: number;
  onRetry: (form: PaymentFormState) => void;
  onReset: () => void;
  form: PaymentFormState;
}) {
  const focusRef = useRef<HTMLHeadingElement>(null);
  const canRetry = attemptCount < maxRetries;

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  return (
    <div
      className="status-screen status-screen--timeout"
      role="alert"
      aria-live="assertive"
    >
      <div className="status-icon status-icon--timeout" aria-hidden="true">
        ⏱
      </div>
      <h2 className="status-title" tabIndex={-1} ref={focusRef}>
        Request Timed Out
      </h2>
      <p className="status-message">
        The payment request took too long. Your card has not been charged.
      </p>

      <p className="attempt-counter" aria-live="polite">
        Attempt {attemptCount} of {maxRetries}
      </p>

      <div className="status-actions">
        {canRetry ? (
          <button className="btn btn--primary" onClick={() => onRetry(form)}>
            Try Again
          </button>
        ) : (
          <p className="status-message status-message--error">
            Maximum attempts reached. Please try again later.
          </p>
        )}
        <button className="btn btn--ghost" onClick={onReset}>
          Start Over
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StatusScreen({ form, onReset }: StatusScreenProps) {
  const { failureReason } = usePaymentStore();
  const { status, attemptCount, maxRetries, retry } = usePayment();

  const statusMap: Record<Exclude<PaymentStatus, "idle">, React.ReactNode> = {
    processing: <ProcessingView />,
    success: <SuccessView onReset={onReset} />,
    failed: (
      <FailedView
        reason={failureReason}
        attemptCount={attemptCount}
        maxRetries={maxRetries}
        onRetry={retry}
        onReset={onReset}
        form={form}
      />
    ),
    timeout: (
      <TimeoutView
        attemptCount={attemptCount}
        maxRetries={maxRetries}
        onRetry={retry}
        onReset={onReset}
        form={form}
      />
    ),
  };

  if (status === "idle") return null;

  return <>{statusMap[status]}</>;
}
