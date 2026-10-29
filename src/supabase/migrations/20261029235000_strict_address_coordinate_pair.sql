-- Require address pins to contain either both coordinates or neither.
alter table public.addresses
  drop constraint if exists addresses_delivery_coordinates_check;

alter table public.addresses
  add constraint addresses_delivery_coordinates_check check (
    (latitude is null and longitude is null)
    or (
      latitude is not null
      and longitude is not null
      and latitude between -90 and 90
      and longitude between -180 and 180
    )
  );
