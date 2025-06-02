-- ─────────────────────────────────────────────────────────────
-- 0. Enable required extensions (uuid generator)
-- ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- for gen_random_uuid()

-- ─────────────────────────────────────────────────────────────
-- 1. ENUM types
--    (one type per logical field; reuse across tables)
-- ─────────────────────────────────────────────────────────────
create type lead_state_t        as enum ('Booked','Hot','Warm','Cold');
create type home_type_t         as enum ('Single Family','Condo','Townhouse','Mobile Home','Land');
create type home_built_t        as enum ('2000 or later','1990s','1980s','1970s','1960s','Before 1960');
create type home_worth_t        as enum ('$300K or less','$300K - $600K','$600K - $900K',
                                         '$900K - $1.2M','$1.2M or more');
create type sell_time_t         as enum ('ASAP','1-3 months','3-6 months','6-12 months','12+ months');
create type home_condition_t    as enum ('Needs nothing','Needs a little work',
                                         'Needs significant work','Tear down');
create type yes_no_t            as enum ('No','Yes');

-- ─────────────────────────────────────────────────────────────
-- 2. Core tables
-- ─────────────────────────────────────────────────────────────

/* 2-a  Realtors */
create table public.realtors (
    realtor_id   bigserial primary key,
    uuid         uuid       not null unique default gen_random_uuid(),
    phone        varchar(50)  not null,
    f_name       varchar(125) not null,
    e_name       varchar(125) not null,
    video_url    varchar(600),
    email        varchar(255),
    website_url  varchar(600),
    time_zone 
    created_at   timestamptz default now()
);

create index on public.realtors(uuid);

/* 2-b  Leads */
create table public.leads (
    phone                varchar(50) primary key,
    realtor_id           bigint      not null references public.realtors(realtor_id) on delete cascade,
    first_name           varchar(127),
    last_name            varchar(127),
    address              varchar(255),
    lead_state           lead_state_t,
    home_type            home_type_t,
    home_built           home_built_t,
    home_worth           home_worth_t,
    sell_time            sell_time_t,
    home_condition       home_condition_t,
    working_with_agent   yes_no_t,
    looking_to_buy       yes_no_t,
    ad_id                varchar(50),
    tracking_parameters  varchar(255),
    sent_schedule_reminder yes_no_t default 'No',
    created_at           timestamptz default now()
);

/* 2-c  Booked calls / appointments */
create table public.booked (
    phone        varchar(50) primary key references public.leads(phone) on delete cascade,
    full_name    varchar(255) not null,
    booked_date  date,
    booked_time  time,
    time_zone    varchar(100),
    realtor_id   bigint not null references public.realtors(realtor_id) on delete cascade,
    created_at   timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. Seed data – four realtors
--    (HTML in video_url is quoted with $$ to avoid escaping hell)
-- ─────────────────────────────────────────────────────────────
insert into public.realtors
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
