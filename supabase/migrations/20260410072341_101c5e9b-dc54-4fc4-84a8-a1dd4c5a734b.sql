
-- Create invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'submitter',
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations" ON public.invitations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Update handle_new_user to check invitations table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), NEW.email);

  -- Check if user was invited
  SELECT role INTO _role
  FROM public.invitations
  WHERE email = NEW.email AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF _role IS NOT NULL THEN
    -- Use invited role
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
    -- Mark invitation as accepted
    UPDATE public.invitations SET status = 'accepted' WHERE email = NEW.email AND status = 'pending';
  ELSE
    -- Default to submitter
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'submitter');
  END IF;

  RETURN NEW;
END;
$$;
