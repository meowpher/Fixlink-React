-- -----------------------------------------------------------------------------
-- FixLink Step 2: Supabase Auth Integration, Triggers & Row-Level Security (RLS)
-- -----------------------------------------------------------------------------

-- 1. Link profiles.id to Supabase auth.users
ALTER TABLE "public"."profiles" 
  DROP CONSTRAINT IF EXISTS "profiles_id_auth_users_fk";

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_auth_users_fk"
  FOREIGN KEY ("id") REFERENCES auth.users("id") ON DELETE CASCADE;

-- 2. Helper functions to get current user role and permissions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND role IN ('admin', 'facility_manager')
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_above()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND role IN ('admin', 'facility_manager', 'technician', 'staff')
      AND is_active = true
  );
$$;

-- 3. Automatic Profile Creation on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'staff'::public.user_role),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Automatic Ticket Number Sequence Generator
CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := 'FIX-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.ticket_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_ticket_number ON public.tickets;
CREATE TRIGGER trg_generate_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

-- 5. Automatic updated_at timestamp triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_buildings_updated_at ON public.buildings;
CREATE TRIGGER trg_buildings_updated_at BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_assets_updated_at ON public.assets;
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON public.tickets;
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_activity_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 7. RLS POLICIES
-- -----------------------------------------------------------------------------

-- --- PROFILES ---
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile basic info"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- --- BUILDINGS ---
CREATE POLICY "Buildings are viewable by all authenticated users"
  ON public.buildings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and facility managers can modify buildings"
  ON public.buildings FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager());

-- --- ROOMS ---
CREATE POLICY "Rooms are viewable by all authenticated users"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and facility managers can modify rooms"
  ON public.rooms FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager());

-- --- ASSETS ---
CREATE POLICY "Assets are viewable by all authenticated users"
  ON public.assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff, technicians and managers can manage assets"
  ON public.assets FOR ALL
  TO authenticated
  USING (public.is_staff_or_above());

-- --- TICKETS ---
CREATE POLICY "Requesters can view their own tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (
    requester_id = auth.uid() OR
    assigned_to = auth.uid() OR
    public.is_staff_or_above()
  );

CREATE POLICY "Any authenticated user can submit a ticket"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = requester_id
  );

CREATE POLICY "Requesters can cancel or update their ticket if submitted"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (
    requester_id = auth.uid() AND status = 'submitted'
  )
  WITH CHECK (
    requester_id = auth.uid()
  );

CREATE POLICY "Technicians and managers can update tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR public.is_admin_or_manager()
  );

CREATE POLICY "Admins can delete tickets"
  ON public.tickets FOR DELETE
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- --- TICKET COMMENTS ---
CREATE POLICY "Users can read comments on tickets they have access to"
  ON public.ticket_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_comments.ticket_id
        AND (
          t.requester_id = auth.uid() AND NOT ticket_comments.is_internal OR
          t.assigned_to = auth.uid() OR
          public.is_staff_or_above()
        )
    )
  );

CREATE POLICY "Authenticated users can add comments to their tickets"
  ON public.ticket_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_comments.ticket_id
        AND (
          t.requester_id = auth.uid() OR
          t.assigned_to = auth.uid() OR
          public.is_staff_or_above()
        )
    )
  );

-- --- TICKET ATTACHMENTS ---
CREATE POLICY "Users can view attachments for tickets they have access to"
  ON public.ticket_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_attachments.ticket_id
        AND (
          t.requester_id = auth.uid() OR
          t.assigned_to = auth.uid() OR
          public.is_staff_or_above()
        )
    )
  );

CREATE POLICY "Users can upload attachments for tickets"
  ON public.ticket_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_attachments.ticket_id
    )
  );

-- --- TICKET ACTIVITY LOGS ---
CREATE POLICY "Users can view activity logs for tickets they access"
  ON public.ticket_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_activity_logs.ticket_id
        AND (
          t.requester_id = auth.uid() OR
          t.assigned_to = auth.uid() OR
          public.is_staff_or_above()
        )
    )
  );

CREATE POLICY "Activity logs can be inserted by system or staff"
  ON public.ticket_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
