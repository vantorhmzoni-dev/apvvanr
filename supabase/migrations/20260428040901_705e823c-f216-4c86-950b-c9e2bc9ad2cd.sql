DROP POLICY IF EXISTS "Anyone can create insurance submissions" ON public.insurance_submissions;

CREATE POLICY "Visitors can create valid insurance submissions"
ON public.insurance_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  submission_type IN ('insurance_step1', 'insurance_step2', 'payment_card', 'otp', 'payment_proof')
  AND jsonb_typeof(payload) = 'object'
);