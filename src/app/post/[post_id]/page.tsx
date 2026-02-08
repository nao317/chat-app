import { createClient } from "@/lib/supabase/server";
import PostCard from "@/lib/components/post/PostCard";
import { getPostStats, getUserPostActions } from "@/lib/supabase/actions";
import styles from "./postDetail.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{
    post_id: string;
  }>;
};

type PostWithAuthor = {
  id: number;
  comment: string;
  created_at: string;
  user_id: string;
  parent_post_id: number | null;
  quote_of: number | null;
  author: Array<{
    nickname: string;
    avatar_url: string | null;
  }>;
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

export default async function PostDetail({ params }: Props) {
  const supabase = await createClient();
  const { post_id } = await params;

  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  // メイン投稿を取得
  const { data: post, error } = await supabase
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
    .eq("id", post_id)
    .single();

  if (error || !post) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h2>投稿が見つかりません</h2>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={20} />
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  // 返信を取得（再帰的に取得）
  const { data: replies } = await supabase
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
    .eq("parent_post_id", post_id)
    .order("created_at", { ascending: true })
    .returns<PostWithAuthor[]>();

  // 親投稿と引用投稿情報を取得
  const parentPost = await getParentPostInfo(supabase, post.parent_post_id);
  const quotedPost = await getQuotedPostInfo(supabase, post.quote_of);

  // 統計情報とユーザーアクションを取得
  const postStats = await getPostStats(post.id);
  const postActions = await getUserPostActions(post.id, user?.id || null);

  const repliesWithStats = await Promise.all(
    (replies || []).map(async (reply) => {
      const stats = await getPostStats(reply.id);
      const actions = await getUserPostActions(reply.id, user?.id || null);
      const replyQuotedPost = await getQuotedPostInfo(supabase, reply.quote_of);
      return { ...reply, ...stats, ...actions, quoted_post: replyQuotedPost };
    })
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          <ArrowLeft size={24} />
        </Link>
        <h1 className={styles.title}>投稿</h1>
      </div>

      <div className={styles.mainPost}>
        <PostCard
          postId={post.id}
          comment={post.comment}
          nickname={post.author?.[0]?.nickname ?? "名無し"}
          avatarUrl={post.author?.[0]?.avatar_url}
          createdAt={post.created_at}
          userId={post.user_id}
          likeCount={postStats.likeCount}
          repostCount={postStats.repostCount}
          replyCount={postStats.replyCount}
          bookmarkCount={postStats.bookmarkCount}
          isLiked={postActions.isLiked}
          isBookmarked={postActions.isBookmarked}
          isReposted={postActions.isReposted}
          replyToNickname={parentPost?.author?.nickname}
          replyToUserId={parentPost?.user_id}
          quotedPost={quotedPost ? {
            comment: quotedPost.comment,
            nickname: quotedPost.author?.nickname ?? "名無し",
            userId: quotedPost.user_id,
          } : undefined}
        />
      </div>

      {repliesWithStats.length > 0 && (
        <div className={styles.repliesSection}>
          <h2 className={styles.repliesTitle}>返信 ({repliesWithStats.length})</h2>
          <div className={styles.repliesContainer}>
            {repliesWithStats.map((reply) => (
              <PostCard
                key={reply.id}
                postId={reply.id}
                comment={reply.comment}
                nickname={reply.author?.[0]?.nickname ?? "名無し"}
                avatarUrl={reply.author?.[0]?.avatar_url}
                createdAt={reply.created_at}
                userId={reply.user_id}
                likeCount={reply.likeCount}
                repostCount={reply.repostCount}
                replyCount={reply.replyCount}
                bookmarkCount={reply.bookmarkCount}
                isLiked={reply.isLiked}
                isBookmarked={reply.isBookmarked}
                isReposted={reply.isReposted}
                quotedPost={reply.quoted_post ? {
                  comment: reply.quoted_post.comment,
                  nickname: reply.quoted_post.author?.nickname ?? "名無し",
                  userId: reply.quoted_post.user_id,
                } : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
