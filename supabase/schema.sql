-- Shared rooms: the room id in the URL hash is the only access key.
-- RLS is on with no policies, so the publishable key cannot read or list the table directly.
-- All access goes through the security definer functions below, which require a room id.

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  -- 1MB cap: stops abuse through the public key; history growth hits it first
  constraint rooms_data_size check (pg_column_size(data) < 1000000)
);

alter table public.rooms enable row level security;
revoke all on public.rooms from anon, authenticated;

create function public.create_room(room_data jsonb)
returns setof public.rooms
language sql
security definer
set search_path = public
as $$
  insert into rooms (data) values (room_data) returning *;
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
