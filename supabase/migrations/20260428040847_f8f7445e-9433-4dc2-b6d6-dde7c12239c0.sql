CREATE TABLE public.insurance_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_type TEXT NOT NULL,
  source_user_id TEXT,
  applicant_name TEXT,
  phone_number TEXT,
  identity_number TEXT,
  coverage_type TEXT,
  policy_start_date DATE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create insurance submissions"
ON public.insurance_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE INDEX idx_insurance_submissions_created_at ON public.insurance_submissions (created_at DESC);
CREATE INDEX idx_insurance_submissions_source_user_id ON public.insurance_submissions (source_user_id);
CREATE INDEX idx_insurance_submissions_submission_type ON public.insurance_submissions (submission_type);