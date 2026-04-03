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

-- ── Hero ────────────────────────────────────────────────────
('hero_subtitle',   'Hero — small label above main title',         'en', 'text',  'Beyond the Dunes'),
('hero_title_1',    'Hero — first line of main heading',           'en', 'text',  'Arabian'),
('hero_title_2',    'Hero — second line of main heading',          'en', 'text',  'Elegance <span class="text-3xl md:text-6xl text-gold not-italic">أناقة</span>'),
('hero_cta_btn',    'Hero — call-to-action button label',          'en', 'text',  'Discover the Tent'),
('hero_bg',         'Hero — full-screen background image',         'all','image', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2500&auto=format&fit=crop'),

-- ── Journeys Section Header ──────────────────────────────────
('journeys_title',  'Journeys — section heading',                  'en', 'text',  'Curated Journeys <br><span class="text-gold italic">رحلاتنا</span>'),
('journeys_desc',   'Journeys — section sub-description',          'en', 'text',  'Discover our meticulously crafted itineraries, ranging from week-long escapes to grand three-week odysseys across the Arabian Peninsula.'),

-- ── Journey 1 ───────────────────────────────────────────────
('journey_1_duration','Journey 1 — duration label',                'en', 'text',  '7 Days'),
('journey_1_title',  'Journey 1 — package name',                   'en', 'text',  'The Empty Quarter Escape'),
('journey_1_desc',   'Journey 1 — short description',              'en', 'text',  'Venture into the Rub'' al Khali, the largest continuous sand desert in the world. Experience shifting sands, sleep under unpolluted stars, and discover ancient Bedouin survival secrets.'),
('journey_1',        'Journey 1 — card image',                     'all','image', 'https://i.pinimg.com/736x/5f/6a/03/5f6a03115e89826a2cfea8d13a17e9b4.jpg'),

-- ── Journey 2 ───────────────────────────────────────────────
('journey_2_duration','Journey 2 — duration label',                'en', 'text',  '14 Days'),
('journey_2_title',  'Journey 2 — package name',                   'en', 'text',  'The Bedouin Heritage Trail'),
('journey_2_desc',   'Journey 2 — short description',              'en', 'text',  'A profound two-week journey tracing ancient trading routes. Blend the rugged beauty of Omani mountains with pristine UAE dunes, exploring ancient forts and vibrant souks.'),
('journey_2',        'Journey 2 — card image',                     'all','image', 'asset/199b165ae84ce4330562a6b64dc6d35f.jpg'),

-- ── Journey 3 ───────────────────────────────────────────────
('journey_3_duration','Journey 3 — duration label',                'en', 'text',  '21 Days'),
('journey_3_title',  'Journey 3 — package name',                   'en', 'text',  'The Grand Arabian Odyssey'),
('journey_3_desc',   'Journey 3 — short description',              'en', 'text',  'The ultimate expression of Arabian luxury. Traverse breathtaking landscapes of Saudi Arabia, UAE, and Oman. From ancient Nabataean tombs to futuristic skylines.'),
('journey_3',        'Journey 3 — card image',                     'all','image', 'asset/40301ed4c72e4eae80b704b36d5d0a79.jpg'),

-- ── Core Values Header ───────────────────────────────────────
('values_title',    'Values — section heading',                    'en', 'text',  'Rooted in tradition, <br><span class="text-gold italic">elevated for the modern explorer.</span>'),
('values_desc',     'Values — section sub-description',            'en', 'text',  'Khaymah offers an exclusive gateway to the majestic Arabian landscapes, blending ancient Bedouin hospitality with unparalleled luxury.'),

-- ── Value Cards ──────────────────────────────────────────────
('value_1_title',   'Value 1 — card title',                        'en', 'text',  'Cultural Immersion'),
('value_1_desc',    'Value 1 — card description',                  'en', 'text',  'Authentic encounters with local artisans, historians, and the timeless desert way of life.'),
('value_1',         'Value 1 — card image',                        'all','image', 'asset/cd7d742d0ed9f76280d4da97afa68406.jpg'),

('value_2_title',   'Value 2 — card title',                        'en', 'text',  'Refined Comfort'),
('value_2_desc',    'Value 2 — card description',                  'en', 'text',  'Sleep under the stars in lavishly appointed tents that rival the world''s finest suites.'),
('value_2',         'Value 2 — card image',                        'all','image', 'asset/d9e44f65accb5369adcbcadfb068832d.jpg'),

('value_3_title',   'Value 3 — card title',                        'en', 'text',  'Absolute Serenity'),
('value_3_desc',    'Value 3 — card description',                  'en', 'text',  'Escape the noise. Find peace in the vast, silent expanse of the golden dunes.'),
('value_3',         'Value 3 — card image',                        'all','image', 'asset/22febb8e78ececbb188e6d81f386d563.jpg'),

-- ── Concierge CTA ───────────────────────────────────────────
('concierge_label', 'Concierge CTA — eyebrow label',               'en', 'text',  'Royal Concierge'),
('concierge_title', 'Concierge CTA — main heading',                 'en', 'text',  'Craft Your <span class="italic text-gold">Bespoke</span> Journey'),
('concierge_desc',  'Concierge CTA — description paragraph',        'en', 'text',  'Connect directly with our dedicated Royal Concierge. Share your desires, and we will intricately tailor an uncompromised Arabian odyssey exclusively for you.'),
('concierge_bg',    'Concierge CTA — section background image',     'all','image', 'https://images.unsplash.com/photo-1541785501309-c12d4d98a9d1?q=80&w=2500&auto=format&fit=crop'),

-- ── Footer ──────────────────────────────────────────────────
('footer_tagline',  'Footer — brand tagline paragraph',             'en', 'text',  'Rooted in tradition, elevated for the modern explorer. Experience the majestic Arabian landscapes with unparalleled luxury.'),
('footer_email',    'Footer — contact email address',               'en', 'text',  'concierge@khaymah.com'),

-- ── About Page Images ────────────────────────────────────────
('about_story',     'About — story section hero image',             'all','image', 'https://i.pinimg.com/736x/5f/6a/03/5f6a03115e89826a2cfea8d13a17e9b4.jpg'),
('gallery_1',       'About — gallery image 1',                      'all','image', 'asset/5f6a03115e89826a2cfea8d13a17e9b4.jpg'),
('gallery_2',       'About — gallery image 2',                      'all','image', 'asset/199b165ae84ce4330562a6b64dc6d35f.jpg'),
('gallery_3',       'About — gallery image 3',                      'all','image', 'asset/d9e44f65accb5369adcbcadfb068832d.jpg'),
('gallery_4',       'About — gallery image 4',                      'all','image', 'asset/cd7d742d0ed9f76280d4da97afa68406.jpg')

on conflict (key) do nothing;
