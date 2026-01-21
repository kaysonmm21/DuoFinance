-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type transaction_type as enum ('income', 'expense');
create type budget_period as enum ('monthly', 'weekly', 'yearly');

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  icon text default 'circle',
  color text default '#6366f1',
  type transaction_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Budgets table
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  amount decimal(12, 2) not null,
  period budget_period default 'monthly',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category_id)
);

-- Transactions table
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  amount decimal(12, 2) not null,
  type transaction_type not null,
  description text not null,
  date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_date on transactions(date);
create index idx_transactions_category_id on transactions(category_id);
create index idx_categories_user_id on categories(user_id);
create index idx_budgets_user_id on budgets(user_id);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table categories enable row level security;
alter table budgets enable row level security;
alter table transactions enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for categories
create policy "Users can view own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can create own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- RLS Policies for budgets
create policy "Users can view own budgets"
  on budgets for select
  using (auth.uid() = user_id);

create policy "Users can create own budgets"
  on budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on budgets for delete
  using (auth.uid() = user_id);

-- RLS Policies for transactions
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can create own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_categories_updated_at
  before update on categories
  for each row execute procedure update_updated_at_column();

create trigger update_budgets_updated_at
  before update on budgets
  for each row execute procedure update_updated_at_column();

create trigger update_transactions_updated_at
  before update on transactions
  for each row execute procedure update_updated_at_column();

-- Insert default categories for new users (optional function)
create or replace function create_default_categories(user_uuid uuid)
returns void as $$
begin
  -- Income categories
  insert into categories (user_id, name, icon, color, type) values
    (user_uuid, 'Salary', 'briefcase', '#22c55e', 'income'),
    (user_uuid, 'Freelance', 'laptop', '#10b981', 'income'),
    (user_uuid, 'Investments', 'trending-up', '#14b8a6', 'income'),
    (user_uuid, 'Other Income', 'plus-circle', '#06b6d4', 'income');

  -- Expense categories
  insert into categories (user_id, name, icon, color, type) values
    (user_uuid, 'Food & Dining', 'utensils', '#ef4444', 'expense'),
    (user_uuid, 'Transportation', 'car', '#f97316', 'expense'),
    (user_uuid, 'Shopping', 'shopping-bag', '#f59e0b', 'expense'),
    (user_uuid, 'Entertainment', 'gamepad-2', '#eab308', 'expense'),
    (user_uuid, 'Bills & Utilities', 'receipt', '#84cc16', 'expense'),
    (user_uuid, 'Healthcare', 'heart-pulse', '#ec4899', 'expense'),
    (user_uuid, 'Housing', 'home', '#8b5cf6', 'expense'),
    (user_uuid, 'Education', 'graduation-cap', '#6366f1', 'expense'),
    (user_uuid, 'Other Expenses', 'more-horizontal', '#64748b', 'expense');
end;
$$ language plpgsql security definer;
