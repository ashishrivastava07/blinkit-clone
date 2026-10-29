# Blinkit Clone

This is a Supabase/Postgres-backed quick-commerce application. The customer,
shopkeeper, delivery-agent, and admin areas use explicit routes and database
row-level security; no frontend role selector grants access.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set the existing Supabase project's URL and publishable key. Do not put a
   service-role/secret key in a Vite environment variable.
3. Install dependencies and start the Vite client:

```sh
npm install
npm run dev
```

The optional health-only service can be started separately with `npm run server`.
It intentionally has no duplicate business-data API; Supabase Auth, RLS, and
database RPCs are the backend authority.

## Routes

- Customer: `/`, `/shop`, `/search`, `/cart`, `/checkout`, `/orders`,
  `/products/:id`, `/account`, `/account/addresses`, `/login`, `/register`
- Shopkeeper: `/shopkeeper/dashboard`, `/shopkeeper/products`,
  `/shopkeeper/inventory`, `/shopkeeper/orders`, `/shopkeeper/store`
- Delivery: `/delivery/dashboard`, `/delivery/available-orders`,
  `/delivery/my-deliveries`, `/delivery/profile`
- Admin: `/admin/dashboard`, `/admin/users`, `/admin/stores`,
  `/admin/products`, `/admin/orders`, `/admin/reports`

Client-side routes support direct refreshes through the included
`public/_redirects` (Netlify/Cloudflare Pages) and `vercel.json` (Vercel)
single-page-app fallback rules.

  Staff sign-in now redirects to the dashboard for the user's highest-privilege
  role. Dashboards have a refresh action and surface database errors instead of
  silently showing empty results. Delivery agents must go online before the
  secured available-orders RPC will return tasks; claiming and status changes use
  the database RPCs. Admin order views are read-only.

  Registration always creates a customer account. Privileged roles and shop
  membership must be provisioned by an administrator using the Supabase dashboard
  or a trusted server-side operation; never edit browser storage or expose a
service key to do this.

## Database

The existing migrations in `src/supabase/migrations` define the core database,
RLS policies, transactional `place_order` RPC, status-transition rules, and
the `claim_delivery` RPC. The latest migrations add persistent customer carts,
atomic delivery claiming, security/index hardening, a 51-product sample catalogue
with 53 package-size variants, and customer product ratings/reviews. Product details
are available by selecting a catalogue item; customers can submit or update one
rating per product. The Fashion migration adds the Fashion category tree without
seeding Fashion products, a configurable `storefront_promotions` table, variant
size/colour attributes, and a seven-image product gallery with shop-owned RLS.
Shopkeepers with owner, manager, or catalog-manager membership can manage their
own products and images in the public `product-images` bucket. Apply all pending migrations with
`npx supabase --workdir src/supabase db push` after linking the intended
Supabase project. Product photos use individually mapped Pexels images hosted
remotely rather than bundled locally; if one is unavailable, the catalogue
shows a neutral "Photo unavailable" state. Product image URLs and the seeded
product mapping are maintained by the catalogue migrations. The hero and three
homepage cards are loaded from `storefront_promotions`; an administrator can
change their text, image URL, call-to-action, internal target path, position,
and active status in Supabase without changing the app bundle. See the
[Pexels license](https://www.pexels.com/license/), which permits use in
e-commerce websites and apps. Customer-facing inventory stays protected by
RLS; when stock is not visible, the storefront lets the checkout RPC confirm
availability and enforce the stock limit.

The current-location action requests browser geolocation only after a customer
clicks it and sends coordinates to the free, public OpenStreetMap Nominatim
reverse-geocoding endpoint. The app does not save coordinates; customers must
confirm or edit the returned address and six-digit PIN before it is saved to
their private address account. If Nominatim returns no Indian PIN code, the
customer must enter one manually. No API key is required. The public Nominatim
service has a usage policy and rate limits; for higher-volume production use,
operate a compliant proxy or self-host a geocoder. See the
[Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
and [OpenStreetMap attribution guidance](https://www.openstreetmap.org/copyright).

`place_order` performs server-side product price and stock validation while
locking inventory. Payments are currently cash-on-delivery only. Razorpay,
email/SMS, and maps are not configured and are deliberately not simulated.

## Verify

```sh
npm run lint
npm run build
npm run server
```

For production, configure the Supabase Auth site URL, email confirmation
redirect URL, password/leaked-password policy, and create privileged accounts
through a trusted administrative process.
