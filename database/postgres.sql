-- ─────────────────────────────────────────────────────────────
-- drop any old objects that get in the way
--    (tables first, then ENUMs; CASCADE blows away dependents)
-- ─────────────────────────────────────────────────────────────
drop table if exists public.scheduled_messages cascade;
drop table if exists public.booked    cascade;
drop table if exists public.leads     cascade;
drop table if exists public.realtor   cascade;
drop table if exists public.bookings   cascade;
drop table if exists public.google_credentials cascade;
drop table if exists public.google_calendar_events cascade;


-- drop enums in case the script is re-run
drop type if exists public.home_type_enum cascade;
drop type if exists public.bedrooms_enum cascade;
drop type if exists public.bathrooms_enum cascade;
drop type if exists public.sqft_enum cascade;
drop type if exists public.year_built_enum cascade;
drop type if exists public.occupancy_enum cascade;
drop type if exists public.changes_enum cascade;
drop type if exists public.timeframe_enum cascade;
drop type if exists public.professional_enum cascade;
drop type if exists public.expert_enum cascade;
drop type if exists public.working_with_agent_enum cascade;
drop type if exists public.looking_to_buy_enum cascade;
drop type if exists booking_status_t cascade;



-- ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- survey enumerations
create type public.home_type_enum as enum (
    'single-family',
    'condo',
    'townhouse',
    'duplex',
    'other'
);

create type public.bedrooms_enum as enum ('1','2','3','4','5+');
create type public.bathrooms_enum as enum ('1','1.5','2','2.5','3+');
create type public.sqft_enum as enum (
    'under-1000',
    '1000-1499',
    '1500-1999',
    '2000-2499',
    '2500+',
    'not-sure'
);
create type public.year_built_enum as enum (
    'before-1970',
    '1970-1990',
    '1990-2010',
    'after-2010',
    'not-sure'
);
create type public.occupancy_enum as enum ('i-live','rented','vacant','other');
create type public.changes_enum as enum ('yes','maybe','no');
create type public.timeframe_enum as enum (
    '',
    'immediate',
    'within-3-months',
    '6-months',
    'year-plus',
    'not-sure'
);
create type public.working_with_agent_enum as enum ('yes','no','');
create type public.looking_to_buy_enum as enum ('yes','no','');

create type booking_status_t as enum ('pending','confirmed','canceled');
-- ─────────────────────────────────────────────────────────────
-- 2. Core tables
-- ─────────────────────────────────────────────────────────────

/* 2-a  Realtors */
create table public.realtor (
    realtor_id   uuid primary key references auth.users(id),
    f_name       varchar(125) not null,
    e_name       varchar(125) not null,
    video_url    varchar(600),
    website_url  varchar(600),
    -- time_zone
    created_at   timestamptz default now()
);

/* 2-b  Leads */
create table public.leads (
    phone                varchar(50) primary key,
    realtor_id           uuid      not null references public.realtor(realtor_id) on delete cascade,
    first_name           varchar(127),
    last_name            varchar(127),
    email                varchar(127),
    zipcode             varchar(20),
    lead_state           varchar(20),
    home_type            public.home_type_enum,
    bedrooms             public.bedrooms_enum,
    bathrooms            public.bathrooms_enum,
    sqft                 public.sqft_enum,
    home_built           public.year_built_enum,
    occupancy            public.occupancy_enum,
    willing_to_sell      public.changes_enum,
    sell_time            public.timeframe_enum,
    working_with_agent   public.working_with_agent_enum,
    looking_to_buy       public.looking_to_buy_enum,
    ad_id                varchar(50),
    sent_schedule_reminder boolean default false,
    created_at           timestamptz default now()
);

alter table public.leads enable row level security;
create policy "realtor leads" on public.leads for select
  using (realtor_id = (auth.jwt() ->> 'realtorId')::uuid);

/* 2-c  Booked calls / appointments */
create table public.bookings (
    booking_id        bigserial primary key,
    phone           varchar(50) not null references public.leads(phone) on delete cascade,
    realtor_id        uuid       not null references public.realtor(realtor_id) on delete cascade,

    appointment_time  timestamptz  not null,
    google_calendar_id varchar(256) not null,
    google_event_id    varchar(256) not null,

    status            booking_status_t default 'confirmed',
    created_at        timestamptz     default now(),
    updated_at        timestamptz     default now()
);
create unique index on public.bookings(realtor_id, appointment_time);


/* 2-d Scheduled messages for future SMS */
create table public.scheduled_messages (
    id             bigserial primary key,
    phone          varchar(50) not null references public.leads(phone) on delete cascade,
    realtor_id     uuid not null references public.realtor(realtor_id) on delete cascade,
    scheduled_time timestamptz not null,
    message_type   varchar(20) default 'text',
    message_status varchar(20) default 'pending',
    message_text   text,
    created_at     timestamptz default now()
);

/* 2-e Google OAuth credentials */
create table public.google_credentials (
    realtor_id    uuid primary key references public.realtor(realtor_id) on delete cascade,
    access_token  varchar(255) not null,
    refresh_token varchar(255) not null,
    token_expires timestamptz not null,
    created_at    timestamptz default now()
);

/* 2-f Synced Google Calendar events */
create table public.google_calendar_events (
    id              bigserial primary key,
    realtor_id      uuid not null references public.realtor(realtor_id) on delete cascade,
    google_event_id varchar(255) not null,
    summary         varchar(255),
    description     text,
    start_time      timestamptz not null,
    end_time        timestamptz not null,
    created_at      timestamptz default now()
);
create index on public.google_calendar_events(google_event_id);

