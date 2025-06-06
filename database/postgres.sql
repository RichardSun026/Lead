-- ─────────────────────────────────────────────────────────────
-- drop any old objects that get in the way
--    (tables first, then ENUMs; CASCADE blows away dependents)
-- ─────────────────────────────────────────────────────────────
drop table if exists public.scheduled_messages cascade;
drop table if exists public.booked    cascade;
drop table if exists public.leads     cascade;
drop table if exists public.realtor   cascade;

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
-- ─────────────────────────────────────────────────────────────
-- 2. Core tables
-- ─────────────────────────────────────────────────────────────

/* 2-a  Realtors */
create table public.realtor (
    realtor_id   bigserial primary key,
    uuid         uuid       not null unique default gen_random_uuid(),
    phone        varchar(50)  not null,
    f_name       varchar(125) not null,
    e_name       varchar(125) not null,
    video_url    varchar(600),
    email        varchar(255),
    website_url  varchar(600),
    -- time_zone 
    created_at   timestamptz default now()
);

create index on public.realtor(uuid);

/* 2-b  Leads */
create table public.leads (
    phone                varchar(50) primary key,
    realtor_id           bigint      not null references public.realtor(realtor_id) on delete cascade,
    first_name           varchar(127),
    last_name            varchar(127),
    email                varchar(127),
    address              varchar(255),
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

/* 2-c  Booked calls / appointments */
create table public.booked (
    phone           varchar(50) primary key references public.leads(phone) on delete cascade,
    name            varchar(255) not null,
    appointment_time timestamptz,
    meeting_link    varchar(600),
    realtor_id      bigint not null references public.realtor(realtor_id) on delete cascade,
    created_at      timestamptz default now()
);

/* 2-d Scheduled messages for future SMS */
create table public.scheduled_messages (
    id             bigserial primary key,
    phone          varchar(50) not null references public.leads(phone) on delete cascade,
    realtor_id     bigint not null references public.realtor(realtor_id) on delete cascade,
    scheduled_time timestamptz not null,
    message_type   varchar(20) default 'text',
    message_status varchar(20) default 'pending',
    message_text   text,
    created_at     timestamptz default now()
);

/* 2-e Google OAuth credentials */
create table public.google_credentials (
    realtor_id    bigint primary key references public.realtor(realtor_id) on delete cascade,
    access_token  varchar(255) not null,
    refresh_token varchar(255) not null,
    token_expires timestamptz not null,
    created_at    timestamptz default now()
);

/* 2-f Synced Google Calendar events */
create table public.google_calendar_events (
    id              bigserial primary key,
    realtor_id      bigint not null references public.realtor(realtor_id) on delete cascade,
    google_event_id varchar(255) not null,
    summary         varchar(255),
    description     text,
    start_time      timestamptz not null,
    end_time        timestamptz not null,
    created_at      timestamptz default now()
);
create index on public.google_calendar_events(google_event_id);

-- ─────────────────────────────────────────────────────────────
-- 3. Seed data – four realtors
--    (HTML in video_url is quoted with $$ to avoid escaping hell)
-- ─────────────────────────────────────────────────────────────
insert into public.realtor
    (uuid, phone, f_name, e_name, video_url, email, website_url)
values
    ('a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f',
     '123-456-7890','Alice','Johnson',null,null,null),

    ('b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a',
     '123-456-7891','Bob','Smith',null,null,null),

    ('c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b',
     '123-456-7892','Carol','Davis',$$
<iframe src="https://player.vimeo.com/video/1068770376?h=fb9b1d993b&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        style="position:absolute;top:0;left:0;width:100%;height:100%;"
        title="IMG_5159"></iframe>$$,
     'sifontana1965@gmail.com','https://www.audi.com/en/'),

    ('f957761b-104e-416e-a550-25e010ca9302',
     '123-456-7893','Alfonso','Mac',$$
<iframe src="https://player.vimeo.com/video/1068770376?h=fb9b1d993b&amp;title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
        frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        style="position:absolute;top:0;left:0;width:100%;height:100%;"
        title="IMG_5159"></iframe>$$,
     'skovdepeter@gmail.com','https://www.ferrari.com/en-BR');
