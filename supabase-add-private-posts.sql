-- ============================================
-- 投稿に公開/限定モードを追加
-- ============================================
-- このSQLをSupabaseのSQLエディタで実行してください

-- postテーブルにis_privateカラムを追加
ALTER TABLE public.post
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

-- 既存の投稿はすべて公開モードに設定
UPDATE public.post
SET is_private = false
WHERE is_private IS NULL;

-- コメント追加
COMMENT ON COLUMN public.post.is_private IS '限定モード（相互フォローのみ閲覧可能）の場合はtrue';
