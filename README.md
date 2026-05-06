Setup Instructions :

1. Run npm install to install dependencies, including Zustand for state management.
2. Run npm run dev to start the local development server at http://localhost:3000.

The project uses Next.js App Router and TypeScript as required.

Project Structure :

1. src/app/api/pay: Mock gateway logic that simulates success, failure, and timeouts.

2. src/components: Modular UI pieces like CardInput, CardPreview, and TransactionHistory.

3. src/store: Zustand store managing the payment lifecycle and transaction persistence.

4. src/hooks: Custom hooks for handling the AbortController logic and API calls.

5. src/utils: Helper functions for card detection (Visa/Mastercard/Amex) and number formatting.

Key Assumptions :

1. State Management: Zustand was chosen over Redux for its lower boilerplate and better performance in a single-flow application.

2. Persistence: Transaction history is saved to localStorage to ensure data remains after a page refresh.

3. Idempotency: A unique UUID is generated at the start of the first payment attempt and reused for all retries to prevent duplicate server entries.

4. Timeout: The frontend strictly enforces a 6-second timeout using AbortController, even if the server takes 8 seconds to respond.
