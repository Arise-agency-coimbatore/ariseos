-- Run this SQL in your Supabase SQL Editor

-- 1. Create Leads Table
CREATE TABLE public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  status text check (status in ('New', 'Contacted', 'Negotiation', 'Closed')) default 'New',
  notes text,
  revenue_value numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Campaigns Table
CREATE TABLE public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  platform text not null,
  budget numeric default 0,
  clicks integer default 0,
  conversions integer default 0,
  start_date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Activities Table (for activity log)
CREATE TABLE public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'LEAD_ADDED', 'CAMPAIGN_CREATED', 'STATUS_UPDATED'
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY "Users can only view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own campaigns" ON public.campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own campaigns" ON public.campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Setup Realtime
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.activities;
