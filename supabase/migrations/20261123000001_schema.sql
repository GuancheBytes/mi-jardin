-- =============================================================
-- Mi Jardín · Esquema
-- =============================================================

-- ---------- Catálogo (compartido por todos los jardines) ----------

create table public.species (
  id                   text primary key,
  name                 text not null,
  scientific_name      text not null,
  emoji                text not null,
  category             text not null check (category in ('hortaliza', 'aromatica', 'ornamental', 'frutal', 'suculenta')),
  -- Frecuencias en días. NULL = ese cuidado no aplica.
  care_riego           int check (care_riego > 0),
  care_poda            int check (care_poda > 0),
  care_abonado         int check (care_abonado > 0),
  -- Meses (1-12) en los que se puede plantar, por clima.
  planting_templado    int[] not null default '{}',
  planting_subtropical int[] not null default '{}'
);

create table public.companion_rules (
  species_a text not null references public.species (id) on delete cascade,
  species_b text not null references public.species (id) on delete cascade,
  kind      text not null check (kind in ('compatible', 'incompatible')),
  note      text,
  primary key (species_a, species_b),
  check (species_a <> species_b)
);

-- ---------- Jardines y miembros ----------

create table public.gardens (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) > 0),
  cols       int  not null default 12 check (cols between 4 and 30),
  rows       int  not null default 8  check (rows between 4 and 30),
  climate    text not null default 'subtropical' check (climate in ('templado', 'subtropical')),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.garden_members (
  garden_id  uuid not null references public.gardens (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (garden_id, user_id)
);

create index garden_members_user_idx on public.garden_members (user_id);

-- Invitaciones pendientes: se aceptan al iniciar sesión con ese email.
create table public.garden_invites (
  garden_id  uuid not null references public.gardens (id) on delete cascade,
  email      text not null check (email = lower(email)),
  invited_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (garden_id, email)
);

-- ---------- Contenido del jardín ----------

create table public.zones (
  id        uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens (id) on delete cascade,
  name      text not null,
  kind      text not null check (kind in ('bancal', 'maceta', 'cesped', 'arriate', 'otro')),
  x         int  not null check (x >= 0),
  y         int  not null check (y >= 0),
  width     int  not null check (width > 0),
  height    int  not null check (height > 0)
);

create index zones_garden_idx on public.zones (garden_id);

create table public.plants (
  id         uuid primary key default gen_random_uuid(),
  garden_id  uuid not null references public.gardens (id) on delete cascade,
  species_id text not null references public.species (id),
  nickname   text,
  planted_on date not null default current_date,
  photo_url  text,
  notes      text not null default '',
  x          int  not null check (x >= 0),
  y          int  not null check (y >= 0),
  created_at timestamptz not null default now(),
  unique (garden_id, x, y) deferrable initially deferred
);

create index plants_garden_idx on public.plants (garden_id);

-- Historial de cuidados realizados. Las tareas pendientes se calculan en el cliente.
create table public.care_tasks (
  id         uuid primary key default gen_random_uuid(),
  garden_id  uuid not null references public.gardens (id) on delete cascade,
  plant_id   uuid not null references public.plants (id) on delete cascade,
  kind       text not null check (kind in ('riego', 'poda', 'abonado')),
  done_on    date not null default current_date,
  done_by    uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index care_tasks_garden_idx on public.care_tasks (garden_id);
create index care_tasks_plant_kind_idx on public.care_tasks (plant_id, kind, done_on desc);

-- ---------- Disparadores ----------

-- Quien crea un jardín pasa a ser su propietario en garden_members.
create function public.handle_new_garden()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.garden_members (garden_id, user_id, email, role)
  select new.id, new.owner_id, u.email, 'owner'
  from auth.users u
  where u.id = new.owner_id;
  return new;
end;
$$;

create trigger on_garden_created
  after insert on public.gardens
  for each row execute function public.handle_new_garden();

-- ---------- Tiempo real ----------
-- Para que los miembros de un jardín compartido vean al momento lo que hacen los demás.
alter publication supabase_realtime add table public.plants, public.care_tasks, public.zones;
