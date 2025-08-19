ALTER TABLE votes ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_idea_id_user_id_key;
-- Backfill existing votes to single placeholder user so schema can be enforced.
DO $$
DECLARE placeholder UUID;
BEGIN
  SELECT id INTO placeholder FROM users ORDER BY created_at LIMIT 1;
  IF placeholder IS NULL THEN
    INSERT INTO users (email, password_hash) VALUES ('placeholder@example.com', '$2a$10$abcdefghijklmnopqrstuvabcdefghijklmnopqrstuvabcdefghijklmn') RETURNING id INTO placeholder;
  END IF;
  UPDATE votes SET user_id = placeholder WHERE user_id IS NULL;
END $$;
ALTER TABLE votes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE votes ADD CONSTRAINT votes_idea_id_user_id_key UNIQUE (idea_id, user_id);
