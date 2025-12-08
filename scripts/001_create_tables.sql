-- ゲストカウンター（現在のゲスト番号を管理）
CREATE TABLE IF NOT EXISTS guest_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_number INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 初期値を挿入
INSERT INTO guest_counter (id, current_number) 
VALUES (1, 1) 
ON CONFLICT (id) DO NOTHING;

-- アカウントテーブル
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  password_hash TEXT,
  account_type TEXT CHECK (account_type IN ('guest', 'company', 'driver', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  company_name TEXT,
  license_plate TEXT,
  vehicle_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  tab TEXT CHECK (tab IN ('projects', 'chat')) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  project_name TEXT,
  phone TEXT,
  price TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スレッドテーブル
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BANユーザーテーブル
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  banned_by UUID REFERENCES accounts(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_messages_tab ON messages(tab);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_message_id ON threads(message_id);
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
CREATE INDEX IF NOT EXISTS idx_banned_users_account_id ON banned_users(account_id);

-- RLS (Row Level Security) を有効化
ALTER TABLE guest_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Anyone can read guest_counter" ON guest_counter FOR SELECT USING (true);
CREATE POLICY "Anyone can read accounts" ON accounts FOR SELECT USING (true);
CREATE POLICY "Anyone can read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Anyone can read threads" ON threads FOR SELECT USING (true);
CREATE POLICY "Anyone can read banned_users" ON banned_users FOR SELECT USING (true);

-- 全ユーザーが挿入可能
CREATE POLICY "Anyone can insert accounts" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert threads" ON threads FOR INSERT WITH CHECK (true);

-- 全ユーザーが更新可能
CREATE POLICY "Anyone can update guest_counter" ON guest_counter FOR UPDATE USING (true);
CREATE POLICY "Anyone can update accounts" ON accounts FOR UPDATE USING (true);

-- 管理者のみ削除可能（クライアント側で制御）
CREATE POLICY "Anyone can delete messages" ON messages FOR DELETE USING (true);
CREATE POLICY "Anyone can delete threads" ON threads FOR DELETE USING (true);
CREATE POLICY "Anyone can insert banned_users" ON banned_users FOR INSERT WITH CHECK (true);
