# NEXA AI Website Master Plan

## 1. Product structure

NEXA AI should become one ecosystem with three clearly separated customer journeys and one protected operations layer.

### A. NEXA Academy — primary public website

The root home page becomes education-first. It explains the company, learning model, AI and human support, and the relationship between the Academy, trading-bot product, and ABNX token. It must not lead with profit claims.

Planned public pages:

- `/index.html` — Academy-led ecosystem home
- `/courses.html` — all courses and subscription comparison
- `/course-trading.html` — trading fundamentals curriculum
- `/course-ai.html` — practical AI curriculum
- `/course-bot-building.html` — trading-bot development curriculum
- `/course-arbitrage.html` — arbitrage curriculum
- `/lesson.html` — authenticated lesson player
- `/subscription.html` — $4.99, one-year access checkout and terms
- `/articles.html` — free learning center
- `/support.html` — AI and human-support entry point

Commercial offer: $4.99 for one year of access. The offer page must define currency, renewal behavior, refund policy, included courses, content-update policy, support limits, age restrictions, and applicable taxes before launch.

### B. NEXA Arbitrage Bot — separate product site

The current bot-heavy homepage content moves into a dedicated product area instead of being deleted.

Planned pages:

- `/bot/index.html` — bot product home
- `/bot/how-it-works.html` — scanner, filters, execution, reconciliation
- `/bot/strategies.html` — targets, limits, costs, and risks
- `/bot/virtual-lab.html` — the isolated virtual-funds demonstration
- `/bot/security.html` — custody, permissions, providers, wallet safety
- `/bot/fees.html` — gross versus net result explanation
- `/bot/risk.html` — bot-specific risk disclosure
- `/login.html` and `/dashboard.html` — authenticated customer operations

The public bot site may describe controls, but only the authenticated portal can submit real customer instructions.

### C. ABNX Token — separate Polygon token site

ABNX must be presented as a distinct token product with its own documentation and legal review. It may describe integrations with the bot, but it must not imply guaranteed value, yield, profit, or automatic appreciation.

Planned pages:

- `/abnx/index.html` — token overview
- `/abnx/utility.html` — specific platform uses and limitations
- `/abnx/tokenomics.html` — supply, allocation, vesting, treasury, liquidity
- `/abnx/polygon.html` — network and verified contract information
- `/abnx/roadmap.html` — dated, qualified development milestones
- `/abnx/claim.html` — eligibility and claim workflow
- `/abnx/security.html` — audits, multisig, admin keys, incident response
- `/abnx/legal.html` — jurisdiction and token-specific disclosures

Before a public launch, publish the verified Polygon contract address, source verification, decimals, total supply, owner/admin powers, mint/burn rules, vesting contracts, treasury addresses, liquidity policy, audit status, and geographic restrictions.

### D. Protected operations layer

These pages remain separate from public marketing and retain role-based access:

- Customer: account, KYC, funding, withdrawals, portfolio, wallet, strategy, bot controls, fees, support
- Support staff: visitor and customer chat, assignment, resolution, audit trail
- Admin: users, portfolios, deposits, withdrawals, compliance, wallets, strategies, bot requests, ABNX distribution, subscriptions, courses, support staffing, audit, and system health

## 2. Navigation model

The global public header should contain: Academy, Courses, Trading Bot, ABNX Token, Learning Center, Support, Log in.

Each product area receives a distinct sub-navigation and an obvious “Back to NEXA ecosystem” link. Customer, staff, and admin portals use operational navigation only; they should not mix marketing pages into task-critical flows beyond a single Learning Center link.

## 3. Visual system

Use one elegant parent brand with restrained product accents:

- Foundation: midnight navy and ink surfaces
- Academy accent: violet and soft blue
- Bot accent: cyan/teal for data and active states
- ABNX accent: restrained champagne gold with Polygon violet
- Risk/error: muted coral, never neon red
- Typography: Manrope for interface and editorial text; DM Mono only for balances, status, and technical metadata

Avoid excessive neon green, unsupported earnings imagery, and token “free money” language. Cards should use subtle borders, larger spacing, lower-contrast gradients, and consistent 12–16px radii.

## 4. Virtual bot demonstration

The virtual lab is isolated from production:

- Starts with $10,000 clearly labeled virtual funds
- Uses locally generated venue prices and paper fills
- Shows gross spread, estimated costs, and simulated net result
- Never calls wallet APIs, production bot RPCs, deposit APIs, or withdrawal APIs
- Never mixes virtual balances into the customer ledger
- Resets easily and includes persistent simulation disclosures

Future enhancement: store optional demo progress in a dedicated `demo_sessions` table, never in `portfolio_ledger`.

## 5. Course and subscription architecture

Recommended data model:

- `courses`: title, slug, description, status, version
- `course_modules`: course, title, order
- `lessons`: module, title, body/video reference, order, preview flag
- `subscriptions`: customer, plan, starts, expires, payment status
- `lesson_progress`: customer, lesson, completion, last position
- `course_quizzes` and `quiz_attempts`
- `support_entitlements`: AI/human-support allowance and scope

Payments must be handled by a PCI-compliant provider. The website stores provider customer/subscription references, never card details. Admin can publish courses, manage access, issue policy-compliant refunds through the provider, and view subscription audit events.

## 6. Admin expansion

Add role-scoped admin modules:

- Education: courses, modules, lessons, publication, learner progress
- Commerce: plans, subscriptions, payment-provider status, refunds
- Bot operations: existing strategy and control queues
- ABNX: eligibility, distribution records, vesting, treasury references
- Support: staff availability, queue health, guest/customer conversations
- Content: articles, FAQs, disclosures, version history
- Security: roles, MFA, audit records, system health, incident controls

High-risk actions require confirmation, reason, immutable audit entry, and ideally AAL2/MFA.

## 7. Protected boundaries

The following existing code is frozen during the site split unless separately tested and approved:

- Wallet connection and ownership-signature workflow
- Wallet token approval and transfer code
- Production bot start, pause, stop, and emergency-stop RPC contract
- Portfolio ledger accounting and withdrawal reservation rules
- Staff/admin authentication and role checks

Public pages link to these flows but do not duplicate their logic.

## 8. Delivery phases

### Phase 0 — stabilization

- Fix dashboard render failures and loading/error states
- Restore all operational navigation
- Add route and selector regression tests
- Ship isolated virtual lab

### Phase 1 — information architecture

- Preserve the current bot homepage as the source for `/bot/`
- Replace root homepage with Academy-led ecosystem home
- Create ABNX documentation shell
- Introduce shared header, footer, design tokens, and SEO metadata

### Phase 2 — Academy MVP

- Course catalog and four course landing pages
- Authentication-aware lesson player
- $4.99 one-year checkout
- Subscription entitlement checks
- Course-content admin module

### Phase 3 — ABNX launch readiness

- Publish verified contract and tokenomics
- Add audited claim eligibility and distribution workflow
- Add admin distribution reconciliation
- Complete legal, security, and jurisdiction review

### Phase 4 — bot demonstration and onboarding

- Expand virtual lab with guided lessons and scenarios
- Connect demo completion to course progress
- Add conversion path from demo to verified customer onboarding
- Keep virtual and real balances visually and technically separate

### Phase 5 — quality and launch

- Accessibility, mobile, performance, analytics consent, SEO
- End-to-end tests for customer/staff/admin roles
- Wallet and bot-control regression suite
- Payment, support, incident, backup, and recovery runbooks

## 9. Acceptance criteria

- No page remains indefinitely on “Loading…”; every request has loading, empty, success, and error states.
- All local links and same-page anchors resolve.
- Public users can access the AI bot and request a human agent.
- Virtual trading never changes real balances or calls production controls.
- Real wallet connection and bot control behavior is unchanged.
- Academy, Bot, and ABNX have distinct URLs, navigation, metadata, and disclosures.
- Admin permissions cover all three products with immutable audit records.
- Mobile layouts have no document-level horizontal overflow.
