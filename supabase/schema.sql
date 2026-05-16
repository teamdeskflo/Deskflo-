-- ============================================================
-- DESKFLO — Complete Supabase Schema + RLS + Indexes
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ─────────────────────────────────────────────────

-- 1. Users (Freelancers) — extends Supabase auth.users
CREATE TABLE public.users (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  phone               TEXT,
  company_name        TEXT,
  logo_url            TEXT,
  brand_color         TEXT DEFAULT '#D4A017',
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial','active','cancelled','expired')),
  trial_starts_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_ends_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  next_billing_date   TIMESTAMPTZ,
  billing_plan        TEXT DEFAULT 'monthly' CHECK (billing_plan IN ('monthly','annual')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Clients
CREATE TABLE public.clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  company_name    TEXT,
  login_token     TEXT UNIQUE NOT NULL DEFAULT ('FREELANCER-CLIENT-' || upper(substring(md5(random()::text), 1, 8))),
  portal_access   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects
CREATE TABLE public.projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_hold','completed','cancelled')),
  budget        NUMERIC(12,2),
  deadline      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Files
CREATE TABLE public.files (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     BIGINT,
  file_type     TEXT,
  is_open_file  BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved   BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at   TIMESTAMPTZ,
  approved_ip   TEXT,
  viewed_at     TIMESTAMPTZ,
  viewed_ip     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Shared Links (approval/view URLs)
CREATE TABLE public.shared_links (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id         UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('approval','view')),
  slug            TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  clicks          INT NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Approval Logs
CREATE TABLE public.approval_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id     UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES public.clients(id),
  action      TEXT NOT NULL CHECK (action IN ('viewed','approved','rejected')),
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Invoices
CREATE TABLE public.invoices (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id            UUID NOT NULL REFERENCES public.clients(id),
  project_id           UUID REFERENCES public.projects(id),
  invoice_number       TEXT NOT NULL,
  amount               NUMERIC(12,2) NOT NULL,
  gst_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount         NUMERIC(12,2) NOT NULL,
  description          TEXT,
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  payment_link         TEXT,
  razorpay_payment_id  TEXT,
  due_date             DATE,
  paid_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Tasks
CREATE TABLE public.tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  priority      TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  due_date      DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Custom Messages (WhatsApp templates)
CREATE TABLE public.custom_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. White Label Settings
CREATE TABLE public.white_label_settings (
  freelancer_id   UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  logo_url        TEXT,
  brand_color     TEXT DEFAULT '#D4A017',
  hide_branding   BOOLEAN NOT NULL DEFAULT FALSE,
  portal_title    TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Activity Logs
CREATE TABLE public.activity_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Waitlist
CREATE TABLE public.waitlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL UNIQUE,
  name       TEXT,
  role       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification preferences (for Settings → Notifications page)
CREATE TABLE public.notification_preferences (
  freelancer_id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  email_new_project      BOOLEAN DEFAULT TRUE,
  email_file_approved    BOOLEAN DEFAULT TRUE,
  email_invoice_paid     BOOLEAN DEFAULT TRUE,
  email_task_due         BOOLEAN DEFAULT TRUE,
  whatsapp_new_project   BOOLEAN DEFAULT FALSE,
  whatsapp_file_approved BOOLEAN DEFAULT FALSE,
  whatsapp_invoice_paid  BOOLEAN DEFAULT TRUE,
  whatsapp_task_due      BOOLEAN DEFAULT FALSE,
  reminder_email         TEXT,
  reminder_time          TEXT DEFAULT '09:00',
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

ALTER TABLE public.users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_links             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist                 ENABLE ROW LEVEL SECURITY;

-- Helper: get current freelancer's id
CREATE OR REPLACE FUNCTION auth.freelancer_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;


-- USERS: freelancer can only see/edit their own row
CREATE POLICY "users_self"    ON public.users    FOR ALL USING (id = auth.uid());

-- CLIENTS: freelancer owns their clients
CREATE POLICY "clients_owner" ON public.clients  FOR ALL USING (freelancer_id = auth.uid());

-- PROJECTS: freelancer owns projects via clients they own
CREATE POLICY "projects_owner" ON public.projects FOR ALL
  USING (client_id IN (SELECT id FROM public.clients WHERE freelancer_id = auth.uid()));

-- FILES: freelancer owns files via projects
CREATE POLICY "files_owner" ON public.files FOR ALL
  USING (project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.clients c ON c.id = p.client_id
    WHERE c.freelancer_id = auth.uid()
  ));

-- SHARED_LINKS: all users can read (needed for approval links), owner can manage
CREATE POLICY "shared_links_read"   ON public.shared_links FOR SELECT USING (TRUE);
CREATE POLICY "shared_links_manage" ON public.shared_links FOR ALL
  USING (file_id IN (
    SELECT f.id FROM public.files f
    JOIN public.projects p ON p.id = f.project_id
    JOIN public.clients c ON c.id = p.client_id
    WHERE c.freelancer_id = auth.uid()
  ));

-- APPROVAL_LOGS: public insert (clients log approvals), owner can read
CREATE POLICY "approval_logs_insert" ON public.approval_logs FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "approval_logs_read"   ON public.approval_logs FOR SELECT
  USING (file_id IN (
    SELECT f.id FROM public.files f
    JOIN public.projects p ON p.id = f.project_id
    JOIN public.clients c ON c.id = p.client_id
    WHERE c.freelancer_id = auth.uid()
  ));

-- INVOICES
CREATE POLICY "invoices_owner" ON public.invoices FOR ALL USING (freelancer_id = auth.uid());

-- TASKS
CREATE POLICY "tasks_owner" ON public.tasks FOR ALL USING (freelancer_id = auth.uid());

-- CUSTOM_MESSAGES
CREATE POLICY "messages_owner" ON public.custom_messages FOR ALL USING (freelancer_id = auth.uid());

-- WHITE_LABEL_SETTINGS
CREATE POLICY "wl_owner" ON public.white_label_settings FOR ALL USING (freelancer_id = auth.uid());

-- ACTIVITY_LOGS
CREATE POLICY "activity_owner" ON public.activity_logs FOR ALL USING (freelancer_id = auth.uid());

-- NOTIFICATION_PREFERENCES
CREATE POLICY "notif_owner" ON public.notification_preferences FOR ALL USING (freelancer_id = auth.uid());

-- WAITLIST: anyone can insert, no one can read via API
CREATE POLICY "waitlist_insert" ON public.waitlist FOR INSERT WITH CHECK (TRUE);


-- ─── INDEXES ────────────────────────────────────────────────

CREATE INDEX idx_clients_freelancer      ON public.clients(freelancer_id);
CREATE INDEX idx_projects_client         ON public.projects(client_id);
CREATE INDEX idx_files_project           ON public.files(project_id);
CREATE INDEX idx_shared_links_slug       ON public.shared_links(slug);
CREATE INDEX idx_shared_links_file       ON public.shared_links(file_id);
CREATE INDEX idx_approval_logs_file      ON public.approval_logs(file_id);
CREATE INDEX idx_invoices_freelancer     ON public.invoices(freelancer_id);
CREATE INDEX idx_invoices_status         ON public.invoices(status);
CREATE INDEX idx_tasks_freelancer        ON public.tasks(freelancer_id);
CREATE INDEX idx_tasks_due               ON public.tasks(due_date) WHERE NOT is_completed;
CREATE INDEX idx_activity_logs_freelancer ON public.activity_logs(freelancer_id);
CREATE INDEX idx_activity_logs_created   ON public.activity_logs(created_at DESC);


-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- Run this separately or via the Supabase Dashboard → Storage

-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage RLS: only authenticated users can upload to their own folder
-- CREATE POLICY "owner_upload" ON storage.objects FOR INSERT
--   WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "owner_read" ON storage.objects FOR SELECT
--   USING (auth.uid()::text = (storage.foldername(name))[1] OR bucket_id IN ('avatars','logos'));


-- ─── FUNCTION: auto-create user profile on signup ───────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.white_label_settings (freelancer_id)
  VALUES (NEW.id);

  INSERT INTO public.notification_preferences (freelancer_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
