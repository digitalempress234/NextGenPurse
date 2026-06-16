# Superstore Backend Sprint Backlog

Last updated: 2026-05-29
Owner: Backend Team
Source: Figma gap report and current API audit

## How to use this backlog
- Execute sprints in order unless a dependency is explicitly marked as parallel.
- Treat each story as independently shippable and testable.
- Do not start a story until all dependencies and Definition of Ready are met.
- Move story status through: `todo -> in-progress -> blocked -> done`.

## Definition of Ready (DoR)
A story is ready when all are true:
- API contract draft exists (request, response, error codes).
- Prisma model changes are identified.
- Auth/role guard behavior is defined.
- Test scope is listed (unit, integration, e2e).

## Definition of Done (DoD)
A story is done when all are true:
- Endpoint and service logic implemented.
- Prisma migration applied and seed/test fixtures updated.
- Validation and authorization enforced.
- Tests pass for happy path and key failure paths.
- Postman collection updated in docs/postman_collection.json.
- Observability added (logs/events needed for ops flows).

## Milestone map
- M1 (Platform correctness): S1-S2
- M2 (Fulfillment operations): S3-S4
- M3 (Financial operations): S5-S6
- M4 (Growth and control plane): S7-S8

## Sprint S1 - Checkout and Payment Correctness (Highest Priority)
Goal: Make multi-store checkout payable and reconcilable as one customer action.

Stories:
1. S1-1 Checkout payment group model
- Scope: Add `CheckoutPaymentGroup`, `PaymentAllocation` and link many orders to one payment intent.
- Acceptance criteria:
  - A single checkout can create N store orders and one payment group.
  - Each order has deterministic allocation amount and currency.
  - Allocation totals must equal payment group total.
- Dependencies: none.

2. S1-2 Multi-order payment initialize endpoint
- Scope: Add payment initialize for group checkout (Paystack metadata includes payment group ID).
- Acceptance criteria:
  - Endpoint accepts checkout token/group ID, not a single order ID only.
  - Rejects mismatched totals or stale carts.
  - Returns one authorization URL for whole checkout.
- Dependencies: S1-1.

3. S1-3 Payment verify and webhook reconciliation at group level
- Scope: Update verify/webhook to settle all linked orders atomically.
- Acceptance criteria:
  - Successful payment marks all allocated orders as paid.
  - Partial update is prevented by transaction boundaries.
  - Duplicate webhook handling is idempotent.
- Dependencies: S1-1, S1-2.

4. S1-4 Customer checkout summary endpoint
- Scope: `GET /api/checkout/summary` with grouped totals, fees, and per-store split.
- Acceptance criteria:
  - Response includes subtotal, fees, discounts, grand total.
  - Response includes per-store order preview.
- Dependencies: S1-1.

Exit criteria:
- Customer can complete one payment for multi-store cart and all resulting orders are consistent.

## Sprint S2 - Wallet Foundation and Real Wallet Payments
Goal: Replace placeholder wallet branch with real ledger-backed wallet logic.

Stories:
1. S2-1 Wallet and transaction ledger models
- Scope: Add `Wallet`, `WalletTransaction` (credit/debit/hold/release/reversal), running balance policy.
- Acceptance criteria:
  - Ledger rows are immutable.
  - Balance can be derived from ledger with consistent result.
  - Actor ownership (customer/vendor/rider) is enforced.
- Dependencies: S1 complete recommended.

2. S2-2 Wallet funding initialize/verify
- Scope: `POST /api/wallet/fund/initialize`, `POST /api/wallet/fund/verify` with Paystack.
- Acceptance criteria:
  - Funding verification creates ledger credit exactly once.
  - Replayed verification does not duplicate credit.
- Dependencies: S2-1.

3. S2-3 Wallet payment during checkout
- Scope: Wallet debit flow for checkout payment group.
- Acceptance criteria:
  - Insufficient balance returns validation error.
  - Successful wallet payment writes debit ledger and settles payment group.
  - Failure path writes no orphan entries.
- Dependencies: S1-1..S1-3, S2-1.

4. S2-4 Wallet transactions read APIs
- Scope: `GET /api/wallet/transactions`, customer wallet summary endpoint.
- Acceptance criteria:
  - Paginated transaction history with type/status filters.
  - Amount signs and running balances are correct.
- Dependencies: S2-1.

Exit criteria:
- Wallet payments are real, auditable, and balance-safe.

## Sprint S3 - Vendor Approval, Store Activation, and Fulfillment Safety
Goal: Ensure approved vendors can sell and fulfillment actions are ownership-safe.

Stories:
1. S3-1 Vendor/store lifecycle state machine
- Scope: unify vendor onboarding status and store visibility status.
- Acceptance criteria:
  - Admin approval can activate store publication state.
  - Rejected vendors can resubmit with tracked status.
- Dependencies: none.

2. S3-2 Admin approval orchestration fix
- Scope: on approval, update user verification state and store active state in one transaction.
- Acceptance criteria:
  - Approved vendor becomes discoverable only when store is active.
  - Audit fields capture approver and timestamp.
- Dependencies: S3-1.

3. S3-3 Delivery assignment ownership guard
- Scope: enforce only assigned rider can mutate delivery state.
- Acceptance criteria:
  - Unauthorized rider status update returns forbidden.
  - Admin override path remains explicit and logged.
- Dependencies: none.

4. S3-4 Vendor order detail and assignment APIs
- Scope: add vendor-side order detail and rider assignment routes.
- Acceptance criteria:
  - Vendor can assign rider only for own store orders.
  - Assignment generates delivery assignment record.
- Dependencies: S3-3 recommended.

Exit criteria:
- Vendor activation and assignment rules are reliable and enforceable.

## Sprint S4 - Rider Platform MVP
Goal: Deliver first complete rider lifecycle for assignment and delivery execution.

Stories:
1. S4-1 Rider profile and verification models
- Scope: `RiderProfile`, `RiderDocument`, verification status and bank account.
- Acceptance criteria:
  - Rider onboarding status transitions are explicit.
  - Required KYC docs and bank details are persisted.
- Dependencies: none.

2. S4-2 Rider onboarding APIs
- Scope: register, OTP verify, profile submit, document upload, application status.
- Acceptance criteria:
  - Rider cannot access dispatch endpoints before approval.
  - Rejection reason is available in status endpoint.
- Dependencies: S4-1.

3. S4-3 Rider availability and request queue
- Scope: online/offline and delivery request list with accept/reject.
- Acceptance criteria:
  - Only online riders receive available requests.
  - Accept operation atomically locks request ownership.
- Dependencies: S3-3, S4-1.

4. S4-4 Active delivery and QR verification endpoints
- Scope: pickup scan/dropoff scan and active delivery details.
- Acceptance criteria:
  - Pickup/dropoff verification events are persisted.
  - Invalid or reused codes are rejected.
- Dependencies: S4-3.

5. S4-5 Rider earnings and withdrawals
- Scope: earnings summary, transactions, withdrawal init + OTP verify.
- Acceptance criteria:
  - Completed deliveries post earnings records.
  - Withdrawal status lifecycle is queryable.
- Dependencies: S2-1, S4-3.

Exit criteria:
- Riders can onboard, receive assignments, complete deliveries, and see earnings.

## Sprint S5 - Messaging and Support Expansion
Goal: Support inbox surfaces across customer, vendor, rider, support.

Stories:
1. S5-1 Conversation model expansion
- Scope: support conversation types and participant role typing.
- Acceptance criteria:
  - Conversation supports customer/vendor/rider/support/admin combinations.
  - Authorization prevents cross-tenant leakage.
- Dependencies: none.

2. S5-2 Role-based inbox APIs
- Scope: `/support/conversations`, `/vendors/inbox/*`, role scoped message routes.
- Acceptance criteria:
  - Each role sees only allowed conversation tabs.
  - Message send/read permissions are enforced per role.
- Dependencies: S5-1.

3. S5-3 Attachments and moderation hooks
- Scope: optional attachment metadata and admin moderation hooks.
- Acceptance criteria:
  - Attachments are linked and auditable.
  - Flagged content metadata can be reviewed by admin.
- Dependencies: S5-1.

Exit criteria:
- All major roles have production-safe inbox capability.

## Sprint S6 - Settlements, Commissions, and Payout Operations
Goal: Build money movement control plane for vendor/rider/admin reporting.

Stories:
1. S6-1 Commission and settlement ledger
- Scope: `CommissionRecord`, `Settlement` posting on order completion.
- Acceptance criteria:
  - Settlement is derived from paid/completed order facts.
  - Commission rule version is stored per posting.
- Dependencies: S1, S2, S4.

2. S6-2 Payout accounts and payout lifecycle
- Scope: `PayoutAccount`, `Payout`, optional batch/failure entities.
- Acceptance criteria:
  - Vendor/rider can maintain payout destination.
  - Payout lifecycle states: pending, processing, paid, failed.
- Dependencies: S6-1.

3. S6-3 Admin settlement and payout reporting APIs
- Scope: settlement list/detail, payout list/detail, period filters.
- Acceptance criteria:
  - Admin dashboard can query by actor, status, date range.
  - Totals reconcile to ledger entries.
- Dependencies: S6-1, S6-2.

Exit criteria:
- Finance operations are traceable and admin-visible.

## Sprint S7 - BNPL Lifecycle
Goal: Implement BNPL end to end (application to repayment tracking).

Stories:
1. S7-1 BNPL core models
- Scope: application, verification docs, decision, plan, installment, repayment.
- Acceptance criteria:
  - Application and decision states are explicit and auditable.
- Dependencies: none.

2. S7-2 Customer BNPL APIs
- Scope: apply, list applications, detail, repayments list, repayment pay.
- Acceptance criteria:
  - Customer can track outstanding and paid installments.
  - Payment events update BNPL balances consistently.
- Dependencies: S7-1, S1 or S2 payment rails.

3. S7-3 Admin BNPL operations APIs
- Scope: approve/reject applications, repayment oversight endpoints.
- Acceptance criteria:
  - Admin decisions require reason and are audit logged.
  - Overdue and delinquency statuses are queryable.
- Dependencies: S7-1.

Exit criteria:
- BNPL feature is persisted, governable, and reportable.

## Sprint S8 - Campaigns, Discovery, and Admin Control Plane
Goal: Complete merchandising and system administration surfaces.

Stories:
1. S8-1 Campaign workflow (vendor + admin moderation)
- Scope: campaign create/edit/submit, admin approve/reject/pause.
- Acceptance criteria:
  - Campaign state machine prevents invalid transitions.
  - Approved campaigns project into home feeds.
- Dependencies: none.

2. S8-2 Discovery APIs
- Scope: home sections, flash sales, trending, best sellers, store pages.
- Acceptance criteria:
  - Home endpoint supports configurable section ordering.
  - Product feeds support sort/filter combinations used by UI.
- Dependencies: S8-1 recommended.

3. S8-3 Compare, image search, scan-to-buy
- Scope: compare list/items plus integration endpoints for image/scan search.
- Acceptance criteria:
  - Compare list CRUD works per customer.
  - Image/scan endpoints return standardized product candidate payload.
- Dependencies: none.

4. S8-4 Admin settings APIs
- Scope: finance, vendor/rider, delivery, language, security, push settings.
- Acceptance criteria:
  - Settings updates are validated and versioned.
  - Critical setting changes are audit logged.
- Dependencies: none.

Exit criteria:
- Merchandising and admin settings surfaces are operational.

## Story execution template (copy per story)
Use this template in sprint tracking tickets:

- Story ID:
- Status: todo
- API contracts:
- Prisma changes:
- Service/controller changes:
- Authorization rules:
- Test plan:
- Risks:
- Dependencies:
- Acceptance checklist:

## Immediate next 10 stories (recommended queue)
1. S1-1 Checkout payment group model
2. S1-2 Multi-order payment initialize endpoint
3. S1-3 Payment verify and webhook reconciliation
4. S2-1 Wallet and transaction ledger models
5. S2-2 Wallet funding initialize/verify
6. S2-3 Wallet payment during checkout
7. S3-1 Vendor/store lifecycle state machine
8. S3-2 Admin approval orchestration fix
9. S3-3 Delivery assignment ownership guard
10. S4-1 Rider profile and verification models

## Risk register (active)
- R1: Migration complexity from current order-payment linkage to payment-group linkage.
- R2: Ledger correctness and idempotency under webhook retries.
- R3: Authorization regressions across new role-based inbox endpoints.
- R4: Rider assignment race conditions without strict locking.
- R5: BNPL repayment schedule drift if date/time logic is inconsistent.

## Tracking fields for weekly review
- Sprint health: green/amber/red
- Planned stories vs done stories
- Blockers by dependency type (schema, auth, integration)
- Escaped defects found after merge
- API contract churn count
