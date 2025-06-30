/*
  # Create users table for authentication and profile management

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `subscription_tier` (text, default 'free')
      - `created_at` (timestamptz, default now())
      - `last_active` (timestamptz, optional)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to view their own profile
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile

  3. Important Notes
    - The `id` field references `auth.users(id)` to link with Supabase Auth
    - Cascade delete ensures user profiles are removed when auth user is deleted
    - Default subscription tier is set to 'free' for new users
*/

-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free' NOT NULL CHECK (subscription_tier IN ('free', 'premium', 'pro')),
  created_at timestamptz DEFAULT now() NOT NULL,
  last_active timestamptz
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_subscription_tier_idx ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);