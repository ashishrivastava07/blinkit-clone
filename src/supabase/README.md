# Supabase backend foundation

Supabase Postgres is the planned application source of truth. Apply the migrations before connecting any UI data flow.

## Required browser environment

Copy `.env.example` to `.env.local` and obtain the values from the Supabase project's **Connect** dialog or **Settings > API Keys**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Only the publishable key belongs in Vite. Never add a service-role key, database password, or SMS-provider secret to a browser environment file.

## Apply and verify

1. Create/link a Supabase project: `npx supabase login`, then `npx supabase link --project-ref <project-ref>`.
2. Push schema and seed data: `npx supabase db push`.
3. In the dashboard, create the first administrator using a trusted server/dashboard operation: add a `user_roles` row with `role = 'admin'` only after the user exists in `auth.users`. Roles are never derived from editable user metadata.
4. Configure a real Supabase Auth SMS provider before enabling phone login in the UI.

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
