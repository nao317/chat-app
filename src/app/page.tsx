import Image from "next/image";
import styles from "./page.module.css";

import PostCard from "@/lib/components/post/PostCard";
import PostForm from "@/lib/components/post/PostForm";
import { createClient } from "@/lib/supabase/server";
import { getPostStats, getUserPostActions } from "@/lib/supabase/actions";

type PostWithAuthor = {
  id: number;
  comment: string;
  created_at: string;
  user_id: string;
  parent_post_id: number | null;
  quote_of: number | null;
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

  const { data: posts, error } = await supabase
    .from("post")
    .select(`
      id,
      comment,
      created_at,
      user_id,
      parent_post_id,
      quote_of,
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
  const postsWithStats = await Promise.all(
    (posts || []).map(async (post) => {
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

  return (
    <div className={styles.container}>
      <PostForm />
      <div className={styles.postsContainer}>
        {postsWithStats?.map((post) => (
          <PostCard
            key={post.id}
            postId={post.id}
            comment={post.comment}
            nickname={post.author?.nickname ?? "名無し"}
            avatarUrl={post.author?.avatar_url}
            createdAt={post.created_at}
            userId={post.user_id}
            likeCount={post.likeCount}
            repostCount={post.repostCount}
            replyCount={post.replyCount}
            bookmarkCount={post.bookmarkCount}
            isLiked={post.isLiked}
            isBookmarked={post.isBookmarked}
            isReposted={post.isReposted}
            replyToNickname={post.parent_post?.author?.nickname}
            replyToUserId={post.parent_post?.user_id}
            quotedPost={post.quoted_post ? {
              comment: post.quoted_post.comment,
              nickname: post.quoted_post.author?.nickname ?? "名無し",
              userId: post.quoted_post.user_id,
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
