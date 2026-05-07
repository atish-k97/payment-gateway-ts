"use client";

import { useEffect, useState, useCallback } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { usePayment } from "@/hooks/usePayment";
import CardInput from "@/components/CardInput";
import StatusScreen from "@/components/StatusScreen";
import TransactionHistory from "@/components/TransactionHistory";
import type { PaymentFormState } from "@/types";

const INITIAL_FORM: PaymentFormState = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  amount: "",
  currency: "INR",
};

export default function Home() {
  const { loadHistoryFromStorage } = usePaymentStore();
  const { status, reset } = usePayment();
  const [form, setForm] = useState<PaymentFormState>(INITIAL_FORM);

  // Load persisted history on mount
  useEffect(() => {
    loadHistoryFromStorage();
  }, [loadHistoryFromStorage]);

  const handleReset = useCallback(() => {
    reset();
    setForm(INITIAL_FORM);
  }, [reset]);

  const showForm = status === "idle";
  const showStatus = status !== "idle";

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__header">
          <h1 className="page__logo">PayGate</h1>
        </header>

        <div className="page__layout">
          {/* Left — form or status */}
          <div className="page__primary">
            {showForm && <CardInput form={form} setForm={setForm} />}
            {showStatus && <StatusScreen form={form} onReset={handleReset} />}
          </div>

          {/* Right — history */}
          <div className="page__secondary">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </main>
  );
}
