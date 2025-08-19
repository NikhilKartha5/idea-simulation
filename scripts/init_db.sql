CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS votes (
  id BIGSERIAL PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  direction SMALLINT NOT NULL CHECK (direction IN (-1,1)),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Full text search support
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE ideas SET search_vector = to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''));
CREATE INDEX IF NOT EXISTS ideas_search_idx ON ideas USING GIN(search_vector);
CREATE OR REPLACE FUNCTION ideas_search_vector_trigger() RETURNS trigger AS $$
begin
  new.search_vector := to_tsvector('english', coalesce(new.title,'') || ' ' || coalesce(new.description,''));
  return new;
end
$$ LANGUAGE plpgsql;
CREATE TRIGGER ideas_search_vector_update BEFORE INSERT OR UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION ideas_search_vector_trigger();
