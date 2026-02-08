# タイムライン改善とテーマ切り替え機能

## 実装した機能

### 1. 投稿モードの追加
- **公開モード**: 全ユーザーが閲覧可能
- **限定モード**: 相互フォローしているユーザーのみ閲覧可能

### 2. タイムラインのタブ切り替え
- **グローバルタブ**: 公開ポストのみ表示
- **限定ポストタブ**: 相互フォローしているユーザーの限定ポストのみ表示

### 3. ダーク/ライトテーマの切り替え
- 画面右上のボタンでテーマを切り替え可能
- 選択したテーマはローカルストレージに保存
- システム設定も自動検出

## セットアップ手順

### 1. データベースの更新

Supabaseダッシュボードで以下のSQLファイルを実行してください：

1. **投稿に`is_private`カラムを追加**
   - ファイル: `supabase-add-private-posts.sql`
   - SQLエディタで実行: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

```sql
-- supabase-add-private-posts.sqlの内容を実行
ALTER TABLE public.post
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;

UPDATE public.post
SET is_private = false
WHERE is_private IS NULL;
```

### 2. アプリケーションの起動

```bash
npm run dev
```

## 使い方

### 投稿する

1. ホーム画面の投稿フォームにコメントを入力
2. 公開/限定ボタンで投稿モードを選択
   - 🌐 **公開**: 全員が見られる
   - 🔒 **限定**: 相互フォローのみ
3. 「投稿する」ボタンをクリック

### タイムラインの切り替え

- **グローバルタブ**: 全ての公開投稿を表示
- **限定ポストタブ**: 相互フォローしているユーザーの限定投稿を表示

### テーマの切り替え

- 画面右上の 🌙/☀️ ボタンをクリック
- ダークモード ⇔ ライトモード

## 新規作成ファイル

- `supabase-add-private-posts.sql` - DB更新用SQL
- `src/lib/components/theme/ThemeToggle.tsx` - テーマ切り替えボタン
- `src/lib/components/theme/ThemeToggle.module.css` - スタイル
- `src/lib/components/timeline/TimelineTabs.tsx` - タブコンポーネント
- `src/lib/components/timeline/TimelineTabs.module.css` - スタイル
- `src/app/TimelineClient.tsx` - タイムラインクライアントコンポーネント

## 更新ファイル

- `src/app/page.tsx` - タブフィルタリング機能追加
- `src/app/layout.tsx` - テーマ切り替えボタン追加
- `src/app/globals.css` - ダークテーマ対応
- `src/lib/components/post/PostForm.tsx` - 公開/限定選択機能追加
- `src/lib/components/post/PostForm.module.css` - スタイル更新
- `src/lib/supabase/actions.ts` - 相互フォロー取得関数追加

## 技術仕様

### 限定ポストの仕様

- 相互フォロー: フォローし合っているユーザー間のみ閲覧可能
- 自分の投稿: 限定モードでも自分の投稿は常に表示
- ログアウト時: 限定ポストは一切表示されない

### テーマ切り替えの仕様

- `data-theme` 属性を使用
- `localStorage` に保存
- システム設定を自動検出 (`prefers-color-scheme`)
