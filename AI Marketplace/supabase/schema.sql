-- AI Marketplace Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS & AUTH
-- ============================================================

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text,
    avatar_url text,
    role text default 'user' check (role in ('user', 'creator', 'admin')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
    insert into public.users (id, email, full_name, avatar_url)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- RLS for users
alter table public.users enable row level security;

create policy "Users can view own profile" on public.users
    for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
    for update using (auth.uid() = id);

create policy "Admins can view all users" on public.users
    for select using (
        exists (select 1 from public.users where id = auth.uid() and role = 'admin')
    );

-- ============================================================
-- CREATORS
-- ============================================================

create table if not exists public.creators (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid unique not null references public.users(id) on delete cascade,
    display_name text not null,
    bio text,
    website text,
    github text,
    twitter text,
    verified boolean default false,
    verification_documents jsonb default '[]',
    total_models integer default 0,
    total_deployments integer default 0,
    average_rating numeric(3,2) default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_creators_user_id on public.creators(user_id);
create index idx_creators_verified on public.creators(verified);

alter table public.creators enable row level security;

create policy "Anyone can view verified creators" on public.creators
    for select using (verified = true);

create policy "Creators can view own profile" on public.creators
    for select using (user_id = auth.uid());

create policy "Creators can update own profile" on public.creators
    for update using (user_id = auth.uid());

create policy "Users can apply to become creator" on public.creators
    for insert with check (user_id = auth.uid());

-- ============================================================
-- MODELS
-- ============================================================

create table if not exists public.models (
    id uuid primary key default uuid_generate_v4(),
    creator_id uuid not null references public.creators(id) on delete cascade,
    name text not null,
    slug text unique not null,
    description text not null,
    task_type text not null check (task_type in (
        'object_detection', 'image_classification', 'segmentation',
        'text_generation', 'speech_recognition', 'text_to_speech',
        'image_generation', 'embedding', 'other'
    )),
    license text not null,
    repository_url text,
    homepage_url text,
    tags text[] default '{}',
    is_public boolean default true,
    is_featured boolean default false,
    total_deployments integer default 0,
    average_rating numeric(3,2) default 0,
    review_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_models_creator_id on public.models(creator_id);
create index idx_models_task_type on public.models(task_type);
create index idx_models_is_public on public.models(is_public);
create index idx_models_is_featured on public.models(is_featured);
create index idx_models_slug on public.models(slug);
create index idx_models_tags on public.models using gin(tags);

alter table public.models enable row level security;

create policy "Anyone can view public models" on public.models
    for select using (is_public = true);

create policy "Creators can view own models" on public.models
    for select using (creator_id in (select id from public.creators where user_id = auth.uid()));

create policy "Creators can insert own models" on public.models
    for insert with check (creator_id in (select id from public.creators where user_id = auth.uid()));

create policy "Creators can update own models" on public.models
    for update using (creator_id in (select id from public.creators where user_id = auth.uid()));

create policy "Creators can delete own models" on public.models
    for delete using (creator_id in (select id from public.creators where user_id = auth.uid()));

-- ============================================================
-- MODEL VERSIONS
-- ============================================================

create table if not exists public.model_versions (
    id uuid primary key default uuid_generate_v4(),
    model_id uuid not null references public.models(id) on delete cascade,
    version text not null,
    changelog text,
    model_file_url text,
    config_file_url text,
    weights_hash text,
    framework text not null check (framework in ('pytorch', 'tensorflow', 'onnx', 'tensorrt', 'ggml', 'other')),
    framework_version text,
    python_version text,
    dependencies jsonb default '{}',
    min_vram_mb integer,
    min_ram_mb integer,
    supported_hardware text[] default '{}',
    input_schema jsonb,
    output_schema jsonb,
    is_default boolean default false,
    status text default 'draft' check (status in ('draft', 'published', 'deprecated')),
    published_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (model_id, version)
);

create index idx_model_versions_model_id on public.model_versions(model_id);
create index idx_model_versions_status on public.model_versions(status);
create index idx_model_versions_is_default on public.model_versions(is_default) where is_default = true;

alter table public.model_versions enable row level security;

create policy "Anyone can view published versions of public models" on public.model_versions
    for select using (
        status = 'published'
        and model_id in (select id from public.models where is_public = true)
    );

create policy "Creators can manage own model versions" on public.model_versions
    for all using (
        model_id in (select id from public.models where creator_id in (select id from public.creators where user_id = auth.uid()))
    );

-- ============================================================
-- BENCHMARKS
-- ============================================================

create table if not exists public.benchmarks (
    id uuid primary key default uuid_generate_v4(),
    model_version_id uuid not null references public.model_versions(id) on delete cascade,
    dataset_name text not null,
    dataset_version text,
    metric_name text not null,
    metric_value numeric not null,
    metric_unit text,
    hardware text not null,
    batch_size integer default 1,
    latency_ms numeric,
    throughput numeric,
    config jsonb default '{}',
    verified boolean default false,
    verified_by uuid references public.users(id),
    verified_at timestamptz,
    notes text,
    created_at timestamptz default now()
);

create index idx_benchmarks_model_version_id on public.benchmarks(model_version_id);
create index idx_benchmarks_dataset_metric on public.benchmarks(dataset_name, metric_name);
create index idx_benchmarks_hardware on public.benchmarks(hardware);
create index idx_benchmarks_verified on public.benchmarks(verified);

alter table public.benchmarks enable row level security;

create policy "Anyone can view benchmarks of published models" on public.benchmarks
    for select using (
        model_version_id in (
            select id from public.model_versions
            where status = 'published'
            and model_id in (select id from public.models where is_public = true)
        )
    );

create policy "Creators can manage benchmarks for own models" on public.benchmarks
    for all using (
        model_version_id in (
            select id from public.model_versions
            where model_id in (select id from public.models where creator_id in (select id from public.creators where user_id = auth.uid()))
        )
    );

-- ============================================================
-- PRICING
-- ============================================================

create table if not exists public.pricing (
    id uuid primary key default uuid_generate_v4(),
    model_id uuid not null references public.models(id) on delete cascade,
    model_version_id uuid references public.model_versions(id) on delete set null,
    pricing_model text not null check (pricing_model in ('free', 'per_inference', 'subscription', 'revenue_share')),
    price_value numeric,
    price_currency text default 'USD',
    billing_unit text,
    free_tier_limit integer,
    free_tier_unit text,
    minimum_commitment_months integer default 0,
    enterprise_contact boolean default false,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_pricing_model_id on public.pricing(model_id);
create index idx_pricing_model_version_id on public.pricing(model_version_id);
create index idx_pricing_is_active on public.pricing(is_active);

alter table public.pricing enable row level security;

create policy "Anyone can view pricing for public models" on public.pricing
    for select using (
        is_active = true
        and model_id in (select id from public.models where is_public = true)
    );

create policy "Creators can manage pricing for own models" on public.pricing
    for all using (
        model_id in (select id from public.models where creator_id in (select id from public.creators where user_id = auth.uid()))
    );

-- ============================================================
-- TRUST SCORES
-- ============================================================

create table if not exists public.trust_scores (
    id uuid primary key default uuid_generate_v4(),
    model_id uuid unique not null references public.models(id) on delete cascade,
    overall_score integer not null check (overall_score between 0 and 100),
    benchmark_score integer check (benchmark_score between 0 and 100),
    verification_score integer check (verification_score between 0 and 100),
    community_score integer check (community_score between 0 and 100),
    security_score integer check (security_score between 0 and 100),
    benchmark_details jsonb default '{}',
    verification_details jsonb default '{}',
    community_details jsonb default '{}',
    security_details jsonb default '{}',
    last_calculated_at timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_trust_scores_model_id on public.trust_scores(model_id);
create index idx_trust_scores_overall on public.trust_scores(overall_score desc);

alter table public.trust_scores enable row level security;

create policy "Anyone can view trust scores for public models" on public.trust_scores
    for select using (
        model_id in (select id from public.models where is_public = true)
    );

create policy "Creators can view trust scores for own models" on public.trust_scores
    for select using (
        model_id in (select id from public.models where creator_id in (select id from public.creators where user_id = auth.uid()))
    );

-- Only system/service role can update trust scores
create policy "Service role can manage trust scores" on public.trust_scores
    for all using (auth.role() = 'service_role');

-- ============================================================
-- REVIEWS
-- ============================================================

create table if not exists public.reviews (
    id uuid primary key default uuid_generate_v4(),
    model_id uuid not null references public.models(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    model_version_id uuid references public.model_versions(id) on delete set null,
    rating integer not null check (rating between 1 and 5),
    title text,
    content text,
    pros text[],
    cons text[],
    hardware_used text,
    use_case text,
    verified_purchase boolean default false,
    helpful_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique (model_id, user_id)
);

create index idx_reviews_model_id on public.reviews(model_id);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_rating on public.reviews(rating);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews for public models" on public.reviews
    for select using (
        model_id in (select id from public.models where is_public = true)
    );

create policy "Authenticated users can create reviews" on public.reviews
    for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews" on public.reviews
    for update using (auth.uid() = user_id);

create policy "Users can delete own reviews" on public.reviews
    for delete using (auth.uid() = user_id);

-- ============================================================
-- DEPLOYMENTS
-- ============================================================

create table if not exists public.deployments (
    id uuid primary key default uuid_generate_v4(),
    model_id uuid not null references public.models(id) on delete cascade,
    model_version_id uuid references public.model_versions(id) on delete set null,
    user_id uuid not null references public.users(id) on delete cascade,
    deployment_type text not null check (deployment_type in ('docker', 'serverless', 'edge_binary', 'api_endpoint', 'local')),
    status text default 'pending' check (status in ('pending', 'building', 'running', 'stopped', 'failed', 'deleted')),
    configuration jsonb default '{}',
    endpoint_url text,
    docker_image text,
    resource_limits jsonb default '{}',
    region text,
    started_at timestamptz,
    stopped_at timestamptz,
    error_message text,
    inference_count bigint default 0,
    total_latency_ms bigint default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_deployments_user_id on public.deployments(user_id);
create index idx_deployments_model_id on public.deployments(model_id);
create index idx_deployments_status on public.deployments(status);
create index idx_deployments_deployment_type on public.deployments(deployment_type);

alter table public.deployments enable row level security;

create policy "Users can view own deployments" on public.deployments
    for select using (user_id = auth.uid());

create policy "Users can create own deployments" on public.deployments
    for insert with check (user_id = auth.uid());

create policy "Users can update own deployments" on public.deployments
    for update using (user_id = auth.uid());

create policy "Creators can view deployments of own models" on public.deployments
    for select using (
        model_id in (select id from public.models where creator_id in (select id from public.creators where user_id = auth.uid()))
    );

-- ============================================================
-- MODEL COMPARISONS (saved comparisons)
-- ============================================================

create table if not exists public.model_comparisons (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    name text,
    model_ids uuid[] not null,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index idx_model_comparisons_user_id on public.model_comparisons(user_id);

alter table public.model_comparisons enable row level security;

create policy "Users can manage own comparisons" on public.model_comparisons
    for all using (user_id = auth.uid());

-- ============================================================
-- AI ADVISOR QUERIES (for analytics)
-- ============================================================

create table if not exists public.advisor_queries (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete set null,
    query_text text not null,
    parsed_requirements jsonb,
    recommended_model_ids uuid[],
    response_summary text,
    created_at timestamptz default now()
);

create index idx_advisor_queries_user_id on public.advisor_queries(user_id);
create index idx_advisor_queries_created_at on public.advisor_queries(created_at desc);

alter table public.advisor_queries enable row level security;

create policy "Users can view own queries" on public.advisor_queries
    for select using (user_id = auth.uid() or user_id is null);

create policy "Users can create queries" on public.advisor_queries
    for insert with check (user_id = auth.uid() or user_id is null);

create policy "Service role can view all queries" on public.advisor_queries
    for select using (auth.role() = 'service_role');

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger update_users_updated_at before update on public.users for each row execute function public.update_updated_at_column();
create trigger update_creators_updated_at before update on public.creators for each row execute function public.update_updated_at_column();
create trigger update_models_updated_at before update on public.models for each row execute function public.update_updated_at_column();
create trigger update_model_versions_updated_at before update on public.model_versions for each row execute function public.update_updated_at_column();
create trigger update_pricing_updated_at before update on public.pricing for each row execute function public.update_updated_at_column();
create trigger update_trust_scores_updated_at before update on public.trust_scores for each row execute function public.update_updated_at_column();
create trigger update_reviews_updated_at before update on public.reviews for each row execute function public.update_updated_at_column();
create trigger update_deployments_updated_at before update on public.deployments for each row execute function public.update_updated_at_column();
create trigger update_model_comparisons_updated_at before update on public.model_comparisons for each row execute function public.update_updated_at_column();

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Public models with creator info and latest version
create or replace view public.public_models as
select
    m.*,
    c.display_name as creator_name,
    c.verified as creator_verified,
    mv.version as latest_version,
    mv.framework as latest_framework,
    mv.min_vram_mb,
    mv.supported_hardware,
    p.pricing_model,
    p.price_value,
    p.price_currency,
    p.billing_unit,
    p.free_tier_limit,
    ts.overall_score as trust_score
from public.models m
join public.creators c on m.creator_id = c.id
left join lateral (
    select * from public.model_versions
    where model_id = m.id and status = 'published'
    order by published_at desc nulls last, created_at desc
    limit 1
) mv on true
left join lateral (
    select * from public.pricing
    where model_id = m.id and is_active = true
    order by case pricing_model when 'free' then 0 else 1 end, price_value asc nulls last
    limit 1
) p on true
left join public.trust_scores ts on m.id = ts.model_id
where m.is_public = true;

-- ============================================================
-- SEED DATA (optional - for testing)
-- ============================================================

-- Note: Seed data requires authenticated users. Add via application or Supabase dashboard.