-- 1) Tabla de perfiles con rol
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','worker')),
  name text
);
alter table public.profiles enable row level security;

-- 2) Función segura para saber si quien consulta es admin
create function public.is_admin() returns boolean
language sql security definer set search_path = public stable
as $$ select exists(select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- 3) Permisos: cada uno ve su perfil; el admin ve ambos; nadie edita desde la app
create policy "ver propio perfil" on public.profiles for select using (auth.uid() = id);
create policy "admin ve todos" on public.profiles for select using (public.is_admin());

-- 4) DESPUÉS de crear los 2 usuarios en Authentication > Users, cambia los correos y ejecuta:
insert into public.profiles (id, role, name)
select id, 'admin', 'Jefe' from auth.users where email = 'CORREO_JEFE@ejemplo.com';
insert into public.profiles (id, role, name)
select id, 'worker', 'Taxista' from auth.users where email = 'CORREO_TAXISTA@ejemplo.com';
