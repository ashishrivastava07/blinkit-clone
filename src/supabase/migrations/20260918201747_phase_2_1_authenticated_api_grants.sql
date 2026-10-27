grant usage on schema public to authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.user_roles,
  public.shops,
  public.shop_members,
  public.categories,
  public.products,
  public.product_variants,
  public.inventory,
  public.addresses,
  public.orders,
  public.order_items,
  public.order_status_history,
  public.payments,
  public.delivery_agents,
  public.delivery_assignments,
  public.delivery_location_events,
  public.audit_logs,
  public.coupons,
  public.coupon_redemptions
to authenticated;
