ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS payment_method_added BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_mandate_id TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS gstin TEXT;

ALTER TABLE public.users
  ALTER COLUMN trial_ends_at SET DEFAULT (NOW() + INTERVAL '7 days');

-- Update the handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, company_name, profession, business_address, gst_registered, gstin, payment_method_added, payment_method, razorpay_customer_id, razorpay_mandate_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'profession',
    NEW.raw_user_meta_data->>'business_address',
    COALESCE((NEW.raw_user_meta_data->>'gst_registered')::boolean, false),
    NEW.raw_user_meta_data->>'gstin',
    COALESCE((NEW.raw_user_meta_data->>'payment_method_added')::boolean, false),
    NEW.raw_user_meta_data->>'payment_method',
    NEW.raw_user_meta_data->>'razorpay_customer_id',
    NEW.raw_user_meta_data->>'razorpay_mandate_id'
  );

  INSERT INTO public.white_label_settings (freelancer_id)
  VALUES (NEW.id);

  INSERT INTO public.notification_preferences (freelancer_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
