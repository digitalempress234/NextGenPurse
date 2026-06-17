# Superstore Backend API Gap Report

## Executive Summary

The current backend is a good foundation for a marketplace MVP, but it is not yet complete enough to power the full Figma system end to end.

What already exists:

- authentication and password reset
- customer registration and address management
- vendor onboarding
- catalog, cart, wishlist, reviews
- order creation from cart
- Paystack card payment initialization and verification
- basic delivery status updates
- admin vendor approval and basic list views
- notifications
- admin-to-user chat

What is still missing or incomplete for the full design:

- the full vendor dashboard API
- the full rider platform API
- most of the superadmin operations beyond basic moderation
- wallet, payout, settlement, commission, and transaction ledgers
- BNPL application, approval, repayment, and tracking
- campaigns and sponsored product workflows
- store agents / pickup stations / pickup verification flows
- QR-based delivery and pickup verification
- compare deals, image search, scan-to-buy, and merchandising feeds
- cross-role inboxes between vendor, customer, rider, and support
- settings and policy management APIs

The biggest functional blockers are:

1. Multi-store checkout is not payment-complete. `placeOrderFromCart` splits cart items into multiple orders by store, but `initializePayment` only accepts exactly one order ID. The customer-facing design clearly expects a full checkout flow across stores.
2. Wallet payments are not real yet. The code marks an order as paid for `paymentMethod === "wallet"` without any wallet model, balance check, or ledger deduction.
3. Approved vendors still appear structurally incomplete. Admin approval updates the user, but does not activate the vendor's store.
4. Rider workflows are almost entirely absent. There is no rider onboarding, rider profile, rider availability, assignment queue, earnings, or withdrawal backend.
5. Chat is only built around admin conversations. The designs require vendor/customer/rider/support messaging surfaces that do not exist in the current data model.

## Design Surface Mapped From Figma

The reports cover four major product surfaces.

### 1. Customer-facing ecommerce

- customer sign-up, login, forgot/reset password
- home, category browsing, search, filters, deals, flash sales, best sellers
- compare products
- image search
- scan product QR to buy
- product details and reviews
- cart and checkout
- home delivery and store-agent pickup flows
- payment options including card, wallet, NextGen Purse, EasyBuy, Makopa, BNPL
- order history and detailed order tracking
- delivery QR and pickup QR
- wallet, transactions, rewards, referral, messages, wishlist/watchlist, addresses
- support chat

### 2. Vendor dashboard

- vendor onboarding with OTP, profile, store setup, password, documents
- vendor dashboard home and revenue summary
- vendor inbox with tabs for customers, riders, support
- vendor notifications
- vendor orders list and order details
- assign rider to order
- create manual order
- product list, stock, add/edit/import product
- compare deals
- analytics
- campaigns and sponsored items
- payout platform setup and payout history
- vendor settings, profile, store details, plan/pricing

### 3. Rider platform

- rider login and registration
- OTP verification
- rider KYC / identity verification
- business verification
- bank account setup
- under-review and rejection states
- online/offline presence
- delivery request queue
- accept/reject delivery
- active trip / delivery views
- delivery history
- earnings, cashout, OTP withdrawal confirmation
- rider profile, documents, support, privacy, security

### 4. Superadmin

- dashboard with revenue and period filters
- orders list and order details
- settlement history
- payout history
- store management, store profile, store suspension
- customer management and customer profile
- rider management and rider profile
- campaign moderation
- admin inbox
- BNPL applications and repayment tracking
- system settings for finance, vendor/rider, delivery, language, security, push notifications


## Current Backend Coverage

### Implemented routes

The API currently exposes these domain groups:

- `/api/auth`
- `/api/customers`
- `/api/vendors`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/deliveries`
- `/api/reviews`
- `/api/notifications`
- `/api/admin`
- `/api/categories`
- `/api/payments`
- `/api/wishlist`
- `/api/chat`

### What is actually implemented well enough to use

#### Auth

- generic registration/login/reset exists
- customer registration exists
- vendor OTP onboarding exists
- logout blacklist middleware exists

#### Customer

- profile read/update
- add/update/delete addresses

#### Vendor onboarding

- register vendor
- resend OTP
- verify OTP
- onboarding profile step
- store creation step
- password step
- document upload step
- submit for review step
- admin approve/reject vendor

#### Catalog and storefront basics

- category list and tree
- product CRUD for vendors
- product listing and details for customers
- cart CRUD
- wishlist CRUD
- review create/list

#### Orders and payment

- place order from cart
- customer order list
- vendor order list
- customer cancel order
- vendor/admin order status updates
- Paystack initialize / verify / webhook

#### Notifications and messaging

- user notifications list/read/delete
- admin<->participant chat conversations

#### Admin basics

- pending vendors
- all vendors/customers/riders
- all orders
- basic dashboard counters
- activate/deactivate user

## Critical Backend Gaps

### 1. Multi-store checkout cannot be paid end to end

Current behavior:

- `src/services/order.service.js` splits cart items into separate orders per store.
- `src/services/payment.service.js` only allows exactly one order ID at payment initialization.

Impact:

- a customer can create a cross-store checkout, but the payment layer cannot settle the entire checkout as one customer action
- order confirmation, payment status, and downstream delivery orchestration will drift across stores


### 2. Wallet payment is placeholder logic

Current behavior:

- `paymentMethod === "wallet"` marks the payment as paid immediately
- there is no wallet balance table
- there is no transaction ledger
- there is no debit, hold, reversal, or reconciliation logic

Impact:

- wallet screens in the customer, vendor, and rider designs cannot be trusted
- paid orders could be created from a zero-balance wallet

### 3. Vendor approval does not activate the store

Current behavior:

- vendor approval updates `User.onboardingStep` and `User.isVerified`
- `Store.isActive` defaults to `false`
- there is no approval flow that flips the store active

Impact:

- approved vendors may still remain effectively unpublished or unusable
- vendor/store filtering becomes unreliable


### 4. Delivery is not assignment-safe

Current behavior:

- `/api/deliveries/:id/status` allows any authenticated admin or rider
- there is no assigned-rider ownership check
- rider details are copied inline onto `Delivery`, not modeled as a first-class relation

Impact:

- any rider account could potentially mutate any delivery
- rider dashboard assignment, queue, and history views cannot be made reliable


### 5. Chat model is narrower than the UI

Current behavior:

- non-admin users can only start conversations with admins
- vendor/customer/rider/support channels in the Figma do not exist as independent conversation types

Impact:

- vendor inbox tabs for customers, riders, support cannot work
- customer support can work only as admin support, not the full ecosystem shown in the design

### 6. Reviews do not update product rating aggregates

Current behavior:

- reviews are created
- `Product.ratingsAverage` and `Product.ratingsCount` are not updated when a review is added

Impact:

- product cards and product details in the storefront will show stale ratings


## Missing Data Models

The current Prisma schema is too thin for the full platform. The following model groups are still needed.

### Marketplace operations

- `StoreSettings`
- `StoreBanner` or `StoreMedia`
- `StoreHours`
- `StoreAgent` or `PickupStation`
- `PickupOrderVerification`
- `OfflineOrder` or `ManualOrderSource`

### Wallet, payouts, settlements, commissions

- `Wallet`
- `WalletTransaction`
- `CommissionRule`
- `Settlement`
- `PayoutAccount`
- `Payout`
- `PayoutBatch`
- `PayoutFailure`

### Rider platform

- `RiderProfile`
- `RiderDocument`
- `RiderVerification`
- `RiderBankAccount`
- `RiderAvailability`
- `DeliveryAssignment`
- `DeliveryOffer`
- `RiderEarning`
- `RiderWithdrawal`
- `RiderTransaction`

### BNPL

- `BnplApplication`
- `BnplVerificationDocument`
- `BnplDecision`
- `BnplPlan`
- `BnplInstallment`
- `BnplRepayment`
- `BnplProviderAccount`

### Campaigns and merchandising

- `Campaign`
- `CampaignItem`
- `CampaignAsset`
- `CampaignApproval`
- `CampaignPayment`
- `HomepageSection` or `PromoBanner`

### Customer growth and loyalty

- `ReferralCode`
- `ReferralEvent`
- `Reward`
- `RewardLedger`
- `Coupon`
- `CashbackRule`

### Discovery and comparison

- `CompareList`
- `CompareItem`
- `SavedSearch`
- `ProductScanEvent`
- `ImageSearchAsset` or integration table if external

### Support and chat

- `ConversationParticipantType` support through schema or enum-backed fields
- `SupportTicket` if support cases are more than free-form chat
- `Attachment` support for chat/documents if needed

## API Gap Analysis By Surface

## Customer-facing ecommerce API still needed

### Account and profile

Needed:

- `GET /api/customers/me/wallet`
- `GET /api/customers/me/rewards`
- `GET /api/customers/me/referrals`
- `POST /api/customers/me/referrals/share`
- `GET /api/customers/me/security`
- `PUT /api/customers/me/password`

Why:

- the customer account area includes wallet, rewards, referral, password, and more than the current profile/address endpoints

### Storefront discovery and merchandising

Needed:

- `GET /api/home`
- `GET /api/home/campaigns`
- `GET /api/deals/flash-sales`
- `GET /api/deals/trending`
- `GET /api/deals/best-sellers`
- `GET /api/stores`
- `GET /api/stores/:id`
- `GET /api/stores/:id/products`

Why:

- the design has homepage sections, banners, featured campaigns, store pages, and merchandising feeds that are not implemented right now

### Search, filter, compare, scan

Needed:

- `GET /api/products/search`
- `POST /api/products/image-search`
- `POST /api/products/scan`
- `GET /api/compare`
- `POST /api/compare/items`
- `DELETE /api/compare/items/:productId`
- `DELETE /api/compare`

Why:

- compare deals, image search, and scan-to-buy are visible features in the Design but absent in the backend

Notes:

- current product listing supports only text search, category, subcategory, and price
- it does not support comparison state, delivery-time filters, store rating filters, sponsorship, or merchandising order

### Checkout and fulfillment

Needed:

- `GET /api/checkout/summary`
- `POST /api/checkout`
- `POST /api/checkout/payment-group`
- `GET /api/pickup-stations`
- `GET /api/pickup-stations/:id`
- `POST /api/orders/:id/select-pickup-station`
- `GET /api/orders/:id`
- `GET /api/orders/:id/tracking`
- `GET /api/orders/:id/delivery-qr`
- `GET /api/orders/:id/pickup-qr`
- `POST /api/orders/:id/confirm-delivery`
- `POST /api/orders/:id/reorder`

Why:

- current orders API has lists, cancel, and status mutation, but not the detail and verification endpoints required by the UI

Notes:

- pickup-center flow is completely missing
- QR verification flow is completely missing
- no customer-facing order detail endpoint exists

### Payments, wallet, BNPL

Needed:

- `POST /api/wallet/fund/initialize`
- `POST /api/wallet/fund/verify`
- `GET /api/wallet/transactions`
- `POST /api/bnpl/applications`
- `GET /api/bnpl/applications`
- `GET /api/bnpl/applications/:id`
- `GET /api/bnpl/repayments`
- `POST /api/bnpl/repayments/:id/pay`

Why:

- the customer UI exposes wallet history, add money, BNPL applications, and repayment tracking

Notes:

- current payment service recognizes BNPL-style payment method names, but only returns `"BNPL initiated"` and persists no lifecycle

### Support and messaging

Needed:

- `GET /api/support/conversations`
- `POST /api/support/conversations`
- `GET /api/support/conversations/:id/messages`
- `POST /api/support/conversations/:id/messages`

Why:

- the storefront shows a support/messages surface beyond the current admin chat shape

## Vendor dashboard API still needed

### Vendor dashboard home and analytics

Needed:

- `GET /api/vendors/me/dashboard`
- `GET /api/vendors/me/analytics`
- `GET /api/vendors/me/analytics/revenue`
- `GET /api/vendors/me/analytics/orders`
- `GET /api/vendors/me/analytics/products`

Why:

- the design shows vendor revenue summaries, activity charts, recent sales, and filtered reporting windows

### Vendor profile, store management, settings

Needed:

- `GET /api/vendors/me`
- `PUT /api/vendors/me`
- `GET /api/vendors/me/store`
- `PUT /api/vendors/me/store`
- `GET /api/vendors/me/settings`
- `PUT /api/vendors/me/settings`
- `GET /api/vendors/me/payout-settings`
- `PUT /api/vendors/me/payout-settings`
- `GET /api/vendors/me/payout-history`

Why:

- the onboarding endpoints are one-time setup endpoints, not the steady-state settings APIs shown in the dashboard

### Vendor orders and fulfillment

Needed:

- `GET /api/vendors/orders`
- `GET /api/vendors/orders/:id`
- `POST /api/vendors/orders`
- `POST /api/vendors/orders/:id/assign-rider`
- `POST /api/vendors/orders/:id/contact-rider`
- `POST /api/vendors/orders/:id/contact-customer`
- `GET /api/vendors/orders/:id/tracking`

Why:

- current vendor order list exists under `/api/orders/vendor`, but order details, manual order creation, assignment, contact, and dashboard-oriented actions do not


### Vendor product operations

Needed:

- `POST /api/vendors/products/import`
- `GET /api/vendors/products/import-jobs/:id`
- `GET /api/vendors/products/:id/analytics`
- `POST /api/vendors/products/:id/compare-deals`
- `GET /api/vendors/compare-deals`
- `PATCH /api/vendors/compare-deals/:id`

Why:

- the PDF includes CSV import, compare deals, stock controls, and product-level analytics not present today

### Vendor campaigns

Needed:

- `GET /api/vendors/campaigns`
- `POST /api/vendors/campaigns`
- `GET /api/vendors/campaigns/:id`
- `PUT /api/vendors/campaigns/:id`
- `POST /api/vendors/campaigns/:id/products`
- `POST /api/vendors/campaigns/:id/submit`
- `POST /api/vendors/campaigns/:id/payment/initialize`


### Vendor inbox

Needed:

- `GET /api/vendors/inbox/conversations`
- `POST /api/vendors/inbox/conversations`
- `GET /api/vendors/inbox/conversations/:id/messages`
- `POST /api/vendors/inbox/conversations/:id/messages`

Why:

- the vendor inbox includes customers, riders, and support tabs

## Rider platform API still needed

This is the largest missing surface.

### Rider onboarding and authentication

Needed:

- `POST /api/riders/register`
- `POST /api/riders/resend-otp`
- `POST /api/riders/verify-otp`
- `POST /api/riders/profile`
- `POST /api/riders/verification/id-document`
- `POST /api/riders/verification/business`
- `POST /api/riders/bank-account`
- `POST /api/riders/submit`
- `GET /api/riders/application-status`

Why:

- the design has a full rider registration and review flow
- the current codebase has no rider controller, service, or profile model

### Rider operating state

Needed:

- `GET /api/riders/me`
- `PUT /api/riders/me`
- `PATCH /api/riders/me/availability`
- `PATCH /api/riders/me/location`
- `GET /api/riders/me/dashboard`

Why:

- rider online/offline state, open-to-delivery state, and dashboard metrics are first-class UX features

### Delivery request queue and active deliveries

Needed:

- `GET /api/riders/delivery-requests`
- `POST /api/riders/delivery-requests/:id/accept`
- `POST /api/riders/delivery-requests/:id/reject`
- `GET /api/riders/deliveries/active`
- `GET /api/riders/deliveries/:id`
- `PATCH /api/riders/deliveries/:id/status`
- `POST /api/riders/deliveries/:id/scan-pickup`
- `POST /api/riders/deliveries/:id/scan-dropoff`

Why:

- the rider app includes request acceptance, pickup code usage, active trip details, and delivery completion

### Earnings and withdrawal

Needed:

- `GET /api/riders/earnings`
- `GET /api/riders/transactions`
- `POST /api/riders/withdrawals/initialize`
- `POST /api/riders/withdrawals/verify-otp`
- `GET /api/riders/withdrawals`

Why:

- the rider app shows earnings, cashout, fee breakdown, OTP confirmation, and transaction history

### Rider support and compliance

Needed:

- `GET /api/riders/documents`
- `GET /api/riders/security`
- `PUT /api/riders/password`
- `GET /api/riders/support/conversations`

## Superadmin API still needed

The current admin API covers only a small operational subset of the admin design.

### Admin dashboard and reporting

Needed:

- `GET /api/admin/overview`
- `GET /api/admin/revenue`
- `GET /api/admin/settlements`
- `GET /api/admin/payouts`
- `GET /api/admin/orders/:id`

Why:

- the design includes dashboard time filters, payout history, settlement history, and much richer order details

### Store management

Needed:

- `GET /api/admin/stores`
- `GET /api/admin/stores/:id`
- `PATCH /api/admin/stores/:id/status`
- `PATCH /api/admin/stores/:id/suspend`
- `PATCH /api/admin/stores/:id/activate`

### Customer management

Needed:

- `GET /api/admin/customers/:id`
- `GET /api/admin/customers/:id/orders`
- `GET /api/admin/customers/:id/wallet`
- `GET /api/admin/customers/:id/referrals`
- `PATCH /api/admin/customers/:id/suspend`

Why:

- current admin only lists customers
- the design includes detailed customer profile with direct actions

### Rider management

Needed:

- `GET /api/admin/riders/:id`
- `PATCH /api/admin/riders/:id/approve`
- `PATCH /api/admin/riders/:id/reject`
- `PATCH /api/admin/riders/:id/suspend`
- `GET /api/admin/riders/:id/transactions`
- `GET /api/admin/riders/:id/deliveries`


### Campaign management

Needed:

- `GET /api/admin/campaigns`
- `GET /api/admin/campaigns/:id`
- `PATCH /api/admin/campaigns/:id/approve`
- `PATCH /api/admin/campaigns/:id/reject`
- `PATCH /api/admin/campaigns/:id/pause`

Why:

- campaign moderation is a separate admin module in the design

### BNPL operations

Needed:

- `GET /api/admin/bnpl/applications`
- `GET /api/admin/bnpl/applications/:id`
- `PATCH /api/admin/bnpl/applications/:id/approve`
- `PATCH /api/admin/bnpl/applications/:id/reject`
- `GET /api/admin/bnpl/repayments`
- `GET /api/admin/bnpl/repayments/:id`


### Admin settings

Needed:

- `GET /api/admin/settings`
- `PUT /api/admin/settings/general`
- `PUT /api/admin/settings/finance`
- `PUT /api/admin/settings/vendor-rider`
- `PUT /api/admin/settings/delivery`
- `PUT /api/admin/settings/language`
- `PUT /api/admin/settings/security`
- `PUT /api/admin/settings/push-notifications`


## Cross-Dashboard Workflows That Still Need Backend Orchestration

These are the flows that make the dashboards work together as one system.

### Vendor onboarding -> store activation

Required orchestration:

1. vendor completes onboarding
2. admin reviews vendor and documents
3. store becomes active
4. vendor dashboard unlocks selling features
5. storefront includes that store in product discovery

Missing now:

- store activation step
- clear store visibility rules
- onboarding state machine for rejected/resubmitted vendors

### Customer checkout -> payment -> vendor fulfillment -> rider delivery

Required orchestration:

1. customer places order
2. payment succeeds once for the checkout
3. vendor gets notified
4. vendor accepts/prepares order
5. vendor requests or assigns rider
6. rider accepts delivery
7. pickup is verified
8. delivery is verified
9. customer can rate product and rider
10. settlement and commission records are posted

Missing today:

- checkout payment grouping
- vendor assignment workflow
- rider acceptance workflow
- QR/pickup verification
- settlement and commission ledger
- rider rating flow

### Wallet and payouts

Required orchestration:

1. customer funds wallet
2. wallet ledger credits account
3. customer spends from wallet
4. vendor commission and settlement are recorded
5. rider earnings accumulate
6. vendor/rider request payout
7. payout status is tracked and visible to admin

Missing today:

- all of it except a placeholder wallet payment branch

### BNPL lifecycle

Required orchestration:

1. customer applies for BNPL
2. documents and employment data are stored
3. admin/provider approves or rejects
4. repayment plan is created
5. installments are tracked and collected
6. delinquency and outstanding balances are visible

Missing today:

- all persistence and API for this lifecycle

### Campaign lifecycle

Required orchestration:

1. vendor drafts campaign
2. vendor selects products and pays if needed
3. admin approves/rejects/pauses
4. campaign appears in storefront placements
5. analytics and billing are visible

Missing today:

- models, routes, moderation, and storefront projection
