-- ============================================
-- RLS (Row Level Security) ポリシー設定
-- ============================================
-- このSQLをSupabaseのSQLエディタで実行してください
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- ============================================
-- 1. likeテーブルのRLSポリシー
-- ============================================

-- RLSを有効化
ALTER TABLE public.like ENABLE ROW LEVEL SECURITY;

-- 誰でもいいねを閲覧可能
CREATE POLICY "Anyone can view likes"
ON public.like FOR SELECT
TO public
USING (true);

-- 認証済みユーザーは自分のいいねを追加可能
CREATE POLICY "Authenticated users can insert their own likes"
ON public.like FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 認証済みユーザーは自分のいいねを削除可能
CREATE POLICY "Users can delete their own likes"
ON public.like FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 2. bookmarkテーブルのRLSポリシー
-- ============================================

-- RLSを有効化
ALTER TABLE public.bookmark ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは自分のブックマークのみ閲覧可能
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmark FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 認証済みユーザーは自分のブックマークを追加可能
CREATE POLICY "Authenticated users can insert their own bookmarks"
ON public.bookmark FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 認証済みユーザーは自分のブックマークを削除可能
CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmark FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 3. followテーブルのRLSポリシー
-- ============================================

-- RLSを有効化
ALTER TABLE public.follow ENABLE ROW LEVEL SECURITY;

-- 誰でもフォロー関係を閲覧可能
CREATE POLICY "Anyone can view follows"
ON public.follow FOR SELECT
TO public
USING (true);

-- 認証済みユーザーは自分がフォローする操作のみ可能
CREATE POLICY "Authenticated users can insert their own follows"
ON public.follow FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

-- 認証済みユーザーは自分のフォローを削除可能
CREATE POLICY "Users can delete their own follows"
ON public.follow FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

-- ============================================
-- 4. postテーブルのRLSポリシー（念のため確認）
-- ============================================

-- RLSを有効化（すでに有効な場合はスキップされます）
ALTER TABLE public.post ENABLE ROW LEVEL SECURITY;

-- 誰でも投稿を閲覧可能（まだポリシーがない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post' AND policyname = 'Anyone can view posts'
  ) THEN
    CREATE POLICY "Anyone can view posts"
    ON public.post FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

-- 認証済みユーザーは自分の投稿を作成可能（まだポリシーがない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post' AND policyname = 'Authenticated users can insert posts'
  ) THEN
    CREATE POLICY "Authenticated users can insert posts"
    ON public.post FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 認証済みユーザーは自分の投稿を更新可能（まだポリシーがない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post' AND policyname = 'Users can update their own posts'
  ) THEN
    CREATE POLICY "Users can update their own posts"
    ON public.post FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 認証済みユーザーは自分の投稿を削除可能（まだポリシーがない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'post' AND policyname = 'Users can delete their own posts'
  ) THEN
    CREATE POLICY "Users can delete their own posts"
    ON public.post FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- 5. profileテーブルのRLSポリシー（念のため確認）
-- ============================================

-- RLSを有効化（すでに有効な場合はスキップされます）
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- 誰でもプロフィールを閲覧可能（まだポリシーがない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profile' AND policyname = 'Anyone can view profiles'
  ) THEN
    CREATE POLICY "Anyone can view profiles"
    ON public.profile FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

-- 認証済みユーザーは自分のプロフィールを更新可能（まだポリシーがない場合）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profile' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON public.profile FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;
