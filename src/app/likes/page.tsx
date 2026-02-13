import { createClient } from "@/lib/supabase/server";
import { getPostStats, getUserPostActions, getRepostedPostInfo } from "@/lib/supabase/actions";
import PostCard from "@/lib/components/post/PostCard";
import styles from "./likes.module.css";
import { Heart } from "lucide-react";
import Link from "next/link";

type PostWithAuthor = {
  id: number;
  comment: string;
  created_at: string;
  user_id: string;
  parent_post_id: number | null;
  quote_of: number | null;
  repost_of: number | null;
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

export default async function LikesPage() {
  const supabase = await createClient();

  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Heart size={28} className={styles.headerIcon} />
          <h1 className={styles.title}>いいね</h1>
        </div>
        <div className={styles.emptyState}>
          <p>ログインしてください</p>
          <Link href="/login" className={styles.loginLink}>
            ログインページへ
          </Link>
        </div>
      </div>
    );
  }

  // ユーザーがいいねした投稿を取得
  const { data: likes } = await supabase
    .from("like")
    .select(`
      post_id,
      post:post (
        id,
        comment,
        created_at,
        user_id,
        parent_post_id,
        quote_of,
        repost_of,
        is_private,
        author:profile!post_user_id_fkey (
          nickname,
          avatar_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const posts = (likes?.map(like => {
    const post = Array.isArray(like.post) ? like.post[0] : like.post;
    if (!post) return null;
    return {
      ...post,
      author: Array.isArray(post.author) ? post.author[0] : post.author
    };
  }).filter(Boolean) || []) as PostWithAuthor[];

  // 各投稿の統計情報とユーザーアクションを取得
  const postsWithStats = await Promise.all(
    posts.map(async (post) => {
      const stats = await getPostStats(post.id, supabase);
      const userActions = await getUserPostActions(post.id, user.id, supabase);
      const parentPost = await getParentPostInfo(supabase, post.parent_post_id);
      const quotedPost = await getQuotedPostInfo(supabase, post.quote_of);
      const repostedPost = await getRepostedPostInfo(post.repost_of, supabase);
      
      const normalizedRepostedPost = repostedPost ? {
        ...repostedPost,
        author: Array.isArray(repostedPost.author) ? repostedPost.author[0] : repostedPost.author
      } : null;
      
      return {
        ...post,
        ...stats,
        ...userActions,
        parent_post: parentPost,
        quoted_post: quotedPost,
        reposted_post: normalizedRepostedPost,
      };
    })
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heart size={28} className={styles.headerIcon} />
        <h1 className={styles.title}>いいね</h1>
      </div>

      {postsWithStats.length === 0 ? (
        <div className={styles.emptyState}>
          <Heart size={48} className={styles.emptyIcon} />
          <p>まだいいねした投稿がありません</p>
        </div>
      ) : (
        <div className={styles.postsContainer}>
          {postsWithStats.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              comment={post.comment}
              nickname={post.author?.nickname ?? "名無し"}
              avatarUrl={post.author?.avatar_url}
              createdAt={post.created_at}
              userId={post.user_id}
              isPrivate={post.is_private}
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
              repostedPost={post.reposted_post ? {
                id: post.reposted_post.id,
                comment: post.reposted_post.comment,
                nickname: post.reposted_post.author?.nickname ?? "名無し",
                avatarUrl: post.reposted_post.author?.avatar_url || null,
                userId: post.reposted_post.user_id,
                createdAt: post.reposted_post.created_at,
              } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
