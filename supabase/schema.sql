-- Shared rooms: the room id in the URL hash is the only access key.
-- RLS is on with no policies, so the publishable key cannot read or list the table directly.
-- All access goes through the security definer functions below, which require a room id.

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 250KB cap, checked before compression: fits ~7 lists with full history (~33KB each).
  -- A room over the cap stops syncing (save_room fails, client retries). Bounds storage abuse.
  constraint rooms_data_size check (pg_column_size(data) < 250000)
);

alter table public.rooms enable row level security;
revoke all on public.rooms from anon, authenticated;

-- 50 rooms per hour across all clients: the public key has no per-user identity to throttle.
-- ponytail: global cap, a spammer can block real users for up to an hour; move to per-user
-- limits with anonymous auth if that happens. Concurrent calls can overshoot by a few rows.
create function public.create_room(room_data jsonb)
returns setof public.rooms
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from rooms where created_at > now() - interval '1 hour') >= 50 then
    raise exception 'room creation limit reached, try again later';
  end if;
  return query insert into rooms (data) values (room_data) returning *;
end;
$$;

create function public.get_room(room_id uuid)
returns setof public.rooms
language sql
stable
security definer
set search_path = public
as $$
  select * from rooms where id = room_id;
$$;

-- Returns no row when base_version is stale: the client refetches and re-applies.
create function public.save_room(room_id uuid, room_data jsonb, base_version integer)
returns setof public.rooms
language sql
security definer
set search_path = public
as $$
  update rooms
  set data = room_data, version = version + 1, updated_at = now()
  where id = room_id and version = base_version
  returning *;
$$;

revoke execute on function public.create_room(jsonb) from public;
revoke execute on function public.get_room(uuid) from public;
revoke execute on function public.save_room(uuid, jsonb, integer) from public;
grant execute on function public.create_room(jsonb) to anon, authenticated;
grant execute on function public.get_room(uuid) to anon, authenticated;
grant execute on function public.save_room(uuid, jsonb, integer) to anon, authenticated;

-- Rooms nobody touched for 30 days are deleted daily at 03:00 UTC.
-- A device that still holds the link then finds no room and stops syncing (joinRoom "not found").
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'delete-stale-rooms',
  '0 3 * * *',
  $$delete from public.rooms where updated_at < now() - interval '30 days'$$
);
