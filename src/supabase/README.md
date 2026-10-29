# Supabase backend foundation

Supabase Postgres is the planned application source of truth. Apply the migrations before connecting any UI data flow.

## Required browser environment

Copy `.env.example` to `.env.local` and obtain the values from the Supabase project's **Connect** dialog or **Settings > API Keys**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Only the publishable key belongs in Vite. Never add a service-role key, database password, or SMS-provider secret to a browser environment file.

## Apply and verify

1. Create/link a Supabase project: `npx supabase login`, then `npx supabase --workdir src link --project-ref <project-ref>`.
2. Push schema and seed data: `npx supabase --workdir src db push`.
3. In the dashboard, create the first administrator using a trusted server/dashboard operation: add a `user_roles` row with `role = 'admin'` only after the user exists in `auth.users`. Roles are never derived from editable user metadata.
4. Configure a real Supabase Auth SMS provider before enabling phone login in the UI.

The `20261029150000_fashion_product_images_storefront.sql` migration is
additive and repeatable. It adds Fashion and its five subcategories (without
creating Fashion inventory), product variant size/colour JSON attributes, a
shop-owned `product_images` table with a database-enforced seven-image cap, and
the `storefront_promotions` table used by the home page. Existing product image
URLs remain valid and continue to be shown as the primary image until a
shopkeeper saves them into the gallery.

After applying the migration, an administrator can configure the homepage by
editing `storefront_promotions` rows in the Supabase dashboard. Keep exactly one
active `hero` row and up to three active `card` rows. `target_path` must be an
internal route beginning with one `/`. The migration inserts editable starter
promotions; these are page content, not product inventory.

Apply `20261029230000_public_catalog_verified_reviews_quantity_offers.sql`
after the storefront migration. It grants anonymous users read access only to
active products from active, approved shops and their public catalogue content;
inventory, carts, accounts, and order data remain private. It also exposes only
verified review content to anonymous users, keeps review writes authenticated
and limited to delivered purchases, and replaces the checkout RPC with one that
calculates the quantity discount on the server.

Shopkeepers can configure optional 2+ and 4+ percentage discounts in the
product editor. The 4+ rate must be greater than the 2+ rate when both are set.
These discounts are stored on variants, displayed in catalogue/cart prices, and
calculated again by `place_order` at checkout. Existing reviews are marked as
verified only when they match a delivered order item; other historical reviews
are retained but hidden from public ratings.

Fashion products support editable size/colour combinations and a configurable
size chart (chest, waist, hip and length in centimetres). Adding options to an
existing product creates only missing variants and preserves existing variant
stock and inventory. The size chart is stored on the product row.

Delivery-agent order lists use the `available_delivery_orders` and
`my_delivery_orders` RPCs. The agent sees the order reference and delivery
address, but cannot select orders or order items directly through PostgREST.
Finishing a delivery sets the agent back to available status.

The `product-images` bucket and its shop-membership Storage policies are defined
by the existing shopkeeper product management migration. The new image paths use
`<shop-id>/<product-id>/<filename>` so the existing shop-scoped storage rules
continue to restrict writes and deletes. The bucket accepts image types up to
5 MB each; the gallery relation and UI enforce seven images per product.

The current-location action sends a single user-initiated reverse-geocoding
request to the free, public OpenStreetMap Nominatim endpoint. No API key is
required, and the app does not persist coordinates. Address and PIN fields must
be confirmed or edited before saving to the authenticated user's address
records; if no Indian PIN is returned, the customer must enter the six-digit
PIN manually. Nominatim has a public-service usage policy and rate limits; for
higher-volume production use, operate a compliant proxy or self-host a geocoder.
See the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
and [OpenStreetMap attribution guidance](https://www.openstreetmap.org/copyright).
If a different provider is used later, keep any secret API key server-side,
never in a `VITE_` variable.

The legacy Express prototype must not be used as a second data source. These endpoints are obsolete once the frontend migration begins:

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

The last endpoint is insecure and must never be exposed in the production architecture. Order creation, status transitions, and delivery assignment are performed through the protected database RPCs defined in the migration.
