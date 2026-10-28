-- Run once in the chosen Supabase project's SQL Editor, or apply with Supabase CLI.
-- The server uses a Supabase secret key; the browser never accesses this table.
begin;

create table public.consultas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  telefono text not null check (char_length(telefono) between 7 and 30),
  deporte text not null check (char_length(btrim(deporte)) between 1 and 120),
  mensaje text not null default '' check (char_length(mensaje) <= 3000),
  fecha_envio timestamptz not null default now()
);

alter table public.consultas enable row level security;
revoke all on table public.consultas from public, anon, authenticated;
grant usage on schema public to service_role;
grant insert on table public.consultas to service_role;

create index consultas_fecha_envio_idx on public.consultas (fecha_envio desc);
comment on table public.consultas is 'Solicitudes de consulta gratuita de Andrea Nutrition';
comment on column public.consultas.fecha_envio is 'Fecha y hora de recepción generada por PostgreSQL';

commit;
