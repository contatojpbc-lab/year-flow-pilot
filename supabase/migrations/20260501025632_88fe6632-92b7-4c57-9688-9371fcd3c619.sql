
-- Fix mutable search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Revoke public/anon/authenticated EXECUTE on internal SECURITY DEFINER functions.
-- These are meant to be called by triggers/policies only, never directly via PostgREST.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
-- has_role still needs to be callable by authenticated users via RLS policies,
-- so we keep the authenticated grant on it.
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
