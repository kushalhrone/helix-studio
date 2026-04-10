
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'pm', 'submitter', 'viewer');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('intake', 'classified', 'in_triage', 'sprint_candidate', 'in_sprint', 'done', 'deferred');

-- Create enum for request category
CREATE TYPE public.request_category AS ENUM ('production_bug', 'client_commitment', 'usability_issue', 'new_feature', 'tech_enabler');

-- Create enum for urgency
CREATE TYPE public.request_urgency AS ENUM ('critical', 'high', 'medium', 'low');

-- Create enum for sprint status
CREATE TYPE public.sprint_status AS ENUM ('planning', 'active', 'completed');

-- Create enum for triage session status
CREATE TYPE public.triage_status AS ENUM ('scheduled', 'in_progress', 'completed');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has any privileged role (admin or pm)
CREATE OR REPLACE FUNCTION public.is_pm_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'pm')
  )
$$;

-- Auto-create profile and assign default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'submitter');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User roles RLS
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (true);

-- Sprints table
CREATE TABLE public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status sprint_status NOT NULL DEFAULT 'planning',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can view sprints" ON public.sprints FOR SELECT TO authenticated USING (true);
CREATE POLICY "PM/Admin can manage sprints" ON public.sprints FOR INSERT TO authenticated WITH CHECK (public.is_pm_or_admin(auth.uid()));
CREATE POLICY "PM/Admin can update sprints" ON public.sprints FOR UPDATE TO authenticated USING (public.is_pm_or_admin(auth.uid()));
CREATE POLICY "PM/Admin can delete sprints" ON public.sprints FOR DELETE TO authenticated USING (public.is_pm_or_admin(auth.uid()));

-- Requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_customer TEXT NOT NULL,
  urgency request_urgency NOT NULL DEFAULT 'medium',
  impact TEXT NOT NULL,
  workaround TEXT,
  size_estimate TEXT,
  request_type request_category,
  category request_category,
  status request_status NOT NULL DEFAULT 'intake',
  submitter_id UUID NOT NULL REFERENCES auth.users(id),
  sprint_id UUID REFERENCES public.sprints(id),
  date_received TIMESTAMPTZ NOT NULL DEFAULT now(),
  classified_at TIMESTAMPTZ,
  classified_by UUID REFERENCES auth.users(id),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_category ON public.requests(category);
CREATE INDEX idx_requests_submitter ON public.requests(submitter_id);

CREATE POLICY "Submitters can view own or PM/Admin view all" ON public.requests FOR SELECT TO authenticated
  USING (submitter_id = auth.uid() OR public.is_pm_or_admin(auth.uid()));
CREATE POLICY "Submitters can create requests" ON public.requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "PM/Admin can update requests" ON public.requests FOR UPDATE TO authenticated
  USING (public.is_pm_or_admin(auth.uid()));

-- Triage sessions table
CREATE TABLE public.triage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date TIMESTAMPTZ NOT NULL,
  status triage_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.triage_sessions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_triage_sessions_updated_at BEFORE UPDATE ON public.triage_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Authenticated can view triage sessions" ON public.triage_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "PM/Admin can manage triage sessions" ON public.triage_sessions FOR INSERT TO authenticated WITH CHECK (public.is_pm_or_admin(auth.uid()));
CREATE POLICY "PM/Admin can update triage sessions" ON public.triage_sessions FOR UPDATE TO authenticated USING (public.is_pm_or_admin(auth.uid()));

-- Sprint interrupts table
CREATE TABLE public.sprint_interrupts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id),
  sprint_id UUID NOT NULL REFERENCES public.sprints(id),
  reason TEXT NOT NULL,
  category_confirmation request_category NOT NULL,
  deprioritised_items TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sprint_interrupts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view interrupts" ON public.sprint_interrupts FOR SELECT TO authenticated USING (true);
CREATE POLICY "PM/Admin can create interrupts" ON public.sprint_interrupts FOR INSERT TO authenticated WITH CHECK (public.is_pm_or_admin(auth.uid()));

-- Audit log table (immutable)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PM/Admin can view audit log" ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_pm_or_admin(auth.uid()));
CREATE POLICY "System can insert audit log" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = changed_by);

-- Audit trigger function for requests
CREATE OR REPLACE FUNCTION public.audit_request_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    'requests',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_requests_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.audit_request_changes();
