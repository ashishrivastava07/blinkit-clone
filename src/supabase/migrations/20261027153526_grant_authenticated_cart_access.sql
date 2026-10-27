-- RLS policies restrict these grants to the signed-in cart owner.
grant select, insert, update, delete on table public.carts, public.cart_items to authenticated;
