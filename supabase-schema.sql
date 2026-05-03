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

-- 2. Create Clients Table
CREATE TABLE public.clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Projects Table
CREATE TABLE public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade,
  name text not null,
  status text check (status in ('Planning', 'Active', 'Completed', 'On Hold')) default 'Planning',
  due_date date,
  share_token uuid default gen_random_uuid() unique not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- If you already ran the schema before, run these ALTER commands instead:
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS share_token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL;
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false NOT NULL;

-- 4. Create Tasks Table
CREATE TABLE public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('To Do', 'In Progress', 'Done')) default 'To Do',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- If you already ran the schema, run these ALTER commands instead:
-- ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description text;
-- ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- 5. Create Activities Table (for activity log)
CREATE TABLE public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'LEAD_ADDED', 'PROJECT_CREATED', 'TASK_COMPLETED'
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies
CREATE POLICY "Users can only view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Public share policies (allows read-only via share link, no auth required)
CREATE POLICY "Public can view shared projects by token" ON public.projects
  FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view tasks of shared projects" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = tasks.project_id
      AND projects.is_public = true
    )
  );

-- 10. Setup Realtime
alter publication supabase_realtime add table public.leads;
alter publication supabase_realtime add table public.clients;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.activities;
