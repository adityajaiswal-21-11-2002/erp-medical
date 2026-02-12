# UI Changelog — Enterprise redesign

This document summarizes the frontend UI/UX redesign applied across Admin, Retailer, Distributor, and Customer portals. **No backend APIs, Mongo schemas, or routes were changed.**

---

## Design system (Phase 0)

### Shared UI kit (`components/ui-kit/`)

- **PageShell** — Standard page container with `p-4 md:p-6` and optional `maxWidth` (`xl` for forms, `content` for max-w-6xl).
- **PageHeader** — Title (`text-2xl font-semibold`), optional subtitle, actions slot, and optional **breadcrumbs** for inner pages.
- **StatCards / StatCard** — KPI cards with icon, value, and description; responsive grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` with `gap-4 md:gap-6`.
- **FilterBar** — Search input + optional filter content; **on mobile**, filters move into a bottom Sheet (“Filters” button).
- **ResponsiveDataTable** — **Desktop**: sortable table with optional actions dropdown. **Mobile**: card list with primary field, key fields, and actions menu. Built-in search (controlled or uncontrolled), pagination (default 10–20 rows).
- **DetailDrawer** — **Desktop**: dialog for details. **Mobile**: bottom drawer. Same API for title, description, children, actions, close label.
- **StatusBadge** — Re-export of existing `StatusBadge` for consistent status chips (order, KYC, payment, etc.).
- **EmptyState** — Icon, title, description, optional CTA; uses `border-border`, `bg-muted/30`.
- **ErrorState** — Message + optional “Try again” retry; uses destructive icon.
- **Skeletons** — `TableSkeleton`, `CardListSkeleton`, `StatCardsSkeleton`, `FormSkeleton` for loading states.
- **ConfirmDialog** — Danger/confirm actions with optional loading state.
- **toast** — Helper around sonner for success/error/loading/promise.

### Typography and spacing

- Page title: `text-2xl font-semibold tracking-tight`.
- Section titles: `text-lg font-semibold`.
- Body: `text-sm` / `text-base`.
- Page padding: `p-4 md:p-6`.
- Card padding: `p-4 md:p-6`.
- Grid gaps: `gap-4 md:gap-6`.
- Content max width: `max-w-6xl` for list/dashboard pages; `max-w-xl` for forms where used.

### Theming

- All surfaces use Tailwind/shadcn tokens: `bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, `bg-muted`, `destructive`, etc.
- **Light/dark** supported everywhere; no hardcoded light/dark colors in the UI kit or refactored layouts.

---

## Layout upgrades (Phase 1)

### Admin / Retailer / Distributor (dashboard-style)

- **Sidebar**
  - **Collapsible**: `collapsible="icon"` — desktop shows icon-only when collapsed; mobile keeps sheet/drawer behavior.
  - Borders use `border-sidebar-border`; header/footer use `border-b` / `border-t` with same token.
  - Menu items use `tooltip={item.title}` for icon-only mode; active state uses `data-active` and `bg-sidebar-accent`.
  - User block and logout use `bg-sidebar-accent` / `text-sidebar-accent-foreground` (no hardcoded emerald/red).
- **Topbar**
  - Sticky `top-0`, `h-14`, `border-b border-border`, `bg-background/95`, `backdrop-blur`.
  - Padding `px-4 md:px-6`.
  - **Admin**: theme toggle (icon, aria-label).
  - **Retailer / Distributor**: optional search, theme toggle, notifications icon, profile dropdown (Profile / Logout). Logout uses `text-destructive focus:text-destructive`.
  - All icon buttons have `aria-label` for accessibility.
- **Main**
  - `p-4 md:p-6` and `space-y-4 md:space-y-6` for consistent vertical rhythm.

### Customer (storefront)

- **Navbar**
  - Sticky header with `border-border`, design tokens; referral banner uses `bg-muted/60` and `border-border`.
  - Logo, search (hidden on small screens), cart (with badge), account — all use tokens and `aria-label` where needed.
- **Sticky cart CTA (mobile)**
  - When cart has items: fixed bottom bar with “View cart (N items)” button so mobile users can quickly open cart; spacer so content is not hidden behind it.
- **Footer**
  - `border-t border-border`, `bg-background`; text `text-muted-foreground`.

---

## Page-level consistency (Phase 2)

### Patterns applied

- **Breadcrumbs** on inner pages (e.g. Admin → Dashboard, Admin → Orders; Customer → Catalog).
- **PageShell** used on refactored pages for consistent padding and max width.
- **Loading**: Table or card skeletons while fetching; no raw spinners in place of content.
- **Empty**: EmptyState with icon, message, and optional CTA (e.g. “Refresh”, “Clear filters”).
- **Error**: ErrorState with retry where applicable.
- **Tables**: ResponsiveDataTable where refactored (e.g. Admin Orders) — table on desktop, card list on mobile; no horizontal scroll on small screens.
- **Detail views**: DetailDrawer for order/details so mobile gets a drawer and desktop gets a dialog.
- **Modals**: ConfirmDialog for destructive actions; existing Dialogs kept for small forms (e.g. status, invoice) with consistent styling.

### Example refactors

- **Admin Dashboard** — PageShell, PageHeader with breadcrumbs, StatCards, StatCardsSkeleton, ErrorState.
- **Admin Orders** — PageShell, PageHeader, ResponsiveDataTable (search, sort, pagination, mobile cards), TableSkeleton, EmptyState, ErrorState, DetailDrawer for order detail, Dialogs for status/invoice unchanged.
- **Customer Catalog** — PageShell, PageHeader, FilterBar (search + category/price; filters in Sheet on mobile), CardListSkeleton, EmptyState, ErrorState, responsive product grid with `gap-4 md:gap-6`.

### Legacy PageHeader

- `components/page-header.tsx` updated to use `border-border`, `bg-card`, `text-foreground`, `text-muted-foreground`, and same typography (`text-2xl font-semibold`, `text-sm`). All pages still using this component benefit from consistent tokens and spacing without changing imports.

---

## Visual polish and accessibility (Phase 3)

- **Buttons**
  - Primary for main actions; outline for secondary; ghost for icon-only (e.g. theme, notifications, profile).
  - Destructive for logout and danger actions (`text-destructive focus:text-destructive` in dropdowns).
- **Icons**
  - Lucide used consistently; icon-only buttons have `aria-label` (e.g. “Toggle sidebar”, “Switch to light mode”, “Notifications”, “Open profile menu”, “Open actions”).
- **Focus**
  - Buttons and interactive elements rely on default focus rings (`focus-visible:ring-2 focus-visible:ring-ring`) from shadcn where applicable.
- **Contrast**
  - Text and borders use foreground/muted-foreground/border tokens so light and dark themes stay readable.

---

## Performance and cleanliness (Phase 4)

- **Images**
  - No change to product image loading in list views in this pass; placeholder/“No image” already used in catalog cards. Detail pages remain the right place for full images.
- **Pagination**
  - ResponsiveDataTable uses configurable `pageSize` (e.g. 20) to avoid rendering huge lists at once.
- **Large JSON**
  - Not rendered raw in the UI; detail views show structured fields. Any “View raw” can be added later in a collapsible section if needed.

---

## Files touched (summary)

- **New**: `components/ui-kit/*` (page-shell, page-header, stat-cards, filter-bar, responsive-data-table, detail-drawer, empty-state, error-state, skeletons, confirm-dialog, toast-helpers, index).
- **Layouts**: `components/admin-layout.tsx`, `components/retailer-layout.tsx`, `app/distributor/layout.tsx`, `app/customer/layout.tsx` — sidebar collapsible, topbar, tokens, aria-labels.
- **Updated**: `components/page-header.tsx` (tokens, typography).
- **Refactored pages**: `app/admin/dashboard/page.tsx`, `app/admin/orders/page.tsx`, `app/customer/catalog/page.tsx` (full design-system usage; other pages still use legacy PageHeader and benefit from layout + token updates).

---

## Acceptance checklist

- [x] Consistent design system across the app (ui-kit + tokens).
- [x] Typography hierarchy and spacing (text-2xl, text-lg, text-sm; p-4 md:p-6; gap-4 md:gap-6).
- [x] Responsive tables (desktop table, mobile card list) where ResponsiveDataTable is used.
- [x] Empty / loading / error states on refactored pages (skeletons, EmptyState, ErrorState).
- [x] Smooth UX: skeletons, toasts, modals, drawers (DetailDrawer, Sheet for filters).
- [x] Less clutter: collapsible filters on mobile (FilterBar + Sheet), drawer for details on mobile.
- [x] Light/dark mode via tokens only.
- [x] Mobile-first: sticky header, sticky cart CTA, responsive grid and card list, no horizontal scroll in tables.
- [x] Accessibility: aria-labels on icon buttons, focus and contrast via design tokens.
- [x] No backend or schema changes; routes and core flows unchanged.
