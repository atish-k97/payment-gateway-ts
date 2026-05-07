"use client";

import { useState } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import type { Transaction } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
    amount,
  );
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<Transaction["status"], string> = {
  success: "Success",
  failed: "Failed",
  timeout: "Timed Out",
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function TransactionDetail({
  tx,
  onClose,
}: {
  tx: Transaction;
  onClose: () => void;
}) {
  return (
    <div
      className="tx-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Transaction details"
      onClick={onClose}
    >
      <div className="tx-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="tx-modal__close"
          onClick={onClose}
          aria-label="Close transaction details"
        >
          ✕
        </button>

        <h2 className="tx-modal__title">Transaction Details</h2>

        <dl className="tx-detail-list">
          <dt>Transaction ID</dt>
          <dd className="tx-detail-list__mono">{tx.transactionId}</dd>

          <dt>Status</dt>
          <dd>
            <span className={`tx-badge tx-badge--${tx.status}`}>
              {STATUS_LABEL[tx.status]}
            </span>
          </dd>

          <dt>Amount</dt>
          <dd>{formatAmount(tx.amount, tx.currency)}</dd>

          <dt>Date &amp; Time</dt>
          <dd>{formatTimestamp(tx.timestamp)}</dd>

          <dt>Attempts</dt>
          <dd>{tx.attemptCount}</dd>

          {tx.failureReason && (
            <>
              <dt>Failure Reason</dt>
              <dd className="tx-detail-list__error">{tx.failureReason}</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TransactionHistory() {
  const history = usePaymentStore((s) => s.history);
  const [selected, setSelected] = useState<Transaction | null>(null);

  if (history.length === 0) {
    return (
      <section className="tx-history" aria-label="Transaction history">
        <h2 className="tx-history__title">Transaction History</h2>
        <p className="tx-history__empty">No transactions yet.</p>
      </section>
    );
  }

  return (
    <section className="tx-history" aria-label="Transaction history">
      <h2 className="tx-history__title">Transaction History</h2>

      <ul className="tx-list" role="list">
        {history.map((tx) => (
          <li key={tx.transactionId} className="tx-list__item">
            <button
              className="tx-row"
              onClick={() => setSelected(tx)}
              aria-label={`View details for transaction ${tx.transactionId}`}
            >
              <span className={`tx-badge tx-badge--${tx.status}`}>
                {STATUS_LABEL[tx.status]}
              </span>
              <span className="tx-row__amount">
                {formatAmount(tx.amount, tx.currency)}
              </span>
              <span className="tx-row__id">
                {tx.transactionId.slice(0, 8)}…
              </span>
              <span className="tx-row__time">
                {formatTimestamp(tx.timestamp)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <TransactionDetail tx={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
