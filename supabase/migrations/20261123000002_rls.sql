-- =============================================================
-- Mi Jardín · Row Level Security
-- Regla general: solo los miembros de un jardín pueden ver y tocar sus datos.
-- =============================================================

-- ---------- Funciones auxiliares ----------
-- SECURITY DEFINER evita la recursión de RLS al consultar garden_members desde sus propias políticas.

create function public.is_garden_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.garden_members
    where garden_id = gid and user_id = auth.uid()
  );
$$;

create function public.is_garden_owner(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.garden_members
    where garden_id = gid and user_id = auth.uid() and role = 'owner'
  );
$$;

-- Convierte las invitaciones pendientes del usuario actual en membresías.
-- La app la llama tras iniciar sesión.
create function public.accept_garden_invites()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  my_email text := lower(auth.jwt() ->> 'email');
  accepted int;
begin
  if auth.uid() is null or my_email is null then
    return 0;
  end if;

  insert into public.garden_members (garden_id, user_id, email, role)
  select i.garden_id, auth.uid(), my_email, 'member'
  from public.garden_invites i
  where i.email = my_email
  on conflict do nothing;
  get diagnostics accepted = row_count;

  delete from public.garden_invites where email = my_email;
  return accepted;
end;
$$;

revoke execute on function public.accept_garden_invites() from anon, public;
grant execute on function public.accept_garden_invites() to authenticated;

-- ---------- Activar RLS ----------

alter table public.species          enable row level security;
alter table public.companion_rules  enable row level security;
alter table public.gardens          enable row level security;
alter table public.garden_members   enable row level security;
alter table public.garden_invites   enable row level security;
alter table public.zones            enable row level security;
alter table public.plants           enable row level security;
alter table public.care_tasks       enable row level security;

-- ---------- Catálogo: solo lectura ----------

create policy "Catálogo visible para usuarios" on public.species
  for select to authenticated using (true);

create policy "Asociaciones visibles para usuarios" on public.companion_rules
  for select to authenticated using (true);

-- ---------- Jardines ----------

create policy "Ver mis jardines" on public.gardens
  for select to authenticated using (public.is_garden_member(id) or owner_id = auth.uid());

create policy "Crear jardines propios" on public.gardens
  for insert to authenticated with check (owner_id = auth.uid());

create policy "Los miembros editan el jardín" on public.gardens
  for update to authenticated using (public.is_garden_member(id)) with check (public.is_garden_member(id));

create policy "Solo el propietario borra" on public.gardens
  for delete to authenticated using (public.is_garden_owner(id));

-- ---------- Miembros ----------
-- Las altas se hacen solo con el disparador y con accept_garden_invites().

create policy "Ver miembros de mis jardines" on public.garden_members
  for select to authenticated using (public.is_garden_member(garden_id));

create policy "El propietario quita miembros y cada uno puede salir" on public.garden_members
  for delete to authenticated
  using ((public.is_garden_owner(garden_id) and role <> 'owner') or (user_id = auth.uid() and role <> 'owner'));

-- ---------- Invitaciones ----------

create policy "Ver invitaciones de mis jardines o dirigidas a mí" on public.garden_invites
  for select to authenticated
  using (public.is_garden_member(garden_id) or email = lower(auth.jwt() ->> 'email'));

create policy "El propietario invita" on public.garden_invites
  for insert to authenticated
  with check (public.is_garden_owner(garden_id) and invited_by = auth.uid());

create policy "El propietario cancela invitaciones" on public.garden_invites
  for delete to authenticated using (public.is_garden_owner(garden_id));

-- ---------- Zonas, plantas y cuidados: todo para los miembros ----------

create policy "Miembros gestionan zonas" on public.zones
  for all to authenticated
  using (public.is_garden_member(garden_id)) with check (public.is_garden_member(garden_id));

create policy "Miembros gestionan plantas" on public.plants
  for all to authenticated
  using (public.is_garden_member(garden_id)) with check (public.is_garden_member(garden_id));

create policy "Miembros gestionan cuidados" on public.care_tasks
  for all to authenticated
  using (public.is_garden_member(garden_id)) with check (public.is_garden_member(garden_id));

-- ---------- Storage: fotos de plantas ----------
-- Bucket público para lectura (rutas con UUID imposibles de adivinar);
-- solo los miembros del jardín pueden subir, cambiar o borrar.
-- Ruta de cada foto: <garden_id>/<plant_id>-<timestamp>.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('plant-photos', 'plant-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Miembros suben fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'plant-photos' and public.is_garden_member(((storage.foldername(name))[1])::uuid));

create policy "Miembros cambian fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'plant-photos' and public.is_garden_member(((storage.foldername(name))[1])::uuid));

create policy "Miembros borran fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'plant-photos' and public.is_garden_member(((storage.foldername(name))[1])::uuid));
