-- ─────────────────────────────────────────────────────────────
-- drop any old objects that get in the way
--    (tables first, then ENUMs; CASCADE blows away dependents)
-- ─────────────────────────────────────────────────────────────
drop table if exists public.booked    cascade;
drop table if exists public.leads     cascade;
drop table if exists public.realtor  cascade;




-- ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";   -- for gen_random_uuid()
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
    name            varchar(127),
    email            varchar(127),
    address              varchar(255),
    lead_state           varchar(20),
    home_type            varchar(50),
    home_built           varchar(50),
    home_worth           varchar(50),
    sell_time            varchar(50),
    home_condition       varchar(50),
    working_with_agent   boolean,
    looking_to_buy       boolean,
    ad_id                varchar(50),
    sent_schedule_reminder boolean default false,
    created_at           timestamptz default now()
);

/* 2-c  Booked calls / appointments */
create table public.booked (
    phone        varchar(50) primary key references public.leads(phone) on delete cascade,
    name    varchar(255) not null,
    booked_date  date,
    booked_time  time,
    time_zone    varchar(100),
    realtor_id   bigint not null references public.realtor(realtor_id) on delete cascade,
    created_at   timestamptz default now()
);

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
