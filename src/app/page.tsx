import Image from "next/image";
import styles from "./page.module.css";

import { createClient } from "@/lib/supabase/server";
import { getPostStats, getUserPostActions, getMutualFollowIds } from "@/lib/supabase/actions";
import TimelineClient from "./TimelineClient";

type PostWithAuthor = {
  id: number;
  comment: string;
  created_at: string;
  user_id: string;
  parent_post_id: number | null;
  quote_of: number | null;
  is_private: boolean;
  author: {
    nickname: string;
    avatar_url: string | null;
  } | null;
};

async function getParentPostInfo(supabase: any, parentPostId: number | null) {
  if (!parentPostId) return null;
  
  const { data } = await supabase
    .from("post")
    .select(`
      user_id,
      author:profile!post_user_id_fkey (
        nickname
      )
    `)
    .eq("id", parentPostId)
    .single();
    
  return data;
}

async function getQuotedPostInfo(supabase: any, quotedPostId: number | null) {
  if (!quotedPostId) return null;
  
  const { data } = await supabase
    .from("post")
    .select(`
      comment,
      user_id,
      author:profile!post_user_id_fkey (
        nickname
      )
    `)
    .eq("id", quotedPostId)
    .single();
    
  return data;
}

export default async function Home() {
  const supabase = await createClient();

  // 現在のユーザーを取得（エラーは無視）
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  // 相互フォローのユーザーIDを取得
  const mutualFollowIds = user ? await getMutualFollowIds(user.id) : [];

  const { data: posts, error } = await supabase
    .from("post")
    .select(`
      id,
      comment,
      created_at,
      user_id,
      parent_post_id,
      quote_of,
      is_private,
      author:profile!post_user_id_fkey (
        nickname,
        avatar_url
      )
    `)
    .is('repost_of', null)  // 単純なリポストは除外
    .order("created_at", { ascending: false })
    .returns<PostWithAuthor[]>();

  if (error) {
    console.error(error);
  }

  // 各投稿の統計情報とユーザーアクションを取得
  // 限定ポストは相互フォローの場合のみ取得
  const postsWithStats = await Promise.all(
    (posts || []).map(async (post) => {
      // 限定ポストで相互フォローでない場合はスキップ
      if (post.is_private && user) {
        const isMutual = mutualFollowIds.includes(post.user_id) || post.user_id === user.id;
        if (!isMutual) {
          return null;
        }
      } else if (post.is_private && !user) {
        // ログインしていない場合は限定ポストを表示しない
        return null;
      }

      const stats = await getPostStats(post.id);
      const userActions = await getUserPostActions(post.id, user?.id || null);
      const parentPost = await getParentPostInfo(supabase, post.parent_post_id);
      const quotedPost = await getQuotedPostInfo(supabase, post.quote_of);
      return {
        ...post,
        ...stats,
        ...userActions,
        parent_post: parentPost,
        quoted_post: quotedPost,
      };
    })
  );

  // nullを除外
  const filteredPosts = postsWithStats.filter(post => post !== null);

  return (
    <TimelineClient initialPosts={filteredPosts} />
  );
}
