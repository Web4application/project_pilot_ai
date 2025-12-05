CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT,
  api_key TEXT UNIQUE,
  plan TEXT DEFAULT 'free'
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE vectors (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id),
  content TEXT,
  embedding vector(1536)
);
