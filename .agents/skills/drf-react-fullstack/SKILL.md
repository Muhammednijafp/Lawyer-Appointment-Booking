---
name: "DRF and React Full-Stack Legal Platform Expert"
description: "Enforces strict API contract adherence, genuine legal credential verification, clean Django architecture, and modern React UI/UX design system practices."
---
# Goals
- Ensure seamless, secure, and type-safe data communication between Django REST Framework and the React frontend.
- Enforce genuine advocate verification workflows (mandatory Bar Council Enrollment ID, status lifecycle, admin auditing).
- Maintain high-end legal UI/UX standards with cohesive typography, micro-interactions, and robust state handling.

# Instructions & Best Practices

## 1. Advocate Verification & Regulatory Compliance (Legal Domain)
- *Mandatory Bar Council ID:* Advocate registration must always enforce a valid, non-empty, and unique Bar Council Enrollment ID (e.g. `K/1234/2020` or `MH/5678/2019`). Never allow unverified users to pose as legal counsel.
- *Verification Lifecycle:* Follow strict state transitions: `NOT_APPLIED` → `PENDING` → `APPROVED` / `REJECTED`. Only approved advocates should be discoverable in the public directory and permitted to receive consultation bookings.
- *Auditability:* Preserve verification timestamps (`applied_at`, `verified_at`) and admin review notes (`verification_notes`).

## 2. Django REST Framework (Backend Architecture)
- *Serializers:* Always use explicit `fields = [...]` lists in ModelSerializers. Never use `fields = '__all__'`.
- *Status Codes:* Return explicit HTTP status codes (e.g., `status.HTTP_200_OK`, `status.HTTP_201_CREATED`, `status.HTTP_400_BAD_REQUEST`, `status.HTTP_403_FORBIDDEN`).
- *Query Optimization:* Prevent N+1 queries. Always use `.select_related()` for ForeignKey fields (e.g., `user`, `client`, `lawyer`, `category`) and `.prefetch_related()` for ManyToMany or reverse relations (e.g., `reviews`, `documents`).
- *Permissions & Role Guards:* Explicitly verify roles in API views (`ADMIN`, `LAWYER`, `CLIENT`) rather than trusting clientside requests.

## 3. React Frontend & Design System
- *Design System:* Define and consume CSS custom properties in `index.css` for consistent dark/gold/navy brand styling, badges (`.verified-shield`), and elevated cards (`.law-card`).
- *API Centralization:* Keep all network requests centralized in `src/api/fetchApi.js` utilizing `commonApi` with automatic JWT Bearer authentication headers. Never hardcode API URLs in UI components.
- *Error & Empty States:* Gracefully handle field-level DRF errors (e.g., displaying `error.response?.data?.bar_council_number?.[0]`) and show meaningful empty states with action buttons.
- *Authentication Persistence:* Synchronize JWT tokens and user context in `AuthContext`, handling token refresh and protected route redirects seamlessly.

# Common Pitfalls to Avoid
- *Missing Trailing Slashes:* Django strictly enforces trailing slashes (`/api/accounts/lawyers/`). Ensure all React API client calls include the trailing slash to prevent unexpected 301 redirects that strip payload data.
- *CSS Variable Misalignment:* Do not use `var(--color-...)` tokens without ensuring they are globally defined in `index.css`.
- *Fake Lawyer Registration:* Never omit backend verification for Bar Council IDs during lawyer registration or profile updates.
- *CORS Configuration:* Ensure `django-cors-headers` explicitly permits `http://localhost:5173` and local development origins in `settings.py`.

# Verification Checklist
- [ ] Django models have matching DRF serializers with explicit fields list.
- [ ] Bar Council ID is mandatory and validated on advocate registration and listing application.
- [ ] Backend queries use `.select_related()` / `.prefetch_related()` without N+1 query loops.
- [ ] React client builds cleanly (`npm run build`) without missing imports or syntax warnings.
- [ ] Django system checks pass (`python manage.py check`) with zero silenced issues.
- [ ] All protected routes and sidebar navigation respect role-based authorization (`ADMIN`, `LAWYER`, `CLIENT`).

