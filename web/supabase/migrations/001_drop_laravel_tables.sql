-- Migration 001: Drop Laravel residual tables
-- These were created by Laravel Breeze during the pre-Next.js phase.
-- The app now uses Supabase Auth — none of these tables are referenced.

DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.migrations;
