-- ============================================================
-- Khaymah CMS — Supabase Setup & Seed Script
-- Run this in the Supabase SQL Editor to initialize the table
-- and seed all home page content keys.
-- ============================================================

-- 1. Create the table (skip if it already exists)
create table if not exists site_content (
    id          uuid primary key default gen_random_uuid(),
    key         text not null unique,
    description text,
    lang        text not null default 'en',   -- 'en' | 'zh' | 'all'
    type        text not null default 'text', -- 'text' | 'image'
    value       text not null default '',
    updated_at  timestamptz default now()
);

-- Enable Row Level Security
alter table site_content enable row level security;

-- Allow public reads (for the website frontend)
drop policy if exists "Public read access" on site_content;
create policy "Public read access"
    on site_content for select
    using (true);

-- Allow authenticated writes (for the admin panel)
drop policy if exists "Authenticated write access" on site_content;
create policy "Authenticated write access"
    on site_content for all
    using (auth.role() = 'authenticated');

-- ============================================================
-- 2. Seed default content
--    ON CONFLICT (key) DO NOTHING means existing rows are safe.
-- ============================================================

insert into site_content (key, description, lang, type, value) values

-- ── Hero ─────────────────────────────────────────────────────────────────────
('hero_subtitle',   'Hero — small label above main title',          'en', 'text',  'Beyond the Dunes'),
('hero_title_1',    'Hero — first line of main heading',            'en', 'text',  'Arabian'),
('hero_cta_btn',    'Hero — call-to-action button label',           'en', 'text',  'Discover the Tent'),
('hero_bg',         'Hero — full-screen background image',          'all','image', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2500&auto=format&fit=crop'),

-- ── Journeys Section Header ───────────────────────────────────────────────────
('journeys_title',  'Journeys — section heading',                   'en', 'text',  'Curated Journeys'),
('journeys_desc',   'Journeys — section sub-description',           'en', 'text',  'Discover our meticulously crafted itineraries, ranging from week-long escapes to grand three-week odysseys across the Arabian Peninsula.'),

-- ── Journey 1 ────────────────────────────────────────────────────────────────
('journey_1_duration', 'Journey 1 — duration label',               'en', 'text',  '7 Days'),
('journey_1_title',    'Journey 1 — package name',                  'en', 'text',  'The Empty Quarter Escape'),
('journey_1_desc',     'Journey 1 — short description',             'en', 'text',  'Venture into the vast Rub al Khali. Experience shifting sands, sleep under unpolluted stars, and discover ancient Bedouin survival secrets.'),
('journey_1',          'Journey 1 — card image',                    'all','image', 'https://i.pinimg.com/736x/5f/6a/03/5f6a03115e89826a2cfea8d13a17e9b4.jpg'),

-- ── Journey 2 ────────────────────────────────────────────────────────────────
('journey_2_duration', 'Journey 2 — duration label',               'en', 'text',  '14 Days'),
('journey_2_title',    'Journey 2 — package name',                  'en', 'text',  'The Bedouin Heritage Trail'),
('journey_2_desc',     'Journey 2 — short description',             'en', 'text',  'A profound two-week journey tracing ancient trading routes across Omani mountains and UAE dunes.'),
('journey_2',          'Journey 2 — card image',                    'all','image', '/asset/199b165ae84ce4330562a6b64dc6d35f.jpg'),

-- ── Journey 3 ────────────────────────────────────────────────────────────────
('journey_3_duration', 'Journey 3 — duration label',               'en', 'text',  '21 Days'),
('journey_3_title',    'Journey 3 — package name',                  'en', 'text',  'The Grand Arabian Odyssey'),
('journey_3_desc',     'Journey 3 — short description',             'en', 'text',  'The ultimate expression of Arabian luxury across Saudi Arabia, UAE, and Oman.'),
('journey_3',          'Journey 3 — card image',                    'all','image', '/asset/40301ed4c72e4eae80b704b36d5d0a79.jpg'),

-- ── Core Values Header ────────────────────────────────────────────────────────
('values_title',    'Values — section heading',                     'en', 'text',  'Rooted in tradition, elevated for the modern explorer.'),
('values_desc',     'Values — section sub-description',             'en', 'text',  'Khaymah offers an exclusive gateway blending ancient Bedouin hospitality with unparalleled luxury.'),

-- ── Value Cards ───────────────────────────────────────────────────────────────
('value_1_title',   'Value 1 — card title',                         'en', 'text',  'Cultural Immersion'),
('value_1_desc',    'Value 1 — card description',                   'en', 'text',  'Authentic encounters with local artisans, historians, and the timeless desert way of life.'),
('value_1',         'Value 1 — card image',                         'all','image', '/asset/cd7d742d0ed9f76280d4da97afa68406.jpg'),
('value_2_title',   'Value 2 — card title',                         'en', 'text',  'Refined Comfort'),
('value_2_desc',    'Value 2 — card description',                   'en', 'text',  'Sleep under the stars in lavishly appointed tents that rival the finest suites.'),
('value_2',         'Value 2 — card image',                         'all','image', '/asset/d9e44f65accb5369adcbcadfb068832d.jpg'),
('value_3_title',   'Value 3 — card title',                         'en', 'text',  'Absolute Serenity'),
('value_3_desc',    'Value 3 — card description',                   'en', 'text',  'Escape the noise. Find peace in the vast, silent expanse of the golden dunes.'),
('value_3',         'Value 3 — card image',                         'all','image', '/asset/22febb8e78ececbb188e6d81f386d563.jpg'),

-- ── Concierge CTA ────────────────────────────────────────────────────────────
('concierge_label', 'Concierge CTA — eyebrow label',                'en', 'text',  'Royal Concierge'),
('concierge_title', 'Concierge CTA — main heading',                 'en', 'text',  'Craft Your Bespoke Journey'),
('concierge_desc',  'Concierge CTA — description paragraph',        'en', 'text',  'Connect directly with our dedicated Royal Concierge. Share your desires, and we will intricately tailor an uncompromised Arabian odyssey exclusively for you.'),
('concierge_bg',    'Concierge CTA — background image',             'all','image', 'https://images.unsplash.com/photo-1541785501309-c12d4d98a9d1?q=80&w=2500&auto=format&fit=crop'),

-- ── Footer ───────────────────────────────────────────────────────────────────
('footer_tagline',  'Footer — brand tagline paragraph',             'en', 'text',  'Rooted in tradition, elevated for the modern explorer. Experience the majestic Arabian landscapes with unparalleled luxury.'),
('footer_email',    'Footer — contact email address',               'en', 'text',  'concierge@khaymah.com'),

-- ── About Page Images ─────────────────────────────────────────────────────────
('about_story',     'About — story section hero image',             'all','image', '/asset/5f6a03115e89826a2cfea8d13a17e9b4.jpg'),
('gallery_1',       'About — gallery image 1',                      'all','image', '/asset/5f6a03115e89826a2cfea8d13a17e9b4.jpg'),
('gallery_2',       'About — gallery image 2',                      'all','image', '/asset/199b165ae84ce4330562a6b64dc6d35f.jpg'),
('gallery_3',       'About — gallery image 3',                      'all','image', '/asset/d9e44f65accb5369adcbcadfb068832d.jpg'),
('gallery_4',       'About — gallery image 4',                      'all','image', '/asset/cd7d742d0ed9f76280d4da97afa68406.jpg'),

-- ── Journey 1 — Day Images (Empty Quarter Escape) ────────────────────────────
('dubai_1',         'J1 Day 1 — Dubai arrival image 1',             'all','image', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop'),
('dubai_2',         'J1 Day 1 — Dubai arrival image 2',             'all','image', 'https://images.unsplash.com/photo-1582672060624-cb87e076644f?q=80&w=800&auto=format&fit=crop'),
('dubai_3',         'J1 Day 1 — Dubai arrival image 3',             'all','image', 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?q=80&w=800&auto=format&fit=crop'),
('liwa_1',          'J1 Day 2 — Liwa Oasis image 1',                'all','image', 'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?q=80&w=800&auto=format&fit=crop'),
('liwa_2',          'J1 Day 2 — Liwa Oasis image 2',                'all','image', 'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=800&auto=format&fit=crop'),
('liwa_3',          'J1 Day 2 — Liwa Oasis image 3',                'all','image', 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop'),
('empty_quarter_1', 'J1 Day 3 — Empty Quarter image 1',             'all','image', 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=800&auto=format&fit=crop'),
('empty_quarter_2', 'J1 Day 3 — Empty Quarter image 2',             'all','image', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop'),
('empty_quarter_3', 'J1 Day 3 — Empty Quarter image 3',             'all','image', 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?q=80&w=800&auto=format&fit=crop'),
('bedouin_1',       'J1 Day 4 — Bedouin heritage image 1',          'all','image', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=800&auto=format&fit=crop'),
('bedouin_2',       'J1 Day 4 — Bedouin heritage image 2',          'all','image', 'https://images.unsplash.com/photo-1502049534556-94e823f95e31?q=80&w=800&auto=format&fit=crop'),
('bedouin_3',       'J1 Day 4 — Bedouin heritage image 3',          'all','image', 'https://images.unsplash.com/photo-1489493173507-6feea31f12ff?q=80&w=800&auto=format&fit=crop'),
('abu_dhabi_1',     'J1 Day 5 — Abu Dhabi image 1',                 'all','image', 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?q=80&w=800&auto=format&fit=crop'),
('abu_dhabi_2',     'J1 Day 5 — Abu Dhabi image 2',                 'all','image', 'https://images.unsplash.com/photo-1551043047-1d2adf00f3fd?q=80&w=800&auto=format&fit=crop'),
('abu_dhabi_3',     'J1 Day 5 — Abu Dhabi image 3',                 'all','image', 'https://images.unsplash.com/photo-1580674684081-776742d40003?q=80&w=800&auto=format&fit=crop'),
('louvre_1',        'J1 Day 6 — Louvre Abu Dhabi image 1',          'all','image', 'https://images.unsplash.com/photo-1563804860475-438e12450091?q=80&w=800&auto=format&fit=crop'),
('louvre_2',        'J1 Day 6 — Louvre Abu Dhabi image 2',          'all','image', 'https://images.unsplash.com/photo-1582650816912-30232231261a?q=80&w=800&auto=format&fit=crop'),
('mosque_3',        'J1 Day 6 — Sheikh Zayed Mosque image',         'all','image', 'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=800&auto=format&fit=crop'),
('departure_1',     'J1 Day 7 — Departure image 1',                 'all','image', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'),
('departure_2',     'J1 Day 7 — Departure image 2',                 'all','image', 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=800&auto=format&fit=crop'),
('departure_3',     'J1 Day 7 — Departure image 3',                 'all','image', 'https://images.unsplash.com/photo-1569154941061-e231b4732ef1?q=80&w=800&auto=format&fit=crop'),

-- ── Journey 2 — Day Images (Bedouin Heritage Trail) ──────────────────────────
('musandam_1',      'J2 — Musandam Fjords image 1',                 'all','image', 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop'),
('musandam_2',      'J2 — Musandam Fjords image 2',                 'all','image', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop'),
('musandam_3',      'J2 — Musandam Fjords image 3',                 'all','image', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'),
('nizwa_1',         'J2 — Nizwa Fort image 1',                      'all','image', 'https://images.unsplash.com/photo-1558618047-f4e60c8abe1e?q=80&w=800&auto=format&fit=crop'),
('nizwa_2',         'J2 — Nizwa Fort image 2',                      'all','image', 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?q=80&w=800&auto=format&fit=crop'),
('nizwa_3',         'J2 — Nizwa Fort image 3',                      'all','image', 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?q=80&w=800&auto=format&fit=crop'),
('wahiba_1',        'J2 — Wahiba Sands image 1',                    'all','image', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop'),
('wahiba_2',        'J2 — Wahiba Sands image 2',                    'all','image', 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=800&auto=format&fit=crop'),
('wahiba_3',        'J2 — Wahiba Sands image 3',                    'all','image', 'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=800&auto=format&fit=crop'),

-- ── Journey 3 — Day Images (Grand Arabian Odyssey) ───────────────────────────
('riyadh_1',        'J3 — Riyadh image 1',                          'all','image', 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=800&auto=format&fit=crop'),
('riyadh_2',        'J3 — Riyadh image 2',                          'all','image', 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?q=80&w=800&auto=format&fit=crop'),
('riyadh_3',        'J3 — Riyadh image 3',                          'all','image', 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?q=80&w=800&auto=format&fit=crop'),
('alula_1',         'J3 — AlUla image 1',                           'all','image', 'https://images.unsplash.com/photo-1612979510547-f7e4af486e4b?q=80&w=800&auto=format&fit=crop'),
('alula_2',         'J3 — AlUla image 2',                           'all','image', 'https://images.unsplash.com/photo-1552836021-a7af1ce36f14?q=80&w=800&auto=format&fit=crop'),
('alula_3',         'J3 — AlUla image 3',                           'all','image', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop'),
('oman_mt_1',       'J3 — Oman Mountains image 1',                  'all','image', 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?q=80&w=800&auto=format&fit=crop'),
('oman_mt_2',       'J3 — Oman Mountains image 2',                  'all','image', 'https://images.unsplash.com/photo-1558618047-f4e60c8abe1e?q=80&w=800&auto=format&fit=crop'),
('oman_mt_3',       'J3 — Oman Mountains image 3',                  'all','image', 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?q=80&w=800&auto=format&fit=crop'),
('salalah_1',       'J3 — Salalah image 1',                         'all','image', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'),
('salalah_2',       'J3 — Salalah image 2',                         'all','image', 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=800&auto=format&fit=crop'),
('salalah_3',       'J3 — Salalah image 3',                         'all','image', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop')

on conflict (key) do nothing;
