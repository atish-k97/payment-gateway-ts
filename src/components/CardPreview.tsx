// components/CardPreview.tsx

import { CardType, PaymentFormState } from "@/types";
import { maskCardNumber } from "@/utils/cardUtils";

interface CardPreviewProps {
  form: PaymentFormState;
  cardType: CardType;
}

const CARD_LABELS: Record<CardType, string> = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  amex: "AMEX",
  unknown: "",
};

export default function CardPreview({ form, cardType }: CardPreviewProps) {
  const displayNumber = form.cardNumber
    ? maskCardNumber(form.cardNumber)
    : "**** **** **** ****";

  const displayName = form.cardholderName || "FULL NAME";
  const displayExpiry = form.expiry || "MM/YY";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        borderRadius: "16px",
        padding: "24px",
        width: "100%",
        maxWidth: "380px",
        minHeight: "200px",
        color: "white",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      {/* Card Type Badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "30px",
            borderRadius: "4px",
            background: "rgba(255,255,255,0.2)",
          }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            letterSpacing: "2px",
            opacity: cardType === "unknown" ? 0 : 1,
          }}
        >
          {CARD_LABELS[cardType]}
        </span>
      </div>

      {/* Card Number */}
      <div
        style={{
          fontSize: "20px",
          letterSpacing: "3px",
          textAlign: "center",
          padding: "16px 0",
        }}
      >
        {displayNumber}
      </div>

      {/* Name and Expiry */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div style={{ fontSize: "10px", opacity: 0.6, marginBottom: "4px" }}>
            CARD HOLDER
          </div>
          <div style={{ fontSize: "14px", textTransform: "uppercase" }}>
            {displayName}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10px", opacity: 0.6, marginBottom: "4px" }}>
            EXPIRES
          </div>
          <div style={{ fontSize: "14px" }}>{displayExpiry}</div>
        </div>
      </div>
    </div>
  );
}
