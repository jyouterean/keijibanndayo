-- =============================================
-- Neon Database Schema for Keijiban Board
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- Accounts Table
-- =============================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('company', 'driver', 'admin')),
  company_name VARCHAR(255),
  representative_name VARCHAR(255),
  driver_count VARCHAR(50),
  vehicle_type VARCHAR(50),
  name VARCHAR(255),
  age VARCHAR(10),
  is_admin BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_is_admin ON accounts(is_admin);

-- =============================================
-- Messages Table
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  nickname VARCHAR(100) NOT NULL,
  content TEXT,
  tab VARCHAR(20) NOT NULL CHECK (tab IN ('projects', 'chat')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  project_name VARCHAR(255),
  phone VARCHAR(20),
  price VARCHAR(50),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_tab ON messages(tab);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- =============================================
-- Threads Table
-- =============================================
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  nickname VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_message_id ON threads(message_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at);

-- =============================================
-- Banned Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  nickname VARCHAR(100) NOT NULL,
  banned_by VARCHAR(100) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banned_users_account_id ON banned_users(account_id);

-- =============================================
-- Guest Counter Table
-- =============================================
CREATE TABLE IF NOT EXISTS guest_counter (
  id INTEGER PRIMARY KEY,
  current_number INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize guest counter
INSERT INTO guest_counter (id, current_number) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;
