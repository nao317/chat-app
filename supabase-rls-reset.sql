-- ============================================
-- RLSポリシーのリセット（エラーが出る場合実行）
-- ============================================
-- このSQLをSupabaseのSQLエディタで実行してください
-- 既存のポリシーを削除してから、supabase-rls-policies.sqlを実行してください

-- likeテーブルのポリシーを削除
DROP POLICY IF EXISTS "Anyone can view likes" ON public.like;
DROP POLICY IF EXISTS "Authenticated users can insert their own likes" ON public.like;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.like;

-- bookmarkテーブルのポリシーを削除
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmark;
DROP POLICY IF EXISTS "Authenticated users can insert their own bookmarks" ON public.bookmark;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmark;

-- followテーブルのポリシーを削除
DROP POLICY IF EXISTS "Anyone can view follows" ON public.follow;
DROP POLICY IF EXISTS "Authenticated users can insert their own follows" ON public.follow;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follow;
