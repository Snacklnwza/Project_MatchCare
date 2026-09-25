-- Run once on an existing MatchCare database created before `normal` was added.
-- Fresh databases already include this value in schema/02_patients.sql.
begin;

alter table public.patients
  drop constraint if exists patients_mobility_status_valid;

alter table public.patients
  add constraint patients_mobility_status_valid
  check (mobility_status in ('normal', 'bedridden', 'wheelchair', 'walker', 'cane'));

commit;
