CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  code VARCHAR(4) NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  hero_url VARCHAR(255),
  country_id INTEGER REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS attractions (
  id SERIAL PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  thumbnail_url VARCHAR(255)
);