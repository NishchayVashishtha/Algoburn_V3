-- Drop existing tables
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS compliance_logs CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
  pan VARCHAR(20),
  monthly_income NUMERIC(12,2),
  bank_statement VARCHAR(255),
  consent_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  purged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loans table
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  next_payment DATE,
  credit_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance logs table
CREATE TABLE compliance_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
